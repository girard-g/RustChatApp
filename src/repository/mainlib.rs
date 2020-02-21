use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;
use std::env;
use crate::repository::models::{Post, NewPost};


pub fn create_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    Connection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}

pub fn get_five_last_posts() -> Vec<Post> {
    use crate::repository::schema::posts::dsl::*;

    let connection = create_connection();

    let results = posts.limit(5)
        .load::<Post>(&connection)
        .expect("Error loading posts");

    results
}

pub fn save_post(author: &str, body: &str) -> Post {
    use crate::repository::schema::posts;

    let connection = create_connection();

    let new_post = NewPost{
        author:author,
        body:body
    };

    diesel::insert_into(posts::table)
        .values(&new_post)
        .get_result(&connection)
        .expect("Error saving new post")
}
