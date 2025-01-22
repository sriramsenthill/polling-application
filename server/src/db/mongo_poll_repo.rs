use crate::db::mongo_user_repo::MongoUserRepo;
use crate::db::{db_config::DbConfig, poll_repository::PollRepository};
use crate::models::poll_models::{PollOption, PollStatus, VotingPoll, VotingPollInput};

use chrono::Utc;
use futures::TryStreamExt;
use mongodb::{
    bson::doc,
    options::{ClientOptions, UpdateOptions},
    Client, Collection,
};

#[derive(Clone)]
pub struct MongoPollRepo {
    collection: Collection<VotingPoll>,
    config: DbConfig, // Add this field
}

impl MongoPollRepo {
    /// Creates a new `MongoPollRepo` instance.
    pub async fn new(config: &DbConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let client_options = ClientOptions::parse(&config.connection_string).await?;
        let client = Client::with_options(client_options)?;
        let database = client.database(&config.database_name);
        let collection = database.collection("polls");

        Ok(MongoPollRepo {
            collection,
            config: config.clone(), // Initialize the config field
        })
    }

    async fn get_next_poll_id(&self) -> Result<i64, Box<dyn std::error::Error>> {
        // Find the highest poll_id and increment it
        let options = mongodb::options::FindOptions::builder()
            .sort(doc! { "poll_id": -1 })
            .limit(1)
            .build();

        if let Some(last_poll) = self
            .collection
            .find(None, options)
            .await?
            .try_next()
            .await?
        {
            if let Some(last_id) = last_poll.poll_id {
                return Ok(last_id + 1);
            }
        }

        // If no polls exist, start with ID 1
        Ok(1)
    }
}

#[async_trait::async_trait]
impl PollRepository for MongoPollRepo {
    async fn create_poll(
        &self,
        poll_input: VotingPollInput,
    ) -> Result<VotingPoll, Box<dyn std::error::Error>> {
        println!("Creating Poll from input: {:#?}", poll_input);

        // Generate the next poll ID
        let next_id = self.get_next_poll_id().await?;

        // Transform options with auto-generated IDs and zero votes
        let options: Vec<PollOption> = poll_input
            .options
            .into_iter()
            .enumerate()
            .map(|(index, option)| PollOption {
                option_id: (index + 1) as i64,
                text: option.text,
                votes: 0,
            })
            .collect();

        // Create the complete poll with server-side defaults
        let poll = VotingPoll {
            poll_id: Some(next_id),
            title: poll_input.title,
            creator: poll_input.creator.clone(),
            description: poll_input.description,
            created_at: Utc::now(),
            expiration_date: poll_input.expiration_date,
            status: PollStatus::Active,
            options,
            users_voted: Vec::new(),
        };

        // Insert the new poll
        self.collection.insert_one(&poll, None).await.map_err(|e| {
            eprintln!("Error inserting poll: {}", e);
            e
        })?;

        println!("Poll created successfully with ID: {}", next_id);

        // Update the creator's owned_polls
        let user_repo = MongoUserRepo::new(&self.config).await?;
        user_repo
            .add_owned_poll(&poll_input.creator, next_id)
            .await?;

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
        println!("Recording vote for option {}", option_id);

        let filter = doc! {
            "poll_id": poll_id,
            "status": "Active",
            "users_voted": { "$ne": &username } // Ensures the user hasn't already voted
        };

        let update = doc! {
            "$inc": { "options.$[elem].votes": 1 }, // Increment the vote count for the selected option
            "$push": { "users_voted": &username } // Add the username to the list of users who voted
        };

        let array_filters = vec![doc! { "elem.option_id": option_id }];
        let options = UpdateOptions::builder()
            .array_filters(array_filters)
            .build();

        let result = self.collection.update_one(filter, update, options).await?;

        if result.matched_count == 0 {
            eprintln!("No matching poll found or user has already voted.");
            return Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::PermissionDenied,
                "Poll not found or user has already voted",
            )));
        }

        println!("Vote recorded successfully for poll ID {}.", poll_id);

        // Update the user's polls_voted field
        let user_repo = MongoUserRepo::new(&self.config).await?;
        user_repo
            .add_vote_to_user(&username, poll_id, option_id)
            .await?;

        Ok(())
    }
}
