use actix_files::NamedFile;
use actix_web::{
    get,
    middleware::{self, Logger},
    web::{self, Data, JsonConfig},
    App, HttpRequest, HttpResponse, HttpServer, Responder,
};
use api::handler::auth_routes::{authentication, registration};
use dotenv::dotenv;
use log::info;
use std::env;
use std::path::PathBuf;
use std::sync::Arc;

use actix_cors::Cors;
use webauthn_rs::prelude::*;

mod api;
mod db;
mod models;

// Auth route handlers
use crate::api::handler::auth_routes;

// Poll route handlers
use crate::api::handler::poll_routes::{
    add_polls, cast_vote, close_poll, delete_poll, fetch_polls, poll_results, reset_vote,
};

use crate::db::{
    db_config::DbConfig, init_poll_repo, init_user_repo, poll_repository::PollRepository,
    user_repository::UserRepository,
};
use crate::models::{
    authentication_state::AuthenticationState, registration_state::RegistrationState,
};

/// Serve the root index.html file.
#[get("/")]
async fn root_handler() -> impl Responder {
    // Your root handler implementation here
    HttpResponse::Ok().body("Welcome")
}

/// Basic API endpoint for testing.
#[get(" /api")]
async fn api_handler() -> impl Responder {
    HttpResponse::Ok().json("API is running.")
}

/// Configure WebAuthn.
fn setup_webauthn() -> Data<Webauthn> {
    // Read environment variables or use default values.
    let rp_id = std::env::var("WEBAUTHN_ID").unwrap_or_else(|_| "localhost".to_string());
    info!("{}", rp_id);
    let rp_origin =
        std::env::var("WEBAUTHN_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_string());

    info!("{}", rp_origin);
    // Parse the origin URL.
    let parsed_origin = Url::parse(&rp_origin).expect("Invalid URL for WebAuthn origin");

    info!("{}", parsed_origin);
    // Build the WebAuthn instance.
    let webauthn = WebauthnBuilder::new(&rp_id, &parsed_origin)
        .expect("Invalid WebAuthn configuration")
        .build()
        .expect("Failed to initialize WebAuthn");

    Data::new(webauthn)
}

/// Initialize database repositories.
async fn setup_repositories(
    config: DbConfig,
) -> (Data<dyn PollRepository>, Data<dyn UserRepository>) {
    match init_poll_repo(config.clone()).await {
        Ok(poll_repo) => {
            let poll_repo = Arc::new(poll_repo) as Arc<dyn PollRepository>;

            match init_user_repo(config).await {
                Ok(user_repo) => {
                    let user_repo = Arc::new(user_repo) as Arc<dyn UserRepository>;
                    (Data::from(poll_repo), Data::from(user_repo))
                }
                Err(err) => {
                    eprintln!("Failed to initialize user repository: {:?}", err);
                    // Handle error (you could return an empty repo, shutdown, etc.)
                    std::process::exit(1);
                }
            }
        }
        Err(err) => {
            eprintln!("Failed to initialize poll repository: {:?}", err);
            std::process::exit(1);
        }
    }
}

/// Main application entry point.
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logging and environment variables.
    dotenv().ok();
    env_logger::init();
    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "info");
    }

    // Database configuration.
    let db_config = DbConfig::new(
        "mongodb", // This is already a `&str`, so no change needed
        env::var("DATABASE_URI")
            .unwrap_or_else(|_| "mongodb://localhost:27017/?directConnection=true".to_string())
            .as_str(), // Convert `String` to `&str` using `.as_str()`
        "polling_application", // This is already a `&str`, so no change needed
    );

    // Set up shared state and repositories.
    let webauthn = setup_webauthn();
    let reg_state = Data::new(RegistrationState::new());
    let auth_state = Data::new(AuthenticationState::new());
    let (poll_repo, user_repo) = setup_repositories(db_config).await;

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let port: u16 = port.parse().expect("Invalid PORT value");

    // Start the HTTP server.
    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .supports_credentials(),
            )
            .app_data(webauthn.clone())
            .app_data(reg_state.clone())
            .app_data(auth_state.clone())
            .app_data(poll_repo.clone())
            .app_data(user_repo.clone())
            .app_data(JsonConfig::default())
            .service(root_handler)
            .service(api_handler)
            .service(
                web::scope("/api/auth")
                    .service(registration::start)
                    .service(registration::finish)
                    .service(authentication::start)
                    .service(authentication::finish),
            )
            .service(
                web::scope("/api")
                    .service(add_polls)
                    .service(fetch_polls)
                    .service(delete_poll)
                    .service(cast_vote)
                    .service(close_poll)
                    .service(reset_vote)
                    .service(poll_results),
            )
    })
    .bind(("0.0.0.0", port))?
    .run()
    .await
}
