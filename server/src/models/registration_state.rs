use std::collections::HashMap;
use thiserror::Error;
use tokio::sync::Mutex;
use uuid::Uuid;
use webauthn_rs::prelude::*;

#[allow(dead_code)]
#[derive(Debug, Error)]
pub enum StateError {
    #[error("State not found")]
    NotFound,
    #[error("Lock acquisition failed")]
    LockError,
}

/// Represents the registration state for WebAuthn
pub struct RegistrationState {
    state_map: Mutex<HashMap<String, RegistrationData>>,
}

#[allow(dead_code)]
#[derive(Clone, Debug)]
pub struct RegistrationData {
    pub username: String,
    pub user_id: Uuid,
    pub registration: PasskeyRegistration,
    pub created_at: std::time::SystemTime,
}

#[allow(dead_code)]
impl RegistrationState {
    /// Creates a new instance of `RegistrationState`
    pub fn new() -> Self {
        Self {
            state_map: Mutex::new(HashMap::new()),
        }
    }

    /// Inserts registration data for a user
    ///
    /// # Arguments
    /// * `username` - The username of the registering user
    /// * `user_id` - The UUID of the user
    /// * `registration` - The PasskeyRegistration data
    pub async fn insert(&self, data: (String, Uuid, PasskeyRegistration)) {
        let (username, user_id, registration) = data;
        let registration_data = RegistrationData {
            username,
            user_id,
            registration,
            created_at: std::time::SystemTime::now(),
        };

        let mut map = self.state_map.lock().await;
        map.insert("reg_state".to_string(), registration_data);
    }

    /// Retrieves registration data
    ///
    /// # Arguments
    /// * `key` - The key to lookup the registration data
    ///
    /// # Returns
    /// * `Result` containing the registration data or an error
    pub async fn get(
        &self,
        key: String,
    ) -> Result<(String, Uuid, PasskeyRegistration), StateError> {
        let map = self.state_map.lock().await;
        map.get(&key)
            .map(|data| {
                (
                    data.username.clone(),
                    data.user_id,
                    data.registration.clone(),
                )
            })
            .ok_or(StateError::NotFound)
    }

    /// Removes registration data
    ///
    /// # Arguments
    /// * `key` - The key of the registration data to remove
    pub async fn remove(&self, key: String) -> Result<(), StateError> {
        let mut map = self.state_map.lock().await;
        map.remove(&key);
        Ok(())
    }

    /// Cleans up expired registration states
    /// Registration states older than 5 minutes are removed
    pub async fn cleanup_expired(&self) -> Result<(), StateError> {
        let mut map = self.state_map.lock().await;
        let now = std::time::SystemTime::now();
        let expire_threshold = std::time::Duration::from_secs(300); // 5 minutes

        map.retain(|_, data| {
            now.duration_since(data.created_at)
                .map(|age| age < expire_threshold)
                .unwrap_or(false)
        });

        Ok(())
    }
}
