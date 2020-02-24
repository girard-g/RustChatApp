![Rust](https://github.com/Evergreenn/RustChatApp/workflows/Rust/badge.svg)

#Chat App
This is a basic web chat app where backend communication is made through web socket. It use [ws_rs](https://github.com/housleyjk/ws-rs) for web socket communication handling, [rocket](https://rocket.rs/) as web framework for serving static files and api routes and [diesel](http://diesel.rs/) as ORM

## Todo
- [ ] add rooms
- [ ] sent proper formatted objects over the websocket for getting all displayed information
- [ ] create proper admin messages
- [ ] check gif apis
- [ ] remove the 5 users limitation