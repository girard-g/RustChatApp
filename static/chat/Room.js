const Room = function (SocketID) {
    this.SocketID = SocketID;
    this.socket = new WebSocket("ws://127.0.0.1:7777/ws"); //SocketID
    this.socketOpen = function (aCallback){
        this.socket.addEventListener('open', aCallback)
    };
    this.close = this.socket.close();
    this.send = function (message){
        this.socket.send(JSON.stringify(message));
    };
    this.socketOnMessage = function (aCallback){
        this.socket.onmessage = aCallback
    };
    this.socketOnClose = function (aCallback){
        this.socket.onclose = aCallback
    }
};