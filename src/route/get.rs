use std::io;
use std::string::ToString;
use rocket::response::NamedFile;
use rocket::response::content::Json;
use crate::repository::mainlib::get_five_last_posts;
use rocket::Response;
use crate::chat::ws_rs;
use crate::services::tcpservice::get_available_port;
use rocket::http::Status;

#[get("/")]
pub fn index() -> &'static str {
    "Visit http://localhost:8000/chat"
}

#[get("/chat")]
pub fn chat() -> io::Result<NamedFile> {
    NamedFile::open("static/chat/index.html")
}

#[get("/posts")]
pub fn posts() -> Json<String> {
    let posts = get_five_last_posts();
    return Json(serde_json::to_string(&posts).unwrap());
}

#[post("/create-ws")]
pub fn create_ws() -> Status {
    let port = Some(get_available_port()).unwrap().unwrap();
    ws_rs::websocket(format!("{}:{}","127.0.0.1", port.to_string()));
    Status::Created
    //TODO: respond a request with jsoned ws
}