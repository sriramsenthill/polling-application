use chrono::{DateTime, Utc};
use futures::Stream;
use serde::{Deserialize, Serialize};
use std::pin::Pin;
use std::task::{Context, Poll as TaskPoll}; // Renamed to avoid conflict
use tokio::sync::mpsc;

/// Represents an option within a poll
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PollOption {
    pub option_id: i64, // Unique ID for the option
    pub text: String,   // Text description of the option
    pub votes: i32,     // Number of votes this option has received
}

/// Represents a voting poll with its properties, options, and voting history
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VotingPoll {
    // Renamed from Poll to be more descriptive
    pub poll_id: i64,
    pub title: String,
    pub creator: String,
    pub description: String,
    pub created_at: DateTime<Utc>,
    pub expiration_date: Option<DateTime<Utc>>,
    pub status: PollStatus, // Using enum instead of String
    pub options: Vec<PollOption>,
    pub users_voted: Vec<String>,
}

/// Represents the possible states of a poll
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PollStatus {
    Active,
    Expired,
    Closed,
}

/// A query for retrieving poll results
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ResultsQuery {
    pub live: bool,
}

/// Stream of events that are pushed from the server for real-time updates
pub struct ServerEvents {
    pub events: mpsc::Receiver<String>,
}

impl Stream for ServerEvents {
    type Item = Result<String, std::io::Error>;

    fn poll_next(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> TaskPoll<Option<Self::Item>> {
        match self.events.poll_recv(cx) {
            TaskPoll::Ready(Some(event)) => TaskPoll::Ready(Some(Ok(event))),
            TaskPoll::Ready(None) => TaskPoll::Ready(None),
            TaskPoll::Pending => TaskPoll::Pending,
        }
    }
}
