use serde::{Serialize, Deserialize};
use std::time::SystemTime;


#[derive(Serialize, Deserialize)]
pub struct Messages {
    pub message: String,
    pub from: String,
    pub date: Option<SystemTime>,
    pub room_date: Option<SystemTime>
}