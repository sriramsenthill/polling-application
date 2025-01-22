#[derive(Clone, Debug)]
pub struct DbConfig {
    pub db_type: String,
    pub connection_string: String,
    pub database_name: String,
}

#[allow(dead_code)]
impl DbConfig {
    pub fn new(db_type: &str, connection_string: &str, database_name: &str) -> Self {
        Self {
            db_type: db_type.to_string(),
            connection_string: connection_string.to_string(),
            database_name: database_name.to_string(),
        }
    }

    pub fn builder() -> DbConfigBuilder {
        DbConfigBuilder::default()
    }
}

#[allow(dead_code)]
#[derive(Default)]
pub struct DbConfigBuilder {
    db_type: Option<String>,
    connection_string: Option<String>,
    database_name: Option<String>,
}

#[allow(dead_code)]
impl DbConfigBuilder {
    pub fn db_type(mut self, db_type: &str) -> Self {
        self.db_type = Some(db_type.to_string());
        self
    }

    pub fn connection_string(mut self, connection_string: &str) -> Self {
        self.connection_string = Some(connection_string.to_string());
        self
    }

    pub fn database_name(mut self, database_name: &str) -> Self {
        self.database_name = Some(database_name.to_string());
        self
    }

    pub fn build(self) -> Result<DbConfig, &'static str> {
        Ok(DbConfig {
            db_type: self.db_type.ok_or("db_type is required")?,
            connection_string: self
                .connection_string
                .ok_or("connection_string is required")?,
            database_name: self.database_name.ok_or("database_name is required")?,
        })
    }
}
