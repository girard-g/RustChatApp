class User {

    constructor(id) {
        this.id = id;
        this.room = null;
    }
    connectToRoom(room){
        this.room=room;
    }

}

module.exports = User;

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
