use std::io;
use rocket::response::{NamedFile};
use crate::repository::mainlib::get_five_last_posts;

#[get("/lol")]
pub fn index() -> &'static str {
    "Visit http://localhost:8000/chat"
}

#[get("/chat")]
pub fn chat() -> io::Result<NamedFile> {
    NamedFile::open("static/chat/index.html")
}

#[get("/posts")]
pub fn lol() -> (){
    get_five_last_posts();
}


