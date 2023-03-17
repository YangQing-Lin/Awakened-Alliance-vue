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
        this.directions = new Set();  // 用户的操作列表
        this.last_directions_size = 0;  // 操作列表的长度（每当directions长度更改的时候向后端发送数据，长度不变就不发送，降低服务器压力）
        this.skill_directions = new Set();  // 用户的技能操作列表
        this.last_skill_directions_size = 0;
        this.cur_skill = null;
        this.rand_directions = new Set();  // 给机器人用的随机操作列表
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

        if (this.character === "me") {
            this.base_fireball_coldtime = 1;  // 冷却时间，单位：秒
            this.fireball_coldtime = this.base_fireball_coldtime;
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";

            this.base_blink_coldtime = 3;
            this.blink_coldtime = this.base_blink_coldtime;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        if (this.playground.store.state.mode_name === "multi mode") {
            this.playground.notice_board.add();
            if (this.playground.notice_board.player_count >= 3) {
                this.playground.store.commit('updateGameState', "fighting");
                this.playground.notice_board.write("Fighting");
            }
        }

        this.ctx.canvas.focus();

        // 机器人的运动和玩家的不一样，玩家是通过键盘操作指定移动方向，机器人是直线移动到随机的坐标点
        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            let tx = Math.random() * this.playground.virtual_map_width;
            let ty = Math.random() * this.playground.virtual_map_height;
            this.move_to(tx, ty);

            // 机器人使用的移动方法是随机一个目的地坐标，方向向量集合暂时用不到
            // for (let i = 0; i < 4; i++) {
            //     // Math.round(Math.random())：随机生成0和1
            //     this.rand_directions.add(Math.round(Math.random() * 4));
            // }
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
            // 非对战状态无法进行操作
            if (this.playground.store.state.game_state !== "fighting") {
                return false;
            }
            // 操作方式：wasd / 上下左右
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                // 保证不会重复输入，后面的完全清楚只是保险起见
                this.directions.add(0);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.directions.add(1);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                this.directions.add(2);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.directions.add(3);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'f' || e.key === 'F') {
                if (this.blink_coldtime < this.eps) {
                    this.cur_skill = this.cur_skill === "blink" ? null : "blink";
                }
                console.log(this.cur_skill);
            }
        });

        this.ctx.canvas.addEventListener('keyup', e => {
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                this.directions.delete(0);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
                this.directions.delete(1);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
                this.directions.delete(2);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
                this.directions.delete(3);
                e.preventDefault();  // 取消默认行为
            }
        });

        this.ctx.canvas.addEventListener('mousedown', e => {
            // 非对战状态无法进行操作
            if (this.playground.store.state.game_state !== "fighting") {
                return false;
            }
            this.save_clientX_clientY_rectLeft_rectRight(e);
            // 鼠标左键·
            if (e.which === 1) {
                this.my_calculate_tx_ty();
                if (this.cur_skill === null) {
                    this.start_shoot_fireball();
                } else if (this.cur_skill === "blink") {
                    this.start_blink();
                    this.cur_skill = null;
                }
                // 鼠标点击在地图外面将无效
                // if (this.tx < 0 || this.tx > this.playground.virtual_map_width || this.ty < 0 || this.ty > this.playground.virtual_map_height) {
                //     return ;
                // }
            }
            e.preventDefault();
        });

        this.ctx.canvas.addEventListener('mouseup', e => {
            this.save_clientX_clientY_rectLeft_rectRight(e);
            this.skill_directions.delete("fireball");
            e.preventDefault();
        })

        // 鼠标移动的时候重新计算绝对位置
        // （但是这会产生一个bug：鼠标不动玩家移动会造成攻击位置错误，所以在需要攻击的时候也要重新计算）
        this.ctx.canvas.addEventListener('mousemove', e => {
            this.save_clientX_clientY_rectLeft_rectRight(e);
            this.my_calculate_tx_ty();
        })
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
        console.log("scan_skills(directions)");
    }

    start_blink() {
        if (this.blink_coldtime < this.eps) {
            this.blink(this.tx, this.ty);
            this.blink_coldtime = this.base_blink_coldtime;

            if (this.playground.store.state.mode_name === "multi mode") {
                this.playground.mps.send_blink(this.tx, this.ty);
                console.log("send blink");
            }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.x, this.y, tx, ty);
        console.log("d: ", d);
        d = Math.min(d, 0.6);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);
    }

    start_shoot_fireball() {
        // 只有当火球不在CD才会成功发射
        if (this.fireball_coldtime < this.eps) {
            let fireball = this.shoot_fireball(this.tx, this.ty);
            this.fireball_coldtime = this.base_fireball_coldtime;

            if (this.playground.store.state.mode_name === "multi mode") {
                this.playground.mps.send_shoot_fireball(fireball.uuid, this.tx, this.ty);
                console.log("send shoot fireball");
            }
        }
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
        if (directions.has(0) && !directions.has(2)) {
            this.vy = -this.speed;
        } else if (!directions.has(0) && directions.has(2)) {
            this.vy = this.speed;
        } else {
            this.vy = 0;
        }

        if (directions.has(1) && !directions.has(3)) {
            this.vx = this.speed;
        } else if (!directions.has(1) && directions.has(3)) {
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

    // 从directions中清除所有operation对应的操作（使用Set()之后就用不到了）
    // from_directions_clean(directions, operation) {
    //     for (let i = 0; i < directions.length; i++) {
    //         if (directions[i] === operation) {
    //             directions.splice(i, 1);
    //             i--;
    //         }
    //     }
    // }

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

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    late_update() {
        if (this.playground.store.state.restart) {
            return;
        }

        this.spent_time += this.timedelta / 1000;

        if (this.character === "robot") {
            this.robot_update();
        } else {
            // 只有当角色是自己并且游戏是对战状态才会更新技能冷却时间
            if (this.character === "me" && this.playground.store.state.game_state === "fighting") {
                this.update_coldtime();
            }
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
        if (this.last_directions_size !== this.directions.size) {
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

            this.last_directions_size = this.directions.size;
        }
    }

    update_attack() {
        if (this.last_skill_directions_size !== this.skill_directions.size) {
            this.scan_skills(this.skill_directions);

            this.last_skill_directions_size = this.skill_directions.size;
        }
    }

    render_skill_coldtime() {
        let x = 0.6, y = 0.9;
        let r = 0.04;
        let scale = this.playground.scale;

        // 绘制火球图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        // 绘制蒙板
        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / this.base_fireball_coldtime) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            this.ctx.fill();
        }


        x = 0.8, y = 0.9;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();
        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / this.base_blink_coldtime) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            this.ctx.fill();
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

        if (this.character === "me" && this.playground.store.state.game_state === "fighting") {
            this.render_skill_coldtime();
        }
    }
}