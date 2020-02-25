use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;
use std::env;
use crate::repository::models::{Post, NewPost};
use std::time::SystemTime;
use crate::chat::models::Messages;


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

    let results = posts.order(published_at.desc())
        .limit(5)
        .load::<Post>(&connection)
        .expect("Error loading posts");

    results
}

pub fn save_post(message :&Messages) -> Post {
    use crate::repository::schema::posts;

    let connection = create_connection();

    let new_post = NewPost{
        author: message.from.as_str(),
        body: message.message.as_str(),
        published_at:SystemTime::now()
    };

    diesel::insert_into(posts::table)
        .values(&new_post)
        .get_result(&connection)
        .expect("Error saving new post")
}
