import { Player } from "../Player";

export class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4689.acapp.acwing.com.cn:4436/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        let outer = this;

        // 前端接收wss协议信息的函数
        this.ws.onmessage = function (e) {
            // 将字符串信息转换成json格式
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                // 后端通过wss连接要求前端创建新的玩家，于是这里调用相应的创建玩家的函数
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        };
    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    // 前端通过连接接收到创建函数的信息
    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            0.5 * this.playground.width / this.playground.scale,
            0.5 * this.playground.height / this.playground.scale,
            this.playground.height * 0.05 / this.playground.scale,
            "white",
            this.playground.height * 0.3 / this.playground.scale,
            "enemy",
            username,
            photo
        );

        // 创建玩家后需要将uuid更改为传过来的uuid，最后再添加到玩家池里面
        player.uuid = uuid;
        this.playground.players.push(player);
    }
}