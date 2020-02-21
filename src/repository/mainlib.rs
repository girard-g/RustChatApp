use diesel::prelude::*;
use diesel::pg::PgConnection;
use dotenv::dotenv;
use std::env;
use std::error::Error;

use crate::repository::models::Post;
// use crate::repository::schema::*;


pub fn create_connection() -> PgConnection {
     dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    Connection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}

// pub fn get_five_last_posts() -> [Post; 5] {
//
//     let connection = create_connection();
//
//     let results = posts.limit(5)
//         .load::<Post>(&connection)
//         .expect("Error loading posts");
//
//     results
// }

pub fn get_five_last_posts() -> () {

    let connection = create_connection();

    let mut sql = "select * from posts ".to_string();

    let results =diesel::sql_query(sql);
        // .load::<Post>(&connection)
        // .expect("Error loading posts");
    let oui: Post =results.get_result(&connection).unwrap();
    dbg!("lol");
    dbg!(&oui);

}