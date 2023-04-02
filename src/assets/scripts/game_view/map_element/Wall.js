import { Grid } from "./Grid";

export class Wall extends Grid {
    constructor(game_map, playground, ctx, i, j, cube_side_len, stroke_color) {
        super(game_map, playground, ctx, i, j, cube_side_len, stroke_color);
        this.state = ""; // 格子里画什么
        this.base_fill_color = "rgb(213, 198, 76)"; // Wall
        this.fill_color = this.base_fill_color;

        this.character = "wall";

        this.eps = 0.001;
    }

    start() {
        if (this.i === 0 && this.j === 0) {
            this.base_fill_color = "green";
        }
    }

    is_collision(player) {
        if (this.i !== 0 || this.j !== 0) {
            return;
        }
        let wall_center_x = this.x + this.cube_side_len / 2;
        let wall_center_y = this.y + this.cube_side_len / 2;
        let real_dist = this.get_dist(wall_center_x, wall_center_y, player.x, player.y);
        let collision_angle = Math.atan2(this.y - player.y, this.x - player.x);  // angle1
        let speed_angle = player.speed_angle;  // angle2
        let wall_inside_dist = Math.abs((this.cube_side_len / 2) / Math.cos(collision_angle));

        // console.log("wall: ", wall_center_x, wall_center_y);
        // console.log("player: ", player.x, player.y)
        // console.log("real dist: ", real_dist);
        // console.log("wall inside dist: ", wall_inside_dist);
        // console.log("len: ", real_dist - player.radius - wall_inside_dist);
        // 已经在碰撞范围内 且 当前玩家正朝着墙内移动
        if (real_dist - player.radius - wall_inside_dist < this.eps &&
            (Math.abs(collision_angle - speed_angle) < Math.PI / 2 || Math.abs(collision_angle - speed_angle) > Math.PI * 1.5)) {
            this.set_collision_color("rgb(213, 198, 76, 0.5)");
            console.log("##############set color");
            return this.get_new_angle(collision_angle, speed_angle);
        } else {
            this.set_collision_color(this.base_fill_color);
        }

        return false;
    }

    // 传入两个角度collision_angle, speed_angle，计算新的angle3，使得angle3和collision_angle夹角刚好是90度
    // 两个参数分别对应angle1和angle2
    get_new_angle(collision_angle, speed_angle) {
        let d = 0, angle3 = 0;
        // 计算angle3
        if (Math.abs(collision_angle - speed_angle) < Math.PI / 2) {
            d = Math.PI / 2 - Math.abs(collision_angle - speed_angle);
            let diff = speed_angle - collision_angle;
            if (collision_angle > 0 && speed_angle > 0 && diff > 0 ||
                collision_angle < 0 && speed_angle > 0 && diff > 0 ||
                collision_angle < 0 && speed_angle < 0 && diff > 0) {
                angle3 = speed_angle + d;
            } else {
                angle3 = speed_angle - d;
            }
        } else {
            d = Math.PI / 2 - (2 * Math.PI - Math.abs(collision_angle - speed_angle));
            if (speed_angle < 0 && collision_angle > 0) {
                angle3 = speed_angle + d;
            } else if (speed_angle > 0 && collision_angle < 0) {
                angle3 = speed_angle - d;
            }
        }

        return angle3;
    }

    set_player_point_color() {

    }

    set_collision_color(color) {
        this.fill_color = color;
    }

    // set_color() {
    //     if (this.playground.players.length > 0) {
    //         let player = this.playground.players[0];
    //         // 玩家周围九个格子的墙会变色（开发测试用）
    //         let real_dist = this.get_manhattan_dist(this.x + this.cube_side_len / 2, this.y + this.cube_side_len / 2, player.x, player.y);
    //         let limit_dist = 1.5 * this.cube_side_len;
    //         if (player.character === "me" && real_dist < limit_dist) {
    //             this.fill_color = "rgb(255, 115, 119)";
    //         }
    //     }
    // }

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
