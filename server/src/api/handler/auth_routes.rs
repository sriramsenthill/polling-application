use actix_web::{
    error::ErrorInternalServerError,
    post,
    web::{Data, Json, Path},
    HttpResponse,
};
use log::{error, info};
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;
use webauthn_rs::prelude::*;

use crate::{
    api::handler::{Error, WebResult},
    db::user_repository::UserRepository,
    models::{
        auth_jwt::encode_jwt, authentication_state::AuthenticationState,
        registration_state::RegistrationState, user_models::User,
    },
};

#[derive(Debug, Serialize)]
struct AuthenticationResponse {
    token: String,
}

#[derive(Debug, Deserialize)]
struct RegistrationRequest {
    username: String,
}

/// WebAuthn registration endpoints
pub mod registration {
    use super::*;

    #[post("start_reg/{username}")]
    pub(crate) async fn start(
        username: Path<String>,
        reg_state_storage: Data<RegistrationState>,
        webauthn: Data<Webauthn>,
    ) -> WebResult<Json<CreationChallengeResponse>> {
        info!("Starting registration for user: {}", username);

        let username = username.into_inner();
        let user_unique_id = Uuid::new_v4();

        let (challenge_response, reg_state) = webauthn
            .start_passkey_registration(user_unique_id, &username, &username, None)
            .map_err(|e| {
                error!("Failed to start registration: {:?}", e);
                Error::Unknown(e)
            })?;

        info!("Storing registration state for user: {}", username);
        reg_state_storage
            .insert((username, user_unique_id, reg_state))
            .await;

        Ok(Json(challenge_response))
    }

    #[post("finish_reg")]
    pub(crate) async fn finish(
        req: Json<RegisterPublicKeyCredential>,
        reg_state_storage: Data<RegistrationState>,
        db: Data<dyn UserRepository>,
        webauthn: Data<Webauthn>,
    ) -> WebResult<HttpResponse> {
        let registration_state = reg_state_storage
            .get("reg_state".to_string())
            .await
            .map_err(|_| Error::CorruptSession)?;

        let (username, user_unique_id, reg_state) = registration_state;

        let passkey = webauthn
            .finish_passkey_registration(&req, &reg_state)
            .map_err(|e| {
                error!("Failed to finish registration: {:?}", e);
                Error::BadRequest(e)
            })?;

        let user = User {
            user_id: user_unique_id.to_string(),
            user_name: username.clone(),
            keys: vec![passkey],
            owned_polls: None,
            polls_voted: None,
        };

        db.create_user(user)
            .await
            .map_err(|e| Error::Database(e.to_string()))?;

        info!("Successfully registered user: {}", username);
        Ok(HttpResponse::Ok().json("Registration successful"))
    }
}

/// WebAuthn authentication endpoints
pub mod authentication {
    use super::*;

    #[post("start_auth/{username}")]
    pub(crate) async fn start(
        username: Path<String>,
        db: Data<dyn UserRepository>,
        auth_state_store: Data<AuthenticationState>,
        webauthn: Data<Webauthn>,
    ) -> WebResult<HttpResponse> {
        info!("Starting authentication for user: {}", username);

        // Clean up any existing auth state
        auth_state_store.remove("auth_state".to_string()).await;

        let user = db
            .get_user(username.to_string())
            .await
            .map_err(|_| Error::CorruptSession)?
            .ok_or(Error::UserNotFound)?;

        let user_unique_id = Uuid::parse_str(&user.user_id)
            .map_err(|e| Error::InvalidInput(format!("Invalid user ID: {}", e)))?;

        let (challenge_response, auth_state) = webauthn
            .start_passkey_authentication(&user.keys)
            .map_err(|e| {
                error!("Failed to start authentication: {:?}", e);
                Error::Unknown(e)
            })?;

        auth_state_store.insert((user_unique_id, auth_state)).await;

        Ok(HttpResponse::Ok().json(challenge_response))
    }

    #[post("/finish_auth/{username}")]
    pub(crate) async fn finish(
        auth: Json<PublicKeyCredential>,
        username: Path<String>,
        auth_state_store: Data<AuthenticationState>,
        db: Data<dyn UserRepository>,
        webauthn: Data<Webauthn>,
    ) -> WebResult<HttpResponse> {
        let auth_state = auth_state_store
            .get("auth_state".to_string())
            .await
            .map_err(|_| Error::CorruptSession)?;

        let (user_unique_id, auth_state) = auth_state;

        let auth_result = webauthn
            .finish_passkey_authentication(&auth, &auth_state)
            .map_err(|e| Error::BadRequest(e))?;

        let mut user = db
            .get_user(username.into_inner())
            .await
            .map_err(|_| Error::CorruptSession)?
            .ok_or(Error::UserNotFound)?;

        // Update user credentials
        user.keys.iter_mut().for_each(|key| {
            key.update_credential(&auth_result);
        });

        db.delete_user(user_unique_id.to_string()).await.unwrap();
        db.create_user(user).await.unwrap();

        info!("Authentication Successful!");

        // Generate JWT token
        let token = encode_jwt(&user_unique_id)
            .map_err(|e| Error::Token(format!("Failed to generate token: {}", e)))?;

        info!("Successfully authenticated user");
        Ok(HttpResponse::Ok().json(AuthenticationResponse { token }))
    }
}
