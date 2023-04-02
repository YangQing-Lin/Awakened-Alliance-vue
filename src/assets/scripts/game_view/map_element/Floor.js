import { Grid } from "./Grid";

export class Floor extends Grid {
    constructor(game_map, playground, ctx, i, j, cube_side_len, stroke_color) {
        super(game_map, playground, ctx, i, j, cube_side_len, stroke_color);
        this.state = ""; // 格子里画什么
        this.base_fill_color = "rgb(136, 188, 194)"; // floor light_blue
        this.fill_color = this.base_fill_color;

        this.character = "floor";
    }

    start() {

    }

    set_color() {
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
