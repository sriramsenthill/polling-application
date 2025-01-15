use std::collections::HashMap;
use thiserror::Error;
use tokio::sync::Mutex;
use uuid::Uuid;
use webauthn_rs::prelude::*;

#[derive(Debug, Error)]
pub enum StateError {
    #[error("State not found")]
    NotFound,
    #[error("Lock acquisition failed")]
    LockError,
}

/// Represents the authentication state for WebAuthn
pub struct AuthenticationState {
    state_map: Mutex<HashMap<String, AuthenticationData>>,
}

/// Data structure for authentication state
#[derive(Clone, Debug)]
pub struct AuthenticationData {
    pub user_id: Uuid,
    pub authentication: PasskeyAuthentication,
    pub created_at: std::time::SystemTime,
}

impl AuthenticationState {
    /// Creates a new instance of `AuthenticationState`
    pub fn new() -> Self {
        Self {
            state_map: Mutex::new(HashMap::new()),
        }
    }

    /// Inserts authentication data for a user
    ///
    /// # Arguments
    /// * `user_id` - The UUID of the user
    /// * `authentication` - The PasskeyAuthentication data
    pub async fn insert(&self, data: (Uuid, PasskeyAuthentication)) {
        let (user_id, authentication) = data;
        let auth_data = AuthenticationData {
            user_id,
            authentication,
            created_at: std::time::SystemTime::now(),
        };

        let mut map = self.state_map.lock().await;
        map.insert("auth_state".to_string(), auth_data);
    }

    /// Retrieves authentication data
    ///
    /// # Arguments
    /// * `key` - The key to lookup the authentication data
    ///
    /// # Returns
    /// * `Result` containing the authentication data or an error
    pub async fn get(&self, key: String) -> Result<(Uuid, PasskeyAuthentication), StateError> {
        let map = self.state_map.lock().await;
        map.get(&key)
            .map(|data| (data.user_id, data.authentication.clone()))
            .ok_or(StateError::NotFound)
    }

    /// Removes authentication data
    ///
    /// # Arguments
    /// * `key` - The key of the authentication data to remove
    pub async fn remove(&self, key: String) -> Result<(), StateError> {
        let mut map = self.state_map.lock().await;
        map.remove(&key);
        Ok(())
    }

    /// Cleans up expired authentication states
    /// Authentication states older than 5 minutes are removed
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
