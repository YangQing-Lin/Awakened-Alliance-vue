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
            // 如果收到的是自己窗口发送的消息就不需要处理
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                // 后端通过wss连接要求前端创建新的玩家，于是这里调用相应的创建玩家的函数
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_toward") {
                outer.receive_move_toward(uuid, data.directions_array);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.ball_uuid, data.tx, data.ty);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_chat_message(uuid, data.username, data.text);
            }
        };
    }

    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.uuid === uuid) {
                return player;
            }
        }
        return null;
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

    send_move_toward(directions) {
        let outer = this;
        // 因为JSON.stringify()无法将Set()对象转换为字符串（转换后会丢失所有内容）
        // 所以需要先用[...directions]将Set()对象解包并转换成数组的形式，然后才能转换成字符串
        // 在接收其他窗口数据的时候将字符串转换为数组，再new Set(array)即可
        let directions_array = [...directions];
        this.ws.send(JSON.stringify({
            'event': "move_toward",
            'uuid': outer.uuid,
            'directions_array': directions_array,
        }));
    }

    receive_move_toward(uuid, directions_array) {
        let player = this.get_player(uuid);

        if (player) {
            let directions = new Set(directions_array);
            player.move_toward(directions);
        }
    }

    send_shoot_fireball(ball_uuid, tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'ball_uuid': ball_uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_shoot_fireball(uuid, ball_uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
        console.log("receive shoot fireball");
    }

    // x, y: 被攻击者的位置，用于同步
    // angle: 攻击的角度（暂时用不到）
    // ball_uuid: 广播这个炮弹已经击中人了
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }))
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_chat_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_chat_message(uuid, username, text) {
        this.playground.chat_field.receive_add_message(username, text);
    }
}