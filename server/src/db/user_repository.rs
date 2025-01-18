use crate::models::user_models::{User, Votes};
use async_trait::async_trait;

/// A repository trait for managing users.
///
/// Provides an abstraction layer to perform CRUD operations on user data.
#[async_trait]
pub trait UserRepository: Send + Sync {
    /// Creates a new user.
    ///
    /// # Arguments
    /// * `user` - The `User` instance to create.
    ///
    /// # Returns
    /// * `Ok(User)` - The created user.
    /// * `Err` - An error if the creation fails.
    async fn create_user(&self, user: User) -> Result<User, Box<dyn std::error::Error>>;

    /// Retrieves a user by their username.
    ///
    /// # Arguments
    /// * `user_name` - The username of the user.
    ///
    /// # Returns
    /// * `Ok(Some(User))` - The user if found.
    /// * `Ok(None)` - If no user exists with the given username.
    /// * `Err` - An error if the retrieval fails.
    async fn get_user(
        &self,
        user_name: String,
    ) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>>;

    /// Updates a user's vote information.
    ///
    /// # Arguments
    /// * `user_name` - The username of the user.
    /// * `vote` - The `Votes` instance to add to the user's record.
    ///
    /// # Returns
    /// * `Ok(())` - If the update is successful.
    /// * `Err` - An error if the update fails.
    async fn update_user(
        &self,
        user_name: String,
        vote: Votes,
    ) -> Result<(), Box<dyn std::error::Error>>;

    /// Deletes a user by their ID.
    ///
    /// # Arguments
    /// * `user_id` - The unique ID of the user.
    ///
    /// # Returns
    /// * `Ok(())` - If the deletion is successful.
    /// * `Err` - An error if the deletion fails.
    async fn delete_user(&self, user_id: String) -> Result<(), Box<dyn std::error::Error>>;

    async fn has_voted(
        &self,
        user_name: String,
        poll_id: i64,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>>;
}
