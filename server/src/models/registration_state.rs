use std::collections::HashMap;
use tokio::sync::Mutex;
use webauthn_rs::prelude::*;

pub struct RegistrationState {
    // Map of unique user IDs to their registration details
    state_map: Mutex<HashMap<String, (String, Uuid, PasskeyRegistration)>>,
}

impl RegistrationState {
    pub fn new() -> Self {
        RegistrationState {
            state_map: Mutex::new(HashMap::new()),
        }
    }

    pub async fn insert(&self, data: (String, Uuid, PasskeyRegistration)) {
        let mut map = self.state_map.lock().await;
        map.insert("reg_state".to_string(), data);
    }

    pub async fn get(&self, user_unique_id: String) -> Option<(String, Uuid, PasskeyRegistration)> {
        let map = self.state_map.lock().await;
        map.get(&user_unique_id).cloned()
    }

    pub async fn remove(&self, user_unique_id: String) {
        let mut map = self.state_map.lock().await;
        map.remove(&user_unique_id);
    }
}
