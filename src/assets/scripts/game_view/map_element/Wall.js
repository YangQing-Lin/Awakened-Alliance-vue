import { Grid } from "./Grid";

export class Wall extends Grid {
    constructor(game_map, playground, ctx, i, j, cube_side_len, stroke_color) {
        super(game_map, playground, ctx, i, j, cube_side_len, stroke_color);
        this.state = ""; // 格子里画什么
        this.base_fill_color = "rgb(213, 198, 76)"; // Wall
        this.fill_color = this.base_fill_color;
    }

    start() {

    }

    set_color() {
        // 玩家进入草丛之后草丛颜色变浅
        if (this.playground.players.length > 0) {
            let player = this.playground.players[0];
            if (player.character === "me" && this.get_manhattan_dist(this.x + this.cube_side_len / 2, this.y + this.cube_side_len / 2, player.x, player.y) < 1.5 * this.cube_side_len) {
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
