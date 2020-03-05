use std::io;
use std::string::ToString;
use rocket::response::NamedFile;
use rocket::response::content::Json;
use crate::repository::mainlib::get_five_last_posts;
use crate::chat::{ws_rs, models::SocketDataType};
use crate::services::tcpservice::get_available_port;
use crate::route::models;
use std::time::SystemTime;

use std::thread;
use std::sync::mpsc::channel;

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
pub fn create_ws() -> Json<String> {
    let port = Some(get_available_port()).unwrap().unwrap();

    let (tx, rx) = channel();

    let socket = SocketDataType{
        url: format!("{}:{}","127.0.0.1", &port.to_string())
    };

    tx.send(socket).expect("Unable to send from channel");

    thread::Builder::new()
        .name("websocketChat".into())
        .spawn(move|| {
            let socket = rx.recv().expect("Unable to receive from channel");
            ws_rs::websocket(socket);
        })
        .unwrap();

    let json_string_model = models::JsonStringModel{
        value: format!("{}:{}","127.0.0.1", &port.to_string()),
        time: SystemTime::now()
    };
    return Json(serde_json::to_string(&json_string_model).unwrap());
}