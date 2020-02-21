use std::time::SystemTime;
use serde::{Serialize, Deserialize};

#[derive(Queryable, Serialize, Deserialize)]
pub struct Post {
    pub id: i32,
    pub author: String,
    pub body: String,
    // #[diesel(deserialize_as = Timestamp)]
    pub published_at: SystemTime,
}