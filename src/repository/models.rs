extern crate diesel;
use diesel::*;

#[derive(Queryable)]
pub struct Post {
    pub id: i32,
    pub author: String,
    pub body: String,
    pub published_at: i32,
}