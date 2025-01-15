use actix_web::{Error, FromRequest, HttpMessage, HttpRequest}; // Add HttpMessage import
use chrono::{Duration, Utc};
use dotenv::dotenv;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, TokenData, Validation};
use serde::{Deserialize, Serialize};
use std::env;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Claims {
    pub exp: usize, // Expiration time
    pub iat: usize, // Issued at time
    pub uuid: Uuid, // User unique identifier
}

impl FromRequest for Claims {
    type Error = Error;
    type Future = std::future::Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> std::future::Ready<Result<Claims, Self::Error>> {
        match req.extensions().get::<Claims>() {
            Some(claim) => std::future::ready(Ok(claim.clone())),
            None => std::future::ready(Err(actix_web::error::ErrorBadRequest("Bad Claims"))),
        }
    }
}

/// Encodes a JWT with the given user UUID, setting an expiration time of 24 hours.
pub fn encode_jwt(uuid: &Uuid) -> Result<String, jsonwebtoken::errors::Error> {
    dotenv().ok(); // Load environment variables from `.env` file
    let now = Utc::now();
    let expire = Duration::hours(24); // JWT expiration time

    let claims = Claims {
        exp: (now + expire).timestamp() as usize,
        iat: now.timestamp() as usize,
        uuid: *uuid,
    };

    let secret = env::var("SECRET").unwrap_or_else(|_| "notsosecuresecret".to_string()); // Use a default secret if not set

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_ref()),
    )
}

/// Decodes a JWT and returns the claims embedded within the token.
pub fn decode_jwt(jwt: String) -> Result<TokenData<Claims>, jsonwebtoken::errors::Error> {
    let secret = env::var("SECRET").unwrap_or_else(|_| "notsosecuresecret".to_string()); // Secret used for decoding

    decode(
        &jwt,
        &DecodingKey::from_secret(secret.as_ref()),
        &Validation::default(),
    )
}
