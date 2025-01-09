use actix_web::{HttpResponse, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("MongoDB error: {0}")]
    MongoError(#[from] mongodb::error::Error),
    #[error("Record not found")]
    NotFound,
    #[error("Invalid ID format")]
    InvalidId,
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::MongoError(e) => {
                HttpResponse::InternalServerError().json(format!("Database error: {}", e))
            }
            ApiError::NotFound => HttpResponse::NotFound().json("Record not found"),
            ApiError::InvalidId => HttpResponse::BadRequest().json("Invalid ID format"),
        }
    }
}
