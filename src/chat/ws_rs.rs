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

struct Server {
    out: Sender,
    count: Rc<Cell<u32>>,
}

impl Handler for Server {
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

    fn on_open(&mut self, handshake: Handshake) -> Result<()> {
        self.count.set(self.count.get() + 1);
        let number_of_connection = self.count.get();

        if number_of_connection > 5 {
            self.out.send(format!("Too may connection: {}", &number_of_connection))?;
            format!("{} entered and the number of open connection is {}", handshake.peer_addr.unwrap(), &number_of_connection);
            self.out.close_with_reason(CloseCode::Policy, "Too many connections")?
        } else {
            let open_message = format!("{} entered and the number of open connection is {}", handshake.peer_addr.unwrap(), &number_of_connection);
            println!("{}", &open_message);
            self.out.broadcast(open_message)?;
        }

        Ok(())
    }

    fn on_message(&mut self, message: Message) -> Result<()> {
        let raw_message = message.into_text()?;
        println!("The message from the client is {:#?}", &raw_message);

        let message = if raw_message.contains("!warn") {
            let warn_message = "One of the clients sent warning to the server.";
            println!("{}", &warn_message);
            Message::Text("There was warning from another user.".to_string())
        } else {
            Message::Text(raw_message)
        };

        // message = Text("nom: message")
        // save_post() here

        self.out.broadcast(message)
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
}

pub fn websocket() -> () {
    println!("Web Socket Server is ready at ws://127.0.0.1:7777/ws");
    println!("Server is ready at http://127.0.0.1:7777/");

    // Rc is a reference-counted box for sharing the count between handlers
    // since each handler needs to own its contents.
    // Cell gives us interior mutability so we can increment
    // or decrement the count between handlers.

    let count = Rc::new(Cell::new(0));
    listen("127.0.0.1:7777", |out| { Server { out, count: count.clone() } }).unwrap()
}