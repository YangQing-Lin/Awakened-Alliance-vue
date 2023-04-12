import { AcGameObject } from "../AcGameObject";

export default class MagicCircle extends AcGameObject {
    constructor(playground, player, x, y, radius, color) {
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;

        this.eps = 0.001;
        this.ctx = this.playground.ctx;
        this.decelerate_ratio = 0.6;  // 玩家进入魔法阵或被变身后的减速比例
        this.transformation_radis_ratio = 0.6;  // 玩家变成小熊之后的缩小比例
        this.base_circle_duration = 1;  // 法阵持续时间，法阵内的玩家减速
        this.circle_duration = this.base_circle_duration;
        this.base_magic_duration = 1.5;  // 法阵持续时间结束后，法阵内的玩家变熊的持续时间
        this.magic_duration = this.base_magic_duration;

        this.transformation_players = new Set();  // 被变身的玩家
    }

    start() {

    }

    update() {
        this.update_duration_time();
        this.update_inner_player();
        this.render();
    }

    update_inner_player() {
        if (this.circle_duration >= this.eps) {
            for (let player of this.playground.players) {
                if (player !== this.player && this.get_dist(player.x, player.y, this.x, this.y) < this.radius) {
                    player.speed = player.base_speed * (1 - this.decelerate_ratio);
                } else if (player !== this.player && this.get_dist(player.x, player.y, this.x, this.y) >= this.radius) {
                    player.speed = player.get_speed();
                }
            }
        } else if (this.transformation_players.size > 0) {
            for (let player of this.transformation_players) {
                player.speed = player.base_speed * (1 - this.decelerate_ratio);
            }
        }
    }

    // 法阵持续时间结束，将法阵范围内的玩家都变成小熊
    transformation_inner_player() {
        for (let player of this.playground.players) {
            if (player !== this.player && this.get_dist(player.x, player.y, this.x, this.y) < this.radius) {
                // TODO
                // 变小熊的影响暂时只有减速、减小半径、沉默，还没写更换图片的逻辑
                player.change_state({
                    "skill_name": "transformation",
                    "transformation_radis_ratio": this.transformation_radis_ratio,
                });
                this.transformation_players.add(player);
            }
        }
    }

    // 变身时间结束，还原玩家
    restore_players() {
        for (let player of this.transformation_players) {
            player.change_state({
                "skill_name": "transformation_restore",
            });
        }
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    update_duration_time() {
        if (this.circle_duration >= this.eps) {
            this.circle_duration -= this.timedelta / 1000;
            if (this.circle_duration < this.eps) {
                this.circle_duration = 0;
                this.magic_duration = this.base_magic_duration;
                this.transformation_inner_player();
            }
        } else {
            this.magic_duration -= this.timedelta / 1000;
        }

        if (this.magic_duration < this.eps) {
            this.destroy();
        }
    }

    on_destroy() {
        this.restore_players();
        this.transformation_players.clear();
        console.log("Magic Circle destroy");
    }

    render() {
        // 法阵持续时间结束后就不绘制法阵了
        if (this.circle_duration < this.eps) {
            return;
        }

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