use std::collections::HashMap;
use tokio::sync::Mutex;
use webauthn_rs::prelude::*;

/// Stores user registration states using a mutex to ensure thread safety
pub struct RegistrationState {
    // Map of user unique IDs to their registration details: (Username, Uuid, PasskeyRegistration)
    state_map: Mutex<HashMap<String, (String, Uuid, PasskeyRegistration)>>,
}

impl RegistrationState {
    /// Creates a new `RegistrationState` instance
    pub fn new() -> Self {
        RegistrationState {
            state_map: Mutex::new(HashMap::new()),
        }
    }

    /// Inserts registration data for a specific user
    ///
    /// # Arguments
    /// * `data` - A tuple containing username, user ID, and passkey registration details
    pub async fn insert(&self, data: (String, Uuid, PasskeyRegistration)) {
        let mut map = self.state_map.lock().await;
        // Using the user's unique ID as the key to store registration data
        map.insert(data.0.clone(), data);
    }

    /// Retrieves the registration details for a given user
    ///
    /// # Arguments
    /// * `user_unique_id` - The unique ID of the user whose registration data is to be fetched
    ///
    /// # Returns
    /// Option containing a tuple of username, user ID, and passkey registration details
    pub async fn get(&self, user_unique_id: String) -> Option<(String, Uuid, PasskeyRegistration)> {
        let map = self.state_map.lock().await;
        map.get(&user_unique_id).cloned()
    }

    /// Removes the registration details for a given user
    ///
    /// # Arguments
    /// * `user_unique_id` - The unique ID of the user whose registration data is to be removed
    pub async fn remove(&self, user_unique_id: String) {
        let mut map = self.state_map.lock().await;
        map.remove(&user_unique_id);
    }
}
