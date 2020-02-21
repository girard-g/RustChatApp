#![feature(
    proc_macro_hygiene,
    decl_macro,
    register_tool,
    register_attr,
    rustc_private,
    type_ascription
)]

#[macro_use]
extern crate rocket;
extern crate ws;
extern crate diesel;
extern crate dotenv;

use std::thread;

mod repository;
use crate::repository::mainlib::{create_connection, get_five_last_posts};

mod route;
use crate::route::{get, static_files};

mod chat;
use crate::chat::ws_rs;

fn rocket() -> rocket::Rocket {
    let rocket_routes = routes![
        static_files::file,
        get::index,
        get::chat,
        get::lol,
    ];

    rocket::ignite().mount("/", rocket_routes)
}

fn main() {

    thread::Builder::new()
        .name("Thread for chat".into())
        .spawn(|| {
            ws_rs::websocket();
        })
        .unwrap();

    rocket().launch();

}
