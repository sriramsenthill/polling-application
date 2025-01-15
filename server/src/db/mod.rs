pub mod db_config;
pub mod mongo_poll_repo;
pub mod mongo_user_repo;
pub mod poll_repository;
pub mod user_repository;

use crate::db::{mongo_poll_repo::MongoPollRepo, poll_repository::PollRepository};
use db_config::DbConfig;
use mongo_user_repo::MongoUserRepo;
use user_repository::UserRepository;

/// Initializes the poll repository based on the provided database configuration.
///
/// # Arguments
/// * `config` - The `DbConfig` containing database type and connection details.
///
/// # Returns
/// * An instance of a type implementing `PollRepository`.
///
/// # Panics
/// * If the database type is unsupported.
pub async fn init_poll_repo(
    config: DbConfig,
) -> Result<impl PollRepository, Box<dyn std::error::Error>> {
    match config.db_type.as_str() {
        "mongodb" => MongoPollRepo::new(&config).await,
        _ => panic!("Unsupported database type: {}", config.db_type),
    }
}

/// Initializes the user repository based on the provided database configuration.
///
/// # Arguments
/// * `config` - The `DbConfig` containing database type and connection details.
///
/// # Returns
/// * An instance of a type implementing `UserRepository`.
///
/// # Panics
/// * If the database type is unsupported.
pub async fn init_user_repo(
    config: DbConfig,
) -> Result<impl UserRepository, Box<dyn std::error::Error>> {
    match config.db_type.as_str() {
        "mongodb" => MongoUserRepo::new(&config).await,
        _ => panic!("Unsupported database type: {}", config.db_type),
    }
}
