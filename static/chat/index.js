// https://github.com/browserify/browserify#usage
// $sudo npm install -g browserify
// $browserify index.js > bundle.js

const emoji = require("node-emoji");
const hasEmoji = require("has-emoji");
// var maClass = require("./User.js");
// const Room = require("./Room.js");

class User {
    constructor(id) {
        this.id = id;
        this.room = null;
    }
    connectToRoom(room){
        this.room = new Room(room);
    }

    getUserId(){
        return this.id
    }

}

class Room {
    constructor(SocketID) {
        this.socket = new WebSocket(SocketID);
    }
    socketOpen(aCallback) {
        this.socket.addEventListener('open', aCallback)
    };
    socketClose() {
        this.socket.close();
    };
    send(message) {
        this.socket.send(JSON.stringify(message));
    };
    socketOnMessage(aCallback) {
        this.socket.onmessage = aCallback
    };
    socketOnClose(aCallback) {
        this.socket.onclose = aCallback
    };
}

// const lol = new User("ws://127.0.0.1:7777/ws");
let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
const user = new User(uniqueId);
user.connectToRoom("ws://127.0.0.1:7777/ws");

// const socket = new WebSocket("ws://127.0.0.1:7777/ws");

let userName = '';

function dateFormat(datetime){
    const months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const date = new Date(datetime.secs_since_epoch*1000);
    const year = date.getFullYear();
    const month = months_arr[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    const seconds = "0" + date.getSeconds();

    return day+'-'+month+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

function createAdminMessage(content){
    const messages = document.getElementById("messages");
    const strHtml ='<div class="alert alert-primary" role="alert">\n' +content+'</div>';

    //class="alert-link">an example link</a>. Give it a click if you like.

    let temp = document.createElement('div');
    temp.innerHTML = strHtml;
    temp = temp.firstChild;

    messages.appendChild(temp);
}


function createHistoryMessage(content, userName, date) {
    const messages = document.getElementById("messages");

    const humanRedableDate = dateFormat(date);

    strHtml = '<div id="writtenmsg" class="incoming_msg"><div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="'+userName+'"> </div> <div class="received_msg"><p class="name">'+userName+'</p><div class="received_withd_msg">'+content+'<span class="time_date">  '+humanRedableDate+'</span></div></div></div>';
    let temp = document.createElement('div');
    temp.innerHTML = strHtml;
    temp = temp.firstChild;

    messages.appendChild(temp);

}

function createMessage(content, direction, userName, date){

    const humanRedableDate =  dateFormat(date);
    const messages = document.getElementById("messages");

    let strHtml = "";
    if(direction === "outgoing"){

        strHtml = '<div id="writtenmsg" class="outgoing_msg"><div class="sent_msg"><p>'+content+'</p><span class="time_date"> '+humanRedableDate+'</span></div></div>'
    }else{
        strHtml = '<div id="writtenmsg" class="incoming_msg"><div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="'+userName+'"> </div> <div class="received_msg"><p class="name">'+userName+'</p><div class="received_withd_msg">'+content+'<span class="time_date">  '+humanRedableDate+'</span></div></div></div>';
    }

    let temp = document.createElement('div');
    temp.innerHTML = strHtml;
    temp = temp.firstChild;

    messages.appendChild(temp);

    const scrolled = false;
    if(!scrolled){
        let element = document.getElementById("messages");
        element.scrollTop = element.scrollHeight;
    }
}

function removeMessages() {
    const messages = document.getElementById("messages");
    while (messages.firstChild) {
        messages.removeChild(messages.firstChild);
    }
}

let open = false;

let userId = "";
let userInputs = [];

const HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
                aCallback(anHttpRequest.responseText);
        };

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    };

    this.post = function(aUrl, aCallback) {
        let anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState === 4 && (anHttpRequest.status === 200 || anHttpRequest.status === 201))
                aCallback(anHttpRequest.responseText);
        };

        anHttpRequest.open( "POST", aUrl, true );
        anHttpRequest.send( null );
    }
};


user.room.socketOpen(function () {
    let client = new HttpClient();
    client.get('http://localhost:8000/posts', function(response) {

        if (response !== "") {
            createAdminMessage("Last 5 messages:");
            JSON.parse(response).forEach(function (item) {
                createHistoryMessage(item.body, item.author, item.published_at);
            });
            createAdminMessage("New Messages:")
        }

    });

});

const exit = document.getElementById("exit");
exit.onclick = function () {
    user.room.socketClose();
};

const form = document.getElementById("form");

form.onsubmit = function (event) {
    event.preventDefault();
    const input = document.getElementById("msg");

    if (input.value === "") {
        return;
    }

    if (input.value === "!clear") {
        removeMessages();
        input.value = "";
        return;
    }

    if (input.value === "!exit") {
        user.room.socketClose();
        return;
    }

    let message = {
        message: input.value,
    };

    if (userName) {
        message.from = userName;
    }else{
        message.from = user.getUserId();
    }

    user.room.send(message);
    input.value = "";
    console.log(user);
    setTimeout(() => window.scrollTo({ top: window.innerHeight, behavior: "auto" }), 10);
};


user.room.socketOnMessage(function (event) {

    if (userInputs[userInputs.length - 1] === "!warn") {
        alert("You sent warning to the other users");
    }

    if (event.data.includes("!clearall")) {
        removeMessages();
        return;
    }

    if (event.data.includes("!exitall")) {
        user.room.socketClose();
        return;
    }

    if (event.data.includes("!newroom")) {
        createSocket();
        return;
    }

    if (event.data.includes("!x-opacity")) {
        const messages = document.getElementById("messages");
        if (messages.className === "x-opacity") { messages.className = ""; } else { messages.className = "x-opacity" }
        return;
    }

    if (!open) {

        let messageFromnser = JSON.parse(event.data);
        let separate = messageFromnser.message.split(" ");
        userId = separate[0];
        let totalNumber = separate[separate.length - 1];

        if (totalNumber > 5 ) {
            createAdminMessage(`${totalNumber} is maximum user allowed. Wait for others exit the chat.`);
            user.room.socketClose();
            return;
        }
        console.log(user);

        // let user = new User(userId);
        // user.connectToRoom(room);

        createAdminMessage(`Your id is ${user.getUserId()} and "You" will be used in this page instead | https://www.webfx.com/tools/emoji-cheat-sheet`);
        document.getElementById('chat_date').innerHTML = dateFormat(messageFromnser.room_date);
        open = true;

    } else {
        console.log('userelse');
        console.log(user);
        let fromServer = event.data;
        const msgFromServer = JSON.parse(fromServer);

        const authorOfMessage = msgFromServer.from;

        if (fromServer.includes(`!exclude ${user.getUserId()}`)) {
            user.room.socketClose();
            return;
        }

        let direction = "incomming";

        if (authorOfMessage === user.getUserId() || authorOfMessage === userName) {
            direction = "outgoing";
        }

        const includeEmoji = hasEmoji(emoji.emojify(msgFromServer.message));
        const afterEmoji = includeEmoji ? emoji.emojify(msgFromServer.message) : msgFromServer.message;
        // I ❤️ Rust, I :heart: Rust

        if(authorOfMessage === 'Admin'){
            createAdminMessage(afterEmoji)
        }else{
            createMessage(afterEmoji, direction, authorOfMessage, msgFromServer.date);

        }

    }
});

user.room.socketOnClose(function (event) {
    const closeMessage = event.data === undefined ? "Server, You or another user closed the connection." : "WebSocket is closed now.";
    createAdminMessage(closeMessage);
});

function createSocket() {
    let client = new HttpClient();
    client.post('http://localhost:8000/create-ws', function(response) {
        const clean = JSON.parse(response);
        user.connectToRoom(response.value)
        // const socket2 = new Room("ws://127.0.0.1:7777/ws");

    });
}
