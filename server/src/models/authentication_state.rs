use std::collections::HashMap;
use tokio::sync::Mutex;
use uuid::Uuid;
use webauthn_rs::prelude::*;

pub struct AuthenticationState {
    /// Map of unique user IDs to their registration details
    state_map: Mutex<HashMap<String, (Uuid, PasskeyAuthentication)>>,
}

impl AuthenticationState {
    /// Creates a new instance of `AuthenticationState`.
    pub fn new() -> Self {
        AuthenticationState {
            state_map: Mutex::new(HashMap::new()),
        }
    }

    /// Inserts a new authentication state into the map.
    ///
    /// # Arguments
    /// * `data` - The `Uuid` and `PasskeyAuthentication` to be inserted.
    pub async fn insert(&self, data: (Uuid, PasskeyAuthentication)) {
        let mut map = self.state_map.lock().await;
        map.insert("auth_state".to_string(), data);
    }

    /// Retrieves the authentication state for a given user ID.
    ///
    /// # Arguments
    /// * `user_unique_id` - The unique ID of the user whose authentication state is to be fetched.
    ///
    /// # Returns
    /// * An `Option` containing the `Uuid` and `PasskeyAuthentication` if found, otherwise `None`.
    pub async fn get(&self, user_unique_id: String) -> Option<(Uuid, PasskeyAuthentication)> {
        let map = self.state_map.lock().await;
        map.get(&user_unique_id).cloned()
    }

    /// Removes the authentication state for a given user ID.
    ///
    /// # Arguments
    /// * `user_unique_id` - The unique ID of the user whose authentication state is to be removed.
    pub async fn remove(&self, user_unique_id: String) {
        let mut map = self.state_map.lock().await;
        map.remove(&user_unique_id);
    }
}
