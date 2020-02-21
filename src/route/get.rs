use std::io;
use rocket::response::NamedFile;
use rocket::response::content::Json;
use crate::repository::mainlib::get_five_last_posts;

#[get("/")]
pub fn index() -> &'static str {
    "Visit http://localhost:8000/chat"
}

#[get("/chat")]
pub fn chat() -> io::Result<NamedFile> {
    NamedFile::open("static/chat/index.html")
}

#[get("/posts")]
pub fn lol() -> Json<String> {
    let posts = get_five_last_posts();
    return Json(serde_json::to_string(&posts).unwrap());
}


