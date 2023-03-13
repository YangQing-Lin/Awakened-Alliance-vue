import { isMemoSame, readonly } from "vue";
import { routeLocationKey } from "vue-router";
import { AcGameObject } from "./AcGameObject";
import { Particle } from "./Particle";
import { FireBall } from "./skill/FireBall";

export class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.health = 20;
        this.eps = 0.001;
        this.directions = [];  // 用户的操作列表
        this.last_directions_length = 0;  // 操作列表的长度（每当directions长度更改的时候向后端发送数据，长度不变就不发送，降低服务器压力）
        this.skill_directions = [];  // 用户的技能操作列表
        this.last_skill_directions_length = 0;
        this.rand_directions = [];  // 给机器人用的随机操作列表
        this.tx = 0;  // 鼠标的实时位置
        this.ty = 0;
        this.friction = 0.9;  // 摩擦力
        this.spent_time = 0;
        this.last_clientX = 0;  // 暂存e.clientX和e.clientY，用于在鼠标不动的时候也能更新相对位置
        this.last_clientY = 0;
        this.last_rect_left = 0;
        this.last_rect_top = 0;  // 暂存rect.left和rect.top，用于计算AcWingOS小窗模式的鼠标位置

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start() {
        this.ctx.canvas.focus();

        // 机器人的运动和玩家的不一样，玩家是通过键盘操作指定移动方向，机器人是直线移动到随机的坐标点
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.virtual_map_width;
            let ty = Math.random() * this.playground.virtual_map_height;
            this.move_to(tx, ty);

            for (let i = 0; i < 4; i++) {
                // Math.round(Math.random())：随机生成0和1
                this.rand_directions.push(Math.round(Math.random() * 4));
            }
        }
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    add_listening_events() {
        // 取消右键菜单功能
        this.ctx.canvas.addEventListener('contextmenu', e => {
            e.preventDefault();  // 取消默认行为
        });

        this.ctx.canvas.addEventListener('keydown', e => {
            // if (this.store.state.restart) {
            //     return;
            // }
            // 操作方式：wasd / 上下左右
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                // 保证不会重复输入，后面的完全清楚只是保险起见
                if (this.directions.includes(0) === false) {
                    this.directions.push(0);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                if (this.directions.includes(1) === false) {
                    this.directions.push(1);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                if (this.directions.includes(2) === false) {
                    this.directions.push(2);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                if (this.directions.includes(3) === false) {
                    this.directions.push(3);
                }
                e.preventDefault();  // 取消默认行为
            }
        });

        this.ctx.canvas.addEventListener('keyup', e => {
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                this.from_directions_clean(this.directions, 0);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.from_directions_clean(this.directions, 1);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                this.from_directions_clean(this.directions, 2);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.from_directions_clean(this.directions, 3);
                e.preventDefault();  // 取消默认行为
            }
        });

        this.ctx.canvas.addEventListener('mousedown', e => {
            this.save_clientX_clientY_rectLeft_rectRight(e);
            // 鼠标左键·
            if (e.which === 1 && this.skill_directions.includes("fireball") === false) {
                this.skill_directions.push("fireball");
                this.my_calculate_tx_ty();
                // 鼠标点击在地图外面将无效
                // if (this.tx < 0 || this.tx > this.playground.virtual_map_width || this.ty < 0 || this.ty > this.playground.virtual_map_height) {
                //     return ;
                // }
            }
            e.preventDefault();
        });

        this.ctx.canvas.addEventListener('mouseup', e => {
            this.save_clientX_clientY_rectLeft_rectRight(e);
            this.from_directions_clean(this.skill_directions, "fireball");
            e.preventDefault();
        })

        // 鼠标移动的时候重新计算绝对位置
        // （但是这会产生一个bug：鼠标不动玩家移动会造成攻击位置错误，所以在需要攻击的时候也要重新计算）
        this.ctx.canvas.addEventListener('mousemove', e => {
            this.save_clientX_clientY_rectLeft_rectRight(e);
            this.my_calculate_tx_ty();
        })
    }

    shoot_fireball(tx, ty) {
        let radius = this.playground.height * 0.01 / this.playground.scale;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5 / this.playground.scale;
        let move_length = this.playground.height * 1.5 / this.playground.scale;
        let fireball = new FireBall(this.playground, this, this.x, this.y, radius, vx, vy, color, speed, move_length, 10);
        this.playground.fireballs.push(fireball);

        return fireball;
    }

    // 根据uuid来删除火球
    destroy_fireball(uuid) {
        for (let i = 0; i < this.playground.fireballs.length; i++) {
            let fireball = this.playground.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    scan_skills(directions) {
        if (directions.includes("fireball")) {
            // this.my_calculate_tx_ty();
            let fireball = this.shoot_fireball(this.tx, this.ty);

            if (this.playground.store.state.mode_name === "multi mode") {
                this.playground.mps.send_shoot_fireball(fireball.uuid, this.tx, this.ty);
                console.log("send shoot fireball");
            }
        }
    }

    // 将监听事件里的位置临时变量存储到玩家的类中，用于后续计算
    save_clientX_clientY_rectLeft_rectRight(e) {
        this.last_clientX = e.clientX;
        this.last_clientY = e.clientY;

        // 获取canvas左上角在整个屏幕上的坐标（主要用在acapp小窗口上，WEB端canvas左上角就是屏幕左上角）
        const rect = this.ctx.canvas.getBoundingClientRect();
        this.last_rect_left = rect.left;
        this.last_rect_top = rect.top;
    }

    // 使用监听事件里的相对坐标计算在虚拟地图中的绝对坐标
    my_calculate_tx_ty() {
        this.tx = this.playground.my_calculate_tx(this.last_clientX - this.last_rect_left);
        this.ty = this.playground.my_calculate_ty(this.last_clientY - this.last_rect_top);
    }

    // 计算两点间欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_toward(directions) {
        if (directions.includes(0) && !directions.includes(2)) {
            this.vy = -this.speed;
        } else if (!directions.includes(0) && directions.includes(2)) {
            this.vy = this.speed;
        } else {
            this.vy = 0;
        }

        if (directions.includes(1) && !directions.includes(3)) {
            this.vx = this.speed;
        } else if (!directions.includes(1) && directions.includes(3)) {
            this.vx = -this.speed;
        } else {
            this.vx = 0;
        }

        if (this.vx !== 0 && this.vy !== 0) {
            this.vx /= Math.sqrt(2);
            this.vy /= Math.sqrt(2);
        }
    }

    // 玩家被攻击（伤害角度暂时用不到）
    is_attacked(angle, damage) {
        for (let i = 0; i < 15 + Math.random() * 10; i++) {
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 4;  // 控制粒子的射速（间接控制射程）
            let move_length = this.radius * Math.random() * 5;  // 控制粒子射程
            new Particle(this.playground, this.x, this.y, radius, vx, vy, color, speed, move_length);
        }

        this.health -= damage;
        if (this.health <= 0) {
            this.lose();
            return false;
        }
    }

    // 收到有人被攻击的广播（并不一定是窗口的主人被攻击）
    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    lose() {
        // 死一个新加入一个
        if (this.character === "me") {
            this.playground.lose();
        } else {
            this.playground.append_player();
        }

        this.destroy();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }

    // 从directions中清除所有operation对应的操作
    from_directions_clean(directions, operation) {
        for (let i = 0; i < directions.length; i++) {
            if (directions[i] === operation) {
                directions.splice(i, 1);
                i--;
            }
        }
    }

    auto_shoot_fireball() {
        let players = this.playground.players;

        if (this.spent_time > 3 && Math.random() < 1 / 180.0 && players.length >= 2) {
            let player = this;
            for (let i = 0; player === this && i < 1000; i++) {
                player = players[Math.floor(Math.random() * players.length)];
            }
            this.shoot_fireball(player.x, player.y);
        }

    }

    robot_update() {
        this.auto_shoot_fireball();

        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
            // 机器人的运动永不停歇
            let tx = Math.random() * this.playground.virtual_map_width;
            let ty = Math.random() * this.playground.virtual_map_height;
            this.move_to(tx, ty);
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
    }

    late_update() {
        if (this.playground.store.state.restart) {
            return;
        }

        this.spent_time += this.timedelta / 1000;

        if (this.character === "robot") {
            this.robot_update();
        } else {
            this.update_move();
            this.update_attack();
        }

        // if (this.character === "me" && this.playground.focus_player === this) {
        //     this.playground.re_calculate_cx_cy(this.x, this.y);
        // }
        this.render();

        // 如果是玩家，并且正在被聚焦，修改background的 (cx, cy)
        // if (this.character === "me" && this.playground.focus_player === this) {
        //     this.playground.re_calculate_cx_cy(this.x, this.y);
        // }
    }

    update_move() {
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        // 只有当前操作数组的长度改变时才会调用里面的操作，下面技能数组同理
        if (this.last_directions_length !== this.directions.length) {
            this.move_toward(this.directions);
            if (this.playground.store.state.mode_name === "multi mode") {
                // *************************************************************************************
                // 前后端传输消息的整个流程：
                // 玩家在进行操作的时候首先判断当前是多人游戏模式，于是调用mps相应的函数
                // mps的相关逻辑在multiplayer.js里，这会调用相应的send_move_toward函数开始向后端发送数据
                // 其中'event'字段的作用就是为了在后端完成路由
                // 后端用async def receive(self, text_data)函数对接收到的信息进行路由，跳转到对应的后端move_toward函数
                // 后端move_toward函数会将消息广播给组里的所有人，其他人通过async def group_send_event(self, data)函数将信息发送给每个人对应的前端
                // 前端在multiplayer.js里通过receive()函数的this.ws.onmessage接收后端发来的信息，并进行路由
                // *************************************************************************************
                this.playground.mps.send_move_toward(this.directions);
                console.log("send move toward");
            }

            this.last_directions_length = this.directions.length;
        }
    }

    update_attack() {
        if (this.last_skill_directions_length !== this.skill_directions.length) {
            this.scan_skills(this.skill_directions);

            this.last_skill_directions_length = this.skill_directions.length;
        }
    }

    render() {
        // 把虚拟地图中的坐标换算成canvas中的坐标
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);

        if (ctx_x < -0.2 * this.playground.width / scale ||
            ctx_x > 1.2 * this.playground.width / scale ||
            ctx_y < -0.2 * this.playground.height / scale ||
            ctx_y > 1.2 * this.playground.height / scale) {
            if (this.character != "me") { // 一个隐藏的bug，如果是玩家自己并且return，会导致技能图标渲染不出来
                return;
            }
        }

        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (ctx_x - this.radius) * scale, (ctx_y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }
}