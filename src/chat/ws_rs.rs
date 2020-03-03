use ws::{
    listen,
    CloseCode,
    Error,
    Handler,
    Handshake,
    Message,
    Request,
    Response,
    Result,
    Sender,
};

use std::cell::Cell;
use std::rc::Rc;
use crate::repository::mainlib::save_post;
use std::time::SystemTime;
use crate::chat::models::Messages;

struct Server {
    out: Sender,
    count: Rc<Cell<u32>>,
}


impl Handler for Server {
    fn on_open(&mut self, handshake: Handshake) -> Result<()> {
        self.count.set(self.count.get() + 1);
        let number_of_connection = self.count.get();

        if number_of_connection > 5 {
            self.out.send(format!("Too may connection: {}", &number_of_connection))?;
            format!("{} entered and the number of open connection is {}", handshake.peer_addr.unwrap(), &number_of_connection);
            self.out.close_with_reason(CloseCode::Policy, "Too many connections")?
        }else if number_of_connection < 1 {
            self.out.send(format!("Nobody is in room, closing: {} connections", &number_of_connection))?;
            format!("the number of open connection is {}. Closing", &number_of_connection);
            self.out.close_with_reason(CloseCode::Policy, "Nobody is in room")?
        } else {
            let open_message = format!("{} entered and the number of open connection is {}", handshake.peer_addr.unwrap(), &number_of_connection);
            println!("{}", &open_message);

            let response = Messages{
                message: open_message,
                from: "Admin".into(),
                date: Some(SystemTime::now()),
                room_date:Some(SystemTime::now())
            };

            let stringify = serde_json::to_string(&response).unwrap();

            self.out.broadcast(stringify)?;
        }

        Ok(())
    }

    fn on_message(&mut self, message: Message) -> Result<()> {
        let raw_message = message.into_text()?;
        println!("The message from the client is {:#?}", &raw_message);

        // let message = if raw_message.contains("!warn") {
        //     let warn_message = "One of the clients sent warning to the server.";
        //     println!("{}", &warn_message);
        //     Message::Text("There was warning from another user.".to_string())
        // } else {
        //     Message::Text(raw_message)
        // };

        let mut msg : Messages = serde_json::from_str(&raw_message).unwrap();

        msg.date = Some(SystemTime::now());
        save_post(&msg);

        let fnreturn =serde_json::to_string(&msg).unwrap();

        self.out.broadcast(fnreturn)
    }

    fn on_close(&mut self, code: CloseCode, reason: &str) {
        match code {
            CloseCode::Normal => println!("The client is done with the connection."),
            CloseCode::Away => println!("The client is leaving the site."),
            CloseCode::Abnormal => println!("Closing handshake failed! Unable to obtain closing status from client."),
            _ => println!("The client encountered an error: {}", reason),
        }

        self.count.set(self.count.get() - 1);
    }

    fn on_error(&mut self, err: Error) {
        println!("The server encountered an error: {:?}", err);
    }

    fn on_request(&mut self, request: &Request) -> Result<Response> {
        match request.resource() {
            "/ws" => {
                println!("Browser Request from {:?}", request.origin().unwrap().unwrap());
                println!("Client found is {:?}", request.client_addr().unwrap());

                let response = Response::from_request(&request);

                response
            }

            _ => Ok(Response::new(404, "Not Found", b"404 - Not Found".to_vec())),
        }
    }
}

pub fn websocket(url_socket: String) -> () {
    println!("Web Socket Server is ready at ws://{}/ws", url_socket);
    println!("Server is ready at http://{}", url_socket);

    // Rc is a reference-counted box for sharing the count between handlers
    // since each handler needs to own its contents.
    // Cell gives us interior mutability so we can increment
    // or decrement the count between handlers.

    let count = Rc::new(Cell::new(0));
    listen(url_socket, |out| { Server { out, count: count.clone() } }).unwrap()
}