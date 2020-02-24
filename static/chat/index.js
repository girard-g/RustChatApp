// https://github.com/browserify/browserify#usage
// $sudo npm install -g browserify
// $browserify index.js > bundle.js

const emoji = require("node-emoji");
const hasEmoji = require("has-emoji");

const socket = new WebSocket("ws://127.0.0.1:7777/ws");
// Get the modal
// let modal = document.getElementById("myModal");

// Get the button that opens the modal
// let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

let submitName = document.getElementById("submitName");

let userName = '';

function createAdminMessage(content){
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.className = "blue";
  p.textContent = content;
  li.append(p);
  messages.append(li);
}


function createHistoryMessage(content) {
  const messages = document.getElementById("messages");

  const strHtml = '<div class="incoming_msg"><div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div> <div class="received_msg"><div class="received_withd_msg">'+content+'<span class="time_date"> 11:01 AM    |    June 9</span></div></div></div>';
  let temp = document.createElement('div');
  temp.innerHTML = strHtml;
  temp = temp.firstChild;

  messages.appendChild(temp);

}

function createMessage(content, direction){
  const messages = document.getElementById("messages");

  let strHtml = "";
  if(direction === "outgoing"){

    strHtml = '<div id="writtenmsg" class="outgoing_msg"><div class="sent_msg"><p>'+content+'</p><span class="time_date"> 11:01 AM    |    Today</span></div></div>'
  }else{
    strHtml = '<div id="writtenmsg" class="incoming_msg"><div class="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil"> </div> <div class="received_msg"><div class="received_withd_msg">'+content+'<span class="time_date"> 11:01 AM    |    June 9</span></div></div></div>';
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

// submitName.onclick = function() {
//   userName = document.getElementById('fname').value;
//   modal.style.display = "none";
//   createAdminMessage(`Name changed from ${userId} to ${userName}`);
//
// };// 1. custom function to log time and remove messages(remove list under ul)

function getDateTime() {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + ' ' + time;
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

let server = [];

var HttpClient = function() {
  this.get = function(aUrl, aCallback) {
    let anHttpRequest = new XMLHttpRequest();
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200)
        aCallback(anHttpRequest.responseText);
    };

    anHttpRequest.open( "GET", aUrl, true );
    anHttpRequest.send( null );
  }
};


socket.addEventListener('open', function (event) {

  let client = new HttpClient();
  client.get('http://localhost:8000/posts', function(response) {

    if (response !== "") {
      createAdminMessage("last 5 messages:");
      JSON.parse(response).forEach(function (item) {
        createHistoryMessage(item.author+": "+item.body);
      });
    }

  });

});


//
const exit = document.getElementById("exit");
exit.onclick = function () {
  socket.close();
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
    socket.close();
    return;
  }

  // To save what user typed to localStorage, use database in production

  const userInputWithTime = `${userId} typed ${input.value} at ${getDateTime()}`;
  userInputs.push(userInputWithTime);

  //

  if (userName) {
    socket.send(`${userName}: ${input.value}`);
  }else{
    socket.send(`${userId}: ${input.value}`);
  }

  // socket.send(`${userId}: ${input.value}`);
  // socket.send(`toto: ${input.value}`);
  input.value = "";
  setTimeout(() => window.scrollTo({ top: window.innerHeight, behavior: "auto" }), 10);
};


socket.onmessage = function (event) {
  // To save what server sent to localStorage, use database in production
  const messagefromServer = `Server ${event.origin} sent ${event.data} at ${getDateTime()}`;
  server.push(messagefromServer);

  if (userInputs[userInputs.length - 1] === "!warn") {
    alert("You sent warning to the other users");
  }

  if (event.data.includes("!clearall")) {
    removeMessages();
    return;
  }

  if (event.data.includes("!exitall")) {
    socket.close();
    return;
  }

  if (event.data.includes("!x-opacity")) {
    const messages = document.getElementById("messages");
    if (messages.className === "x-opacity") { messages.className = ""; } else { messages.className = "x-opacity" }
    return;
  }

  if (!open) {
    // to give id to user and verify the maximum number, only work once
    let separate = event.data.split(" ");
    userId = separate[0];

    let totalNumber = separate[separate.length - 1];
    if (totalNumber > 5 ) {
      createAdminMessage(`${totalNumber} is maximum user allowed. Wait for others exit the chat.`);
      socket.close();
      return;
    }

    open = true;

    createAdminMessage(`Your id is ${userId} and "You" will be used in this page instead | https://www.webfx.com/tools/emoji-cheat-sheet`);

  } else {
    let fromServer = event.data;
    const beforePayload = fromServer.split(" ")[0];
    const authorOfMessage = beforePayload.slice(0, beforePayload.length - 1); // to get the id part of the message


    // console.log(fromServer);
    // console.log(beforePayload);
    // console.log(authorOfMessage);

    // if (authorOfMessage !== userId && fromServer.includes(`!exclude ${userId}`)) {
    if (fromServer.includes(`!exclude ${userId}`)) {
      socket.close();
      return;
    }

    let direction = "incomming";

    if (authorOfMessage === userId || authorOfMessage === userName) {
      fromServer = fromServer.replace(userId, "");
      fromServer = fromServer.replace(authorOfMessage, "");

      direction = "outgoing";
    }

    const includeEmoji = hasEmoji(emoji.emojify(fromServer));
    afterEmoji = includeEmoji ? emoji.emojify(fromServer) : fromServer;
    // I ❤️ Rust, I :heart: Rust

    createMessage(afterEmoji, direction);

  }
};

// verify it work
socket.onclose = function (event) {
  const closeMessage = event.data === undefined ? "Server, You or another user closed the connection." : "WebSocket is closed now.";
  createAdminMessage(closeMessage);

  localStorage.setItem("userInputs", `[${userInputs}]`);
  localStorage.setItem("server", `[${server}]`);
};
