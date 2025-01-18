use crate::db::{db_config::DbConfig, user_repository::UserRepository};
use crate::models::user_models::{User, Votes};

use mongodb::bson::{self, doc};
use mongodb::{options::ClientOptions, Client, Collection};

#[derive(Clone)]
pub struct MongoUserRepo {
    collection: Collection<User>,
}

impl MongoUserRepo {
    /// Creates a new `MongoUserRepo` instance.
    pub async fn new(config: &DbConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let client_options = ClientOptions::parse(&config.connection_string).await?;
        let client = Client::with_options(client_options)?;
        let database = client.database(&config.database_name);
        let collection = database.collection("users");

        Ok(MongoUserRepo { collection })
    }
}

#[async_trait::async_trait]
impl UserRepository for MongoUserRepo {
    async fn create_user(&self, user: User) -> Result<User, Box<dyn std::error::Error>> {
        println!("Creating User: {:#?}", user);

        self.collection.insert_one(&user, None).await.map_err(|e| {
            eprintln!("Error inserting user: {}", e);
            e
        })?;

        println!("User created successfully.");
        Ok(user)
    }

    async fn get_user(
        &self,
        user_name: String,
    ) -> Result<Option<User>, Box<dyn std::error::Error + Send + Sync>> {
        let filter = doc! { "user_name": user_name.clone() }; // Clone the string to avoid moving

        match self.collection.find_one(filter, None).await {
            Ok(user) => {
                if user.is_none() {
                    eprintln!("No user found with username: {}", user_name);
                }
                Ok(user)
            }
            Err(e) => {
                eprintln!("Error retrieving user: {:?}", e);
                Err(Box::new(e))
            }
        }
    }

    async fn update_user(
        &self,
        user_name: String,
        vote: Votes,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let filter = doc! { "user_name": user_name.clone() };

        let update = doc! {
            "$push": {
                "votes": bson::to_bson(&vote)?,
                "polls_voted": vote.poll_id
            }
        };

        let result = self.collection.update_one(filter, update, None).await?;

        if result.matched_count == 0 {
            eprintln!("No user found with username: {}", user_name);
            return Err(Box::new(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "User not found",
            )));
        }

        println!(
            "User '{}' updated successfully with vote: {:?}",
            user_name, vote
        );

        Ok(())
    }

    async fn delete_user(&self, user_id: String) -> Result<(), Box<dyn std::error::Error>> {
        let filter = doc! { "user_id": user_id.clone() };
        let result = self.collection.delete_one(filter, None).await?;
        if result.deleted_count == 0 {
            eprintln!("No user found with ID: {}", user_id);
        }
        Ok(())
    }

    async fn has_voted(
        &self,
        user_name: String,
        poll_id: i64,
    ) -> Result<bool, Box<dyn std::error::Error + Send + Sync>> {
        let filter = doc! {
            "user_name": user_name,
            "votes": {
                "$elemMatch": {
                    "poll_id": poll_id
                }
            }
        };

        match self.collection.count_documents(filter, None).await {
            Ok(count) => Ok(count > 0),
            Err(e) => Err(Box::new(e) as Box<dyn std::error::Error + Send + Sync>),
        }
    }
}
