use crate::models::user_models::{User, Votes};
use async_trait::async_trait;

#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn create_user(&self, user: User) -> Result<User, Box<dyn std::error::Error>>;

    async fn get_user(
        &self,
        user_name: String,
    ) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>>;

    async fn update_user(
        &self,
        user_name: String,
        vote: Votes,
    ) -> Result<(), Box<dyn std::error::Error>>;

    async fn delete_user(&self, user_id: String) -> Result<(), Box<dyn std::error::Error>>;

    async fn has_voted(
        &self,
        user_name: String,
        poll_id: i64,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>>;
}
