import { Grid } from "./Grid";

export class Wall extends Grid {
    constructor(game_map, playground, ctx, i, j, cube_side_len, stroke_color) {
        super(game_map, playground, ctx, i, j, cube_side_len, stroke_color);
        this.state = ""; // 格子里画什么
        this.base_fill_color = "rgb(213, 198, 76)"; // Wall
        this.fill_color = this.base_fill_color;

        this.eps = 0.001;
    }

    start() {

    }

    is_collision(player) {
        let wall_center_x = this.x + this.cube_side_len / 2;
        let wall_center_y = this.y + this.cube_side_len / 2;
        let real_dist = this.get_manhattan_dist(wall_center_x, wall_center_y, player.x, player.y);
        let collision_angle = Math.atan2(this.y - player.y, this.x - player.x);  // angle1
        // let player_angle = player.speed_angle;  // angle2
        let wall_inside_dist = (this.cube_side_len / 2) / Math.cos(collision_angle);
        if (real_dist - player.radius - wall_inside_dist < this.eps) {
            return true;
        }
    }

    set_color() {
        if (this.playground.players.length > 0) {
            let player = this.playground.players[0];
            // 玩家周围九个格子的墙会变色（开发测试用）
            let real_dist = this.get_manhattan_dist(this.x + this.cube_side_len / 2, this.y + this.cube_side_len / 2, player.x, player.y);
            let limit_dist = 1.5 * this.cube_side_len;
            if (player.character === "me" && real_dist < limit_dist) {
                this.fill_color = "rgb(255, 115, 119)";
            }
        }
    }

    render(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 0;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.cube_side_len * scale, this.cube_side_len * scale);
        this.ctx.fillStyle = this.fill_color;
        this.ctx.fill();
        this.ctx.restore();
    }
}
