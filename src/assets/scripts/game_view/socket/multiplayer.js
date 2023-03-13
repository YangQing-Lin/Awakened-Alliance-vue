export class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4689.acapp.acwing.com.cn:4436/wss/multiplayer/");

        this.start();
    }

    start() {

    }

    send_create_player() {
        this.ws.send(JSON.stringify({
            'message': "hello acapp server",
        }));
    }

    receive_create_player() {

    }
}