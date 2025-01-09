use actix_web::{middleware, App, HttpServer};
use dotenv::dotenv;
use std::env;

mod api;
mod db;
mod error;
mod models;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init();

    let mongo_uri = env::var("MONGODB_URI").expect("MONGODB_URI must be set");
    let db_name = env::var("DB_NAME").expect("DB_NAME must be set");

    let db = db::Database::connect(&mongo_uri, &db_name)
        .await
        .expect("Failed to connect to MongoDB");

    let db_data = actix_web::web::Data::new(db);

    HttpServer::new(move || {
        App::new()
            .app_data(db_data.clone())
            .wrap(middleware::Logger::default())
            .configure(api::config)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
