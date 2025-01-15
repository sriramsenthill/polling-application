use serde::{Deserialize, Serialize};

use webauthn_rs::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Votes {
    pub poll_id: i64,
    pub option_id: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub user_id: String,
    pub user_name: String,
    pub polls_voted: Option<Vec<Votes>>,
    pub owned_polls: Option<Vec<i64>>,
    pub keys: Vec<Passkey>,
}
