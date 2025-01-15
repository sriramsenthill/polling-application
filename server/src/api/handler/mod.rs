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
    #[error("Unknown webauthn error")]
    Unknown(WebauthnError),
    #[error("Corrupt session")]
    CorruptSession,
    #[error("Bad request")]
    BadRequest(#[from] WebauthnError),
}

impl actix_web::ResponseError for Error {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}
