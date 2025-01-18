use crate::models::poll_models::VotingPoll;
use crate::models::poll_models::VotingPollInput;
use async_trait::async_trait;

/// A repository trait for managing polls.
///
/// Provides an abstraction layer to perform CRUD operations on polls.
#[async_trait]
pub trait PollRepository: Send + Sync {
    /// Creates a new poll.
    ///
    /// # Arguments
    /// * `poll` - The `Poll` instance to create.
    ///
    /// # Returns
    /// * `Ok(Poll)` - The created poll.
    /// * `Err` - An error if the creation fails.
    async fn create_poll(
        &self,
        poll: VotingPollInput,
    ) -> Result<VotingPoll, Box<dyn std::error::Error>>;

    /// Fetches all polls.
    ///
    /// # Returns
    /// * `Ok(Vec<Poll>)` - A list of all polls.
    /// * `Err` - An error if the fetch operation fails.
    async fn fetch_all(&self) -> Result<Vec<VotingPoll>, Box<dyn std::error::Error>>;

    /// Retrieves a poll by its ID.
    ///
    /// # Arguments
    /// * `poll_id` - The unique ID of the poll.
    ///
    /// # Returns
    /// * `Ok(Some(Poll))` - The poll if found.
    /// * `Ok(None)` - If no poll exists with the given ID.
    /// * `Err` - An error if the retrieval fails.
    async fn get_poll(
        &self,
        poll_id: i64,
    ) -> Result<Option<VotingPoll>, Box<dyn std::error::Error + Send + Sync>>;

    /// Updates a poll's status or other attributes.
    ///
    /// # Arguments
    /// * `poll_id` - The unique ID of the poll.
    /// * `target` - The update target, e.g., "reset" or "close".
    ///
    /// # Returns
    /// * `Ok(())` - If the update is successful.
    /// * `Err` - An error if the update fails.
    async fn update_poll(
        &self,
        poll_id: i64,
        target: String,
    ) -> Result<(), Box<dyn std::error::Error>>;

    /// Deletes a poll by its ID.
    ///
    /// # Arguments
    /// * `poll_id` - The unique ID of the poll.
    ///
    /// # Returns
    /// * `Ok(())` - If the deletion is successful.
    /// * `Err` - An error if the deletion fails.
    async fn delete_poll(&self, poll_id: i64) -> Result<(), Box<dyn std::error::Error>>;

    /// Registers a vote for a poll option.
    ///
    /// # Arguments
    /// * `poll_id` - The unique ID of the poll.
    /// * `option_id` - The ID of the poll option being voted on.
    /// * `username` - The name of the user casting the vote.
    ///
    /// # Returns
    /// * `Ok(())` - If the vote is successfully recorded.
    /// * `Err` - An error if the vote fails.
    async fn vote_poll(
        &self,
        poll_id: i64,
        option_id: i64,
        username: String,
    ) -> Result<(), Box<dyn std::error::Error>>;
}
