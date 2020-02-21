use std::time::SystemTime;
use serde::{Serialize, Deserialize};
use super::schema::posts;

#[derive(Queryable, Serialize, Deserialize)]
pub struct Post {
    pub id: i32,
    pub author: String,
    pub body: String,
    pub published_at: SystemTime,
}

#[derive(Insertable)]
#[table_name="posts"]
pub struct NewPost<'a> {
    pub author: &'a str,
    pub body: &'a str,
}