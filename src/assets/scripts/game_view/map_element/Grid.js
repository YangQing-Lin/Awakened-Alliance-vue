import { AcGameObject } from "../AcGameObject";

export class Grid extends AcGameObject {
    constructor(playground, ctx, i, j, cube_side_len, stroke_color) {
        super();
        this.playground = playground;
        this.ctx = ctx;
        this.i = i;
        this.j = j;
        this.cube_side_len = cube_side_len;
        this.x = this.i * this.cube_side_len;
        this.y = this.j * this.cube_side_len;

        // 相对画布的坐标
        this.relative_position_x = 0;
        this.relative_position_y = 0;

        this.stroke_color = stroke_color;  // 网格线的颜色
        this.has_grass = false; // 格子上有草否
        this.is_poisoned = false; // 格子是否在毒圈

        this.grass_color = "rgb(213, 198, 76)"; // 黄色玻璃（草丛的功能）
    }

    start() { }

    get_manhattan_dist(x1, y1, x2, y2) {
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }

    update() {
        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);
        let cx = ctx_x + this.cube_side_len * 0.5, cy = ctx_y + this.cube_side_len * 0.5; // grid的中心坐标

        // 处于屏幕范围外，则不渲染
        if (cx * scale < -0.2 * this.playground.width ||
            cx * scale > 1.2 * this.playground.width ||
            cy * scale < -0.2 * this.playground.height ||
            cy * scale > 1.2 * this.playground.height) {
            return;
        }

        this.render_grid(ctx_x, ctx_y, scale);

        // 玩家进入草丛之后草丛颜色变浅
        if (this.has_grass && this.playground.players.length > 0) {
            let player = this.playground.players[0];
            if (player.character === "me" && this.get_manhattan_dist(this.x + this.cube_side_len / 2, this.y + this.cube_side_len / 2, player.x, player.y) < 1.5 * this.cube_side_len)
                this.grass_color = "rgba(213, 198, 76, 0.3)";
            else
                this.grass_color = "rgb(213, 198, 76)";
            this.render_grass(ctx_x, ctx_y, scale);
        }


    }

    render_grid(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.cube_side_len * 0.03 * scale;
        this.ctx.strokeStyle = this.stroke_color;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.cube_side_len * scale, this.cube_side_len * scale);
        this.ctx.stroke();
        this.ctx.restore();
    }

    render_grass(ctx_x, ctx_y, scale) {
        this.ctx.save();
        this.ctx.beginPath();
        // this.ctx.lineWidth = this.cube_side_len * 0.03 * scale;
        this.ctx.lineWidth = 0;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.cube_side_len * scale, this.cube_side_len * scale);
        this.ctx.fillStyle = this.grass_color;
        this.ctx.fill();
        this.ctx.restore();
    }
}
