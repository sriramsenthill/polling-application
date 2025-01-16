use crate::db::{db_config::DbConfig, poll_repository::PollRepository};
use crate::models::poll_models::VotingPoll;

use futures::TryStreamExt;
use mongodb::{
    bson::doc,
    options::{ClientOptions, UpdateOptions},
    Client, Collection,
};
use std::sync::Arc;

#[derive(Clone)]
pub struct MongoPollRepo {
    collection: Collection<VotingPoll>,
}

impl MongoPollRepo {
    /// Creates a new `MongoPollRepo` instance.
    pub async fn new(config: &DbConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let client_options = ClientOptions::parse(&config.connection_string).await?;
        let client = Client::with_options(client_options)?;
        let database = client.database(&config.database_name);
        let collection = database.collection("polls");

        Ok(MongoPollRepo { collection })
    }
}

#[async_trait::async_trait]
impl PollRepository for MongoPollRepo {
    async fn create_poll(
        &self,
        poll: VotingPoll,
    ) -> Result<VotingPoll, Box<dyn std::error::Error>> {
        println!("Creating Poll: {:#?}", poll);

        // Check if a poll with the same ID already exists
        if let Some(_) = self
            .collection
            .find_one(doc! { "poll_id": &poll.poll_id }, None)
            .await?
        {
            return Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::AlreadyExists,
                "Poll ID already exists. Try creating a poll with a different ID.",
            )));
        }

        // Insert the new poll
        self.collection.insert_one(&poll, None).await.map_err(|e| {
            eprintln!("Error inserting poll: {}", e);
            e
        })?;

        println!("Poll created successfully.");
        Ok(poll)
    }

    async fn fetch_all(&self) -> Result<Vec<VotingPoll>, Box<dyn std::error::Error>> {
        let cursor = self.collection.find(None, None).await?;
        let polls: Vec<VotingPoll> = cursor.try_collect().await?;

        println!("Fetched {} polls.", polls.len());
        Ok(polls)
    }

    async fn get_poll(
        &self,
        poll_id: i64,
    ) -> Result<Option<VotingPoll>, Box<dyn std::error::Error + Send + Sync>> {
        let filter = doc! { "poll_id": poll_id };
        let poll = self.collection.find_one(filter, None).await?;

        if poll.is_none() {
            eprintln!("No poll found with ID: {}", poll_id);
        }

        Ok(poll)
    }

    async fn update_poll(
        &self,
        poll_id: i64,
        target: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let filter = doc! { "poll_id": poll_id };
        let update = match target.as_str() {
            "reset" => doc! { "$set": { "options.$[].votes": 0 } },
            "close" => doc! { "$set": { "status": "closed" } },
            _ => {
                return Err(format!("Invalid target: {}", target).into());
            }
        };

        self.collection.update_one(filter, update, None).await?;
        println!("Poll with ID {} updated successfully.", poll_id);
        Ok(())
    }

    async fn delete_poll(&self, poll_id: i64) -> Result<(), Box<dyn std::error::Error>> {
        let filter = doc! { "poll_id": poll_id };
        self.collection.delete_one(filter, None).await?;
        println!("Poll with ID {} deleted successfully.", poll_id);
        Ok(())
    }

    async fn vote_poll(
        &self,
        poll_id: i64,
        option_id: i64,
        username: String,
    ) -> Result<(), Box<dyn std::error::Error>> {
        println!("Doing the voting{}", option_id);
        let filter = doc! { "poll_id": poll_id, "status": "active" };
        let update = doc! {
            "$inc": { "options.$[elem].votes": 1 },
            "$push": { "users_voted": username }
        };
        let array_filters = vec![doc! { "elem.option_id": option_id }];
        let options = UpdateOptions::builder()
            .array_filters(array_filters)
            .build();

        let result = self.collection.update_one(filter, update, options).await?;

        match result.matched_count {
            0 => eprintln!("No matching poll or option found."),
            _ => {
                println!(
                    "Vote for poll ID {} and option ID {} recorded successfully.",
                    poll_id, option_id
                );
            }
        }

        Ok(())
    }
}
