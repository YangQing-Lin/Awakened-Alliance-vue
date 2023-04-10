import { AcGameObject } from "../AcGameObject";

export class FireBall extends AcGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed * 2;
        this.move_length = move_length;
        this.damage = damage;

        this.eps = 0.001;
        this.ctx = this.playground.ctx;

        this.cons_flag = true;
    }

    start() {

    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        this.update_move();
        // 只有自己窗口发射的炮弹才判断碰撞
        if (this.player.character !== "enemy") {
            this.update_attack();
        }

        this.render();
    }

    update_move() {
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack() {
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius) {
            return true;
        }
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        let flag = player.is_attacked(angle, this.damage);

        // 调用广播函数
        if (this.playground.store.state.game_mode === "multi mode") {
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }

        if (flag) {
            // 如果返回值是true，说明被攻击者死亡
            this.player.level_up();
            console.log("LEVEL UP: ", this.player.level);
            // 调用广播函数
            if (this.playground.store.state.game_mode === "multi mode") {
                // TODO：当本地被攻击者死亡的时候，在多人模式下，可能对方刚好释放了治疗术，没有死
                // 为了保持一致，需要发送一个死亡同步函数，告诉对方他已经死了
            }
        }

        this.destroy();
    }

    // 在删除自己的时候要把所有的引用也删掉
    on_destroy() {
        for (let i = 0; i < this.playground.fireballs.length; i++) {
            if (this.playground.fireballs[i] === this) {
                this.playground.fireballs.splice(i, 1);
                break;
            }
        }
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);
        // 处于屏幕范围外，则不渲染
        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
            return;
        }

        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}