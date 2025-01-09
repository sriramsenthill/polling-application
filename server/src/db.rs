use mongodb::{Client, Database as MongoDatabase};
use std::sync::Arc;

pub struct Database {
    client: Arc<Client>,
    db: Arc<MongoDatabase>,
}

impl Database {
    pub async fn connect(uri: &str, db_name: &str) -> Result<Self, mongodb::error::Error> {
        let client = Client::with_uri_str(uri).await?;
        let db = client.database(db_name);

        Ok(Self {
            client: Arc::new(client),
            db: Arc::new(db),
        })
    }

    pub fn get_database(&self) -> Arc<MongoDatabase> {
        Arc::clone(&self.db)
    }
}
