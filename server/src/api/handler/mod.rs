pub mod auth_routes;
pub mod poll_routes;

use actix_web::http::StatusCode;
use thiserror::Error;
use webauthn_rs::prelude::WebauthnError;

pub mod middleware;

type WebResult<T> = Result<T, Error>;

/**
Unified errors for simpler Responses
*/
#[derive(Debug, Error)]
pub(crate) enum Error {
    #[error("Unknown webauthn error: {0}")]
    Unknown(WebauthnError),
    #[error("Corrupt session")]
    CorruptSession,
    #[error("Bad request: {0}")]
    BadRequest(#[from] WebauthnError),
    #[error("Database error: {0}")]
    Database(String),
    #[error("User not found")]
    UserNotFound,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    #[error("Token error: {0}")]
    Token(String),
}
impl actix_web::ResponseError for Error {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}
