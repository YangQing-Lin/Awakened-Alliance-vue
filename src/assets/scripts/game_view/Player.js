import { isMemoSame, readonly } from "vue";
import { routeLocationKey } from "vue-router";
import { AcGameObject } from "./AcGameObject";
import { Particle } from "./Particle";
import { FireBall } from "./skill/FireBall";

export class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        this.character = is_me;

        this.health = 20;
        this.eps = 0.001;
        this.directions = [];  // 用户的操作列表
        this.rand_directions = [];  // 给机器人用的随机操作列表
        this.tx = 0;  // 鼠标的实时位置
        this.ty = 0;
        this.friction = 0.9;  // 摩擦力
        this.spent_time = 0;

        if (this.is_me === "me") {
            console.log(this.playground.store.state);
            this.img = new Image();
            this.img.src = this.playground.store.state.photo;
        }
    }

    start() {
        this.ctx.canvas.focus();

        if (this.is_me === "me") {
            this.add_listening_events();
        } else if (this.is_me === "robot") {
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
            if (e.key === 'w' || e.key === 'ArrowUp') {
                // 保证不会重复输入，后面的完全清楚只是保险起见
                if (this.directions.includes(0) === false) {
                    this.directions.push(0);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'ArrowRight') {
                if (this.directions.includes(1) === false) {
                    this.directions.push(1);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'ArrowDown') {
                if (this.directions.includes(2) === false) {
                    this.directions.push(2);
                }
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'ArrowLeft') {
                if (this.directions.includes(3) === false) {
                    this.directions.push(3);
                }
                e.preventDefault();  // 取消默认行为
            }
        });

        this.ctx.canvas.addEventListener('keyup', e => {
            if (e.key === 'w' || e.key === 'ArrowUp') {
                this.from_directions_clean(0);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'd' || e.key === 'ArrowRight') {
                this.from_directions_clean(1);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 's' || e.key === 'ArrowDown') {
                this.from_directions_clean(2);
                e.preventDefault();  // 取消默认行为
            } else if (e.key === 'a' || e.key === 'ArrowLeft') {
                this.from_directions_clean(3);
                e.preventDefault();  // 取消默认行为
            }
        });

        this.ctx.canvas.addEventListener('mousedown', e => {
            // 获取canvas左上角在整个屏幕上的坐标（主要用在acapp小窗口上，WEB端canvas左上角就是屏幕左上角）
            const rect = this.ctx.canvas.getBoundingClientRect();
            // 鼠标左键·
            if (e.which === 1 && this.directions.includes("fireball") === false) {
                this.directions.push("fireball");
                this.tx = this.playground.my_calculate_tx(e.clientX - rect.left);
                this.ty = this.playground.my_calculate_ty(e.clientY - rect.top);
                // 鼠标点击在地图外面将无效
                // if (this.tx < 0 || this.tx > this.playground.virtual_map_width || this.ty < 0 || this.ty > this.playground.virtual_map_height) {
                //     return ;
                // }
            }
            e.preventDefault();
        });

        this.ctx.canvas.addEventListener('mouseup', e => {
            this.from_directions_clean("fireball");
            e.preventDefault();
        })

        this.ctx.canvas.addEventListener('mousemove', e => {
            const rect = this.ctx.canvas.getBoundingClientRect();
            this.tx = this.playground.my_calculate_tx(e.clientX - rect.left);
            this.ty = this.playground.my_calculate_ty(e.clientY - rect.top);
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
    }

    scan_skills(directions) {
        if (directions.includes("fireball")) {
            this.shoot_fireball(this.tx, this.ty);
        }
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

    lose() {
        // 死一个新加入一个
        if (this.is_me === "me") {
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
            }
        }
    }

    // 从directions中清除所有operation对应的操作
    from_directions_clean(operation) {
        for (let i = 0; i < this.directions.length; i++) {
            if (this.directions[i] === operation) {
                this.directions.splice(i, 1);
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
            // 永不停歇
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

        if (this.is_me === "robot") {
            this.robot_update();
        } else {
            this.x += this.vx * this.timedelta / 1000;
            this.y += this.vy * this.timedelta / 1000;
            this.move_toward(this.directions);
            this.scan_skills(this.directions);
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

    render() {
        // 把虚拟地图中的坐标换算成canvas中的坐标
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);

        if (this.is_me === "me") {
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