import { isMemoSame, readonly } from "vue";
import { routeLocationKey } from "vue-router";
import { AcGameObject } from "../AcGameObject";
import { Particle } from "../Particle";
import { FireBall } from "../skill/FireBall";
import { HealthBar } from "../player_component/HealthBar";
import { FireBallSkill } from "../skill/FireBallSkill";
import { BlinkSkill } from "../skill/BlinkSkill";
import { ShieldSkill } from "../skill/ShieldSkill";

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
        this.base_speed = speed;
        this.speed = 0;
        this.speed_angle = 0;  // 速度角度，弧度制，用于控制玩家移动方向，在检测到碰撞的时候用于计算新的速度向量
        this.character = character;
        this.username = username;
        this.photo = photo;

        this.hero_name = "Player";
        this.health = 100;
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

        this.general_skill = new FireBallSkill(this.playground, this, 0.6, 0.9, 0.04);  // 英雄普攻
        this.awakened_skill = new ShieldSkill(this.playground, this, 0.8, 0.9, 0.04);  // 英雄觉醒技能
        this.summoner_skill = new BlinkSkill(this.playground, this, 1.0, 0.9, 0.04);  // 召唤师技能
        this.health_bar = new HealthBar(this.playground, this);
    }

    start() {
        if (this.playground.store.state.game_mode === "multi mode") {
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
            console.log("Hero Name:", this.hero_name);
        } else if (this.character === "robot") {
            this.move_length = 0;
            this.speed = this.base_speed;
            this.robot_update();

            // 机器人使用的移动方法是随机一个目的地坐标，方向向量集合暂时用不到
            // for (let i = 0; i < 4; i++) {
            //     // Math.round(Math.random())：随机生成0和1
            //     this.rand_directions.add(Math.round(Math.random() * 4));
            // }
        }
    }

    add_listening_events() {
        // 取消右键菜单功能
        this.ctx.canvas.addEventListener('contextmenu', e => {
            e.preventDefault();  // 取消默认行为
        });

        this.ctx.canvas.addEventListener('keydown', e => {
            console.log("in [player]", e.key);
            if (e.key === 'Enter') {
                if (this.playground.store.state.game_mode === "multi mode") {
                    this.playground.chat_field.show_input();
                }
                e.preventDefault();
            } else if (e.key === 'Escape') {
                if (this.playground.store.state.game_mode === "multi mode") {
                    this.playground.chat_field.hide_input();
                }
                e.preventDefault();
            }

            // 非对战状态无法进行操作
            if (this.playground.store.state.game_state !== "fighting") {
                return true;
            }
            // 操作方式：wasd / 上下左右
            if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
                // 保证不会重复输入，后面的delete只是保险起见
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
                this.cur_skill = this.cur_skill === "summoner_skill" ? null : "summoner_skill";
                console.log(this.cur_skill);
            } else if (e.key === ' ') {
                this.awakened_skill.use_skill();
            }

            this.update_move_toward();
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
            this.update_move_toward();
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
                    this.use_general_skill();
                } else if (this.cur_skill === "summoner_skill") {
                    this.use_summoner_skill();
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

    use_general_skill() {
        this.general_skill.use_skill(this.tx, this.ty);
    }

    use_summoner_skill() {
        this.summoner_skill.use_skill(this.tx, this.ty);
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

    update_speed_angle(directions) {
        // 根据操作数组来计算速度角度
        this.speed = this.base_speed;
        if (directions.size === 1 || directions.size === 3) {
            if (directions.has(0) && !directions.has(2))
                this.speed_angle = Math.PI / 2;
            else if (directions.has(1) && !directions.has(3))
                this.speed_angle = 0;
            else if (directions.has(2) && !directions.has(0))
                this.speed_angle = -Math.PI / 2;
            else if (directions.has(3) && !directions.has(1))
                this.speed_angle = Math.PI;
        } else if (directions.size === 2) {
            if (directions.has(0) && directions.has(1))
                this.speed_angle = Math.PI / 4;
            else if (directions.has(1) && directions.has(2))
                this.speed_angle = -Math.PI / 4;
            else if (directions.has(2) && directions.has(3))
                this.speed_angle = -Math.PI * 3 / 4;
            else if (directions.has(3) && directions.has(0))
                this.speed_angle = Math.PI * 3 / 4;
        } else {
            this.speed = 0;
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
            this.player_lose();
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

    player_lose() {
        // 死一个新加入一个
        if (this.character === "me") {
            // 这里必须判断是否对战状态，因为胜利之后点击确定也会删除自己
            if (this.playground.store.state.game_state === "fighting") {
                console.log("me LOST");
                this.playground.score_board.lose();
            }
        } else if (this.character === "robot") {
            this.playground.append_player();
        }

        this.destroy();
    }

    on_destroy() {
        if (this.health_bar) {
            this.health_bar.destroy();
        }
        this.health_bar = null;

        if (this.general_skill) {
            this.general_skill.destroy();
        }
        this.general_skill = null;

        if (this.awakened_skill) {
            this.awakened_skill.destroy();
        }
        this.awakened_skill = null;

        if (this.summoner_skill) {
            this.summoner_skill.destroy();
        }
        this.summoner_skill = null;

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

    robot_update() {
        this.auto_use_general_skill();

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

    // 人机会自动使用普攻
    auto_use_general_skill() {
        let players = this.playground.players;

        if (this.spent_time > 3 && Math.random() < 1 / 180.0 && players.length >= 2) {
            let player = this;
            for (let i = 0; player === this && i < 1000; i++) {
                player = players[Math.floor(Math.random() * players.length)];
            }
            this.general_skill.use_skill(player.x, player.y);
        }
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        this.speed_angle = Math.atan2(ty - this.y, tx - this.x);
        // this.check_collision();
        this.vx = Math.cos(this.speed_angle);
        // robot的Y轴移动和player不同，player为了更加直观用的是角度方向
        // 如Math.PI / 2这个角度就是向上移动，那么vy就是负数
        // 而机器人在移动的时候还需要用到this.move_length，比player更加复杂，所以不能用this.update_move();代替
        this.vy = Math.sin(this.speed_angle);
    }

    update_move() {
        // this.check_collision();
        this.vx = this.speed * Math.cos(this.speed_angle);
        this.vy = -this.speed * Math.sin(this.speed_angle);  // 这个负号很精髓
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;
    }

    check_collision() {
        let grids = this.playground.game_map.grids;
        for (let i = 0; i < grids.length; i++) {
            if (grids[i].character === "wall") {
                let new_angle = grids[i].is_collision(this);
                if (new_angle) {
                    // console.log("collision!", new_angle);
                    // this.speed_angle = new_angle;
                }
            }
        }
    }

    update_move_toward() {
        // 只有当前操作数组的长度改变时才会调用里面的操作，下面技能数组同理
        // 这么做是为了减少调用同步函数的次数，因为一直按着一个键会连续触发监听函数
        if (this.last_directions_size !== this.directions.size) {
            this.update_speed_angle(this.directions);
            if (this.playground.store.state.game_mode === "multi mode") {
                // *************************************************************************************
                // 前后端传输消息的整个流程：
                // 玩家在进行操作的时候首先判断当前是多人游戏模式，于是调用mps相应的函数
                // mps的相关逻辑在multiplayer.js里，这会调用相应的send_move_toward函数开始向后端发送数据
                // 其中'event'字段的作用就是为了在后端完成路由
                // 后端用async def receive(self, text_data)函数对接收到的信息进行路由，跳转到对应的后端move_toward函数
                // 后端move_toward函数会将消息广播给组里的所有人，其他人通过async def group_send_event(self, data)函数将信息发送给每个人对应的前端
                // 前端在multiplayer.js里通过receive()函数的this.ws.onmessage接收后端发来的信息，并进行路由
                // *************************************************************************************
                this.playground.mps.send_move_toward(this.directions, this.x, this.y);
                console.log("send move toward");
            }

            this.last_directions_size = this.directions.size;
        }
    }

    update() {
        // for (let i = 0; i < this.playground.players.length; i++) {
        //     let player = this.playground.players[i];
        //     if (player.character === "me") {
        //         console.log("me: ", player.x, player.y);
        //     } else {
        //         console.log(player.x, player.y);
        //     }
        // }
    }

    late_update() {
        this.spent_time += this.timedelta / 1000;

        if (this.character === "robot") {
            if (this.playground.store.state.game_state === "fighting") {
                this.robot_update();
            }
            this.render();
        }
    }

    late_late_update() {
        if (this.character !== "robot") {
            if (this.playground.store.state.game_state === "fighting") {
                // 只有当角色是自己并且游戏是对战状态才会检查胜利状态
                if (this.character === "me") {
                    this.update_win();
                }
                this.update_move();
                this.update_attack();
            }
            this.render();
        }

        // 如果是玩家，并且正在被聚焦，修改background的 (cx, cy)
        // if (this.character === "me" && this.playground.focus_player === this) {
        //     this.playground.re_calculate_cx_cy(this.x, this.y);
        // }
    }

    update_win() {
        if (this.playground.players.length === 1) {
            this.playground.score_board.win();
        }
    }

    update_attack() {
        if (this.last_skill_directions_size !== this.skill_directions.size) {
            this.scan_skills(this.skill_directions);

            this.last_skill_directions_size = this.skill_directions.size;
        }
    }

    render() {
        // 把虚拟地图中的坐标换算成canvas中的坐标
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);

        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
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