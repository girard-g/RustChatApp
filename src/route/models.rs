use serde::{Serialize, Deserialize};
use std::time::SystemTime;


#[derive(Serialize, Deserialize)]
pub struct JsonStringModel {
    pub value: String,
    pub time: SystemTime
}