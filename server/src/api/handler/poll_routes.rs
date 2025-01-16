use crate::db::poll_repository::PollRepository;
use crate::db::user_repository::UserRepository;
use crate::models::poll_models::{ResultsQuery, ServerEvents, VotingPoll};
use crate::models::user_models::Votes;
use actix_web::body::MessageBody;
use actix_web::{
    delete, get, post,
    web::{Data, Json, Path, Query},
    HttpResponse,
};
use serde::Deserialize;
use serde_json::json;
use tokio::sync::mpsc;
use tokio_stream::StreamExt;
use tracing::info;

// Helper function to handle errors and log them consistently
fn internal_server_error<T: ToString>(err: T) -> HttpResponse {
    eprintln!("Error: {}", err.to_string());
    HttpResponse::InternalServerError().body(err.to_string())
}

// Add a new poll
#[post("/polls")]
pub async fn add_polls(db: Data<dyn PollRepository>, request: Json<VotingPoll>) -> HttpResponse {
    info!("Received Poll Data: {:#?}", request);
    match db.create_poll(request.into_inner()).await {
        Ok(poll) => HttpResponse::Ok().json(poll),
        Err(err) => internal_server_error(err),
    }
}

// Fetch poll(s) based on ID
#[get("/polls/{poll_id}")]
pub async fn fetch_polls(db: Data<dyn PollRepository>, path: Path<i64>) -> HttpResponse {
    let poll_id = path.into_inner();
    if poll_id == 0 {
        match db.fetch_all().await {
            Ok(polls) => HttpResponse::Ok().json(polls),
            Err(err) => internal_server_error(err),
        }
    } else {
        match db.get_poll(poll_id).await {
            Ok(poll) => HttpResponse::Ok().json(poll),
            Err(err) => internal_server_error(err),
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct VoteOption {
    option_id: i64,
    username: String,
}

// Cast a vote
#[post("/polls/{poll_id}/vote")]
pub async fn cast_vote(
    db: Data<dyn PollRepository>,
    user_db: Data<dyn UserRepository>,
    path: Path<i64>,
    query: Query<VoteOption>,
) -> HttpResponse {
    let VoteOption {
        option_id,
        username,
    } = query.into_inner();

    let poll_id = path.into_inner();
    let vote = Votes { poll_id, option_id };

    if let Err(err) = user_db.update_user(username.clone(), vote).await {
        return internal_server_error(err);
    }

    match db.vote_poll(poll_id, option_id, username).await {
        Ok(_) => HttpResponse::Ok().body("Vote cast successfully"),
        Err(err) => internal_server_error(err),
    }
}

// Reset a poll
#[post("/polls/{poll_id}/reset")]
pub async fn reset_vote(db: Data<dyn PollRepository>, path: Path<i64>) -> HttpResponse {
    let poll_id = path.into_inner();
    match db.update_poll(poll_id, "reset".to_string()).await {
        Ok(_) => HttpResponse::Ok().body("Poll reset successfully"),
        Err(err) => internal_server_error(err),
    }
}

// Close a poll
#[post("/polls/{poll_id}/close")]
pub async fn close_poll(db: Data<dyn PollRepository>, path: Path<i64>) -> HttpResponse {
    let poll_id = path.into_inner();
    match db.update_poll(poll_id, "close".to_string()).await {
        Ok(_) => HttpResponse::Ok().body("Poll closed successfully"),
        Err(err) => internal_server_error(err),
    }
}

// Fetch poll results (live or static)
#[get("/polls/{poll_id}/results")]
pub async fn poll_results(
    db: Data<dyn PollRepository>,
    path: Path<i64>,
    query: Query<ResultsQuery>,
) -> HttpResponse {
    let poll_id = path.into_inner();
    if query.live {
        let (tx, rx) = mpsc::channel(1024);
        let db_clone = db.clone();

        tokio::spawn(async move {
            loop {
                match db_clone.get_poll(poll_id).await {
                    Ok(poll) => {
                        let data = serde_json::to_string(&poll).unwrap_or_default();
                        if tx.send(format!("data: {}\n\n", data)).await.is_err() {
                            break;
                        }
                        tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                    }
                    Err(_) => {
                        if tx
                            .send("data: Poll not found\n\n".to_string())
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                }
            }
        });

        let stream = ServerEvents { events: rx };
        let body = stream.map(|event| event.unwrap().try_into_bytes());

        return HttpResponse::Ok()
            .insert_header(("Content-Type", "text/event-stream"))
            .insert_header(("Access-Control-Allow-Origin", "*"))
            .streaming(body);
    }

    match db.get_poll(poll_id).await {
        Ok(poll) => HttpResponse::Ok().json(poll),
        Err(_) => HttpResponse::NotFound().json(json!({ "error": "Poll not found" })),
    }
}

// Delete a poll
#[delete("/polls/{poll_id}")]
pub async fn delete_poll(db: Data<dyn PollRepository>, path: Path<i64>) -> HttpResponse {
    let poll_id = path.into_inner();

    // Check if the poll exists in the database
    match db.get_poll(poll_id).await {
        Ok(Some(_)) => {
            // Proceed to delete the poll if it exists
            match db.delete_poll(poll_id).await {
                Ok(_) => HttpResponse::Ok().body("Poll deleted successfully"),
                Err(err) => internal_server_error(err),
            }
        }
        Ok(None) => {
            // Poll ID not found in the database
            HttpResponse::NotFound()
                .body("Poll not found. It might have been deleted or never created.")
        }
        Err(err) => {
            // Error occurred while checking for poll existence
            internal_server_error(err)
        }
    }
}
