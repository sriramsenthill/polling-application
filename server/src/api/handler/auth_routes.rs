use crate::api::handler::{Error, WebResult};
use crate::db::user_repository::UserRepository;
use crate::models::auth_jwt::encode_jwt;
use crate::models::{
    authentication_state::AuthenticationState, registration_state::RegistrationState,
    user_models::User,
};
use actix_web::error::ErrorInternalServerError;
use actix_web::post;
use actix_web::web::{Data, Json, Path};
use actix_web::HttpResponse;
use log::info;
use serde_json::json;
use webauthn_rs::prelude::*;

#[post("start_reg/{username}")]
pub(crate) async fn start_register(
    username: Path<String>,
    reg_state_storage: Data<RegistrationState>,
    webauthn: Data<Webauthn>,
) -> WebResult<Json<CreationChallengeResponse>> {
    info!("Start register");

    // Optionally remove the previous state if necessary
    // reg_state_storage.remove("reg_state".to_string()).await;

    let username = username.into_inner();
    let user_unique_id = Uuid::new_v4();
    let exclude_credentials = { None };
    println!("exclude creds : {:#?}", exclude_credentials);

    let (ccr, reg_state) = webauthn
        .start_passkey_registration(user_unique_id, &username, &username, exclude_credentials)
        .map_err(|e| {
            info!("challenge_register -> {:?}", e);
            Error::Unknown(e)
        })?;
    info!(
        "Inserting reg_state into session: {:?}",
        (username.clone(), user_unique_id, reg_state.clone())
    );

    // Log before storing
    println!("Storing registration state: {:?}", reg_state);

    reg_state_storage
        .insert((username.to_string(), user_unique_id, reg_state.clone()))
        .await;

    println!("{:#?}", reg_state);
    info!("Registration Successful!");
    Ok(Json(ccr))
}
#[post("finish_reg")]
pub(crate) async fn finish_register(
    req: Json<RegisterPublicKeyCredential>,
    reg_state_storage: Data<RegistrationState>,
    db: Data<dyn UserRepository>,
    webauthn: Data<Webauthn>,
) -> HttpResponse {
    println!("Entered finish reg");

    // Attempt to retrieve the registration state
    let registration_state = match reg_state_storage.get("reg_state".to_string()).await {
        Some(state) => state,
        None => {
            eprintln!("Registration state not found for user ID.");
            return HttpResponse::BadRequest().body("Corrupt or missing session state");
        }
    };

    let (username, user_unique_id, reg_state) = registration_state;

    // Attempt to complete the passkey registration
    let final_keys = match webauthn.finish_passkey_registration(&req, &reg_state) {
        Ok(keys) => keys,
        Err(e) => {
            info!("Error finishing passkey registration: {:?}", e);
            return HttpResponse::BadRequest().body("Failed to finish registration");
        }
    };

    // Create the new user object
    let user = User {
        user_id: user_unique_id.to_string(),
        user_name: username.clone(),
        keys: vec![final_keys],
        owned_polls: None,
        polls_voted: None,
    };

    // Attempt to store the user in the database
    match db.create_user(user).await {
        Ok(_) => {
            println!("User successfully registered: {}", username);
            HttpResponse::Ok().body("Registration successful")
        }
        Err(err) => {
            eprintln!("Database error while creating user: {}", err);
            HttpResponse::InternalServerError().body("Error storing user in the database")
        }
    }
}

#[post("start_auth/{username}")]
pub(crate) async fn start_authentication(
    username: Path<String>,
    db: Data<dyn UserRepository>,
    auth_state_store: Data<AuthenticationState>,
    webauthn: Data<Webauthn>,
) -> HttpResponse {
    info!("Start Authentication");
    auth_state_store.remove("auth_state".to_string()).await;

    match db.get_user(username.to_string()).await {
        Ok(user_doc) => {
            if let Some(user) = user_doc {
                match Uuid::parse_str(user.user_id.as_str()) {
                    Ok(user_unique_id) => {
                        let allow_credentials = user.keys;
                        match webauthn.start_passkey_authentication(&allow_credentials) {
                            Ok((rcr, auth_state)) => {
                                auth_state_store
                                    .insert((user_unique_id, auth_state.clone()))
                                    .await;

                                // Return a successful response with the JSON payload
                                HttpResponse::Ok().json(rcr)
                            }
                            Err(e) => {
                                // Log and return an error response if authentication fails
                                info!("Authentication failed: {:?}", e);
                                HttpResponse::InternalServerError()
                                    .json(format!("Authentication failed: {:?}", e))
                            }
                        }
                    }
                    Err(e) => {
                        // Return error response if user ID parsing fails
                        info!("Invalid user ID format: {}", e);
                        HttpResponse::BadRequest().json(format!("Invalid user ID format: {}", e))
                    }
                }
            } else {
                // Return an error if user is not found
                info!("User not found");
                HttpResponse::NotFound().json("User not found")
            }
        }
        Err(err) => {
            // Handle database errors or failure to fetch the user
            info!("Error fetching user: {}", err);
            HttpResponse::InternalServerError().json(format!("Error fetching user: {}", err))
        }
    }
}
#[post("/finish_auth/{username}")]
pub(crate) async fn finish_authentication(
    auth: Json<PublicKeyCredential>,
    username: Path<String>,
    auth_state_store: Data<AuthenticationState>,
    db: Data<dyn UserRepository>,
    webauthn: Data<Webauthn>,
) -> WebResult<HttpResponse> {
    println!("Entered finish auth");

    // Retrieve the authentication state
    let auth_state = auth_state_store
        .get("auth_state".to_string())
        .await
        .ok_or_else(|| {
            eprintln!("Registration state not found for user ID");
            Error::CorruptSession
        })?;

    let username = username.into_inner();
    let (user_unique_id, auth_state) = auth_state;

    // Authenticate using the passkey
    let auth_result = webauthn
        .finish_passkey_authentication(&auth, &auth_state)
        .map_err(|e| {
            info!("challenge_register -> {:?}", e);
            Error::BadRequest(e)
        })?;

    // Fetch the user from the database
    let user_doc = db.get_user(username.clone()).await;

    // Handle the case where the user is not found or there was an error fetching the user
    if let Err(err) = user_doc {
        let resp_body = json!({
            "error": format!("Error fetching user: {}", err),
        });
        return Ok(HttpResponse::InternalServerError().json(resp_body));
    }

    if let Some(mut user) = user_doc.unwrap() {
        // Update the credentials for the user
        user.keys.iter_mut().for_each(|key| {
            key.update_credential(&auth_result);
        });
        // temporary workaround
        db.delete_user(user_unique_id.to_string()).await.unwrap();
        db.create_user(user).await.unwrap();

        info!("Authentication Successful!");

        // Generate JWT token
        let token =
            encode_jwt(&user_unique_id).map_err(|err| ErrorInternalServerError(err.to_string()));

        let resp_body = match token {
            Ok(token) => json!({
                "token": token,
            }),
            Err(e) => json!({
                "error": format!("Error generating token: {}", e),
            }),
        };

        println!("{:#?}", resp_body);
        Ok(HttpResponse::Ok().json(resp_body))
    } else {
        // User not found in DB
        let resp_body = json!({
            "error": "User not found",
        });
        Ok(HttpResponse::NotFound().json(resp_body))
    }
}
