import { AcGameObject } from "../AcGameObject";

export class Grid extends AcGameObject {
    constructor(game_map, playground, ctx, i, j, cube_side_len, stroke_color) {
        super();
        this.game_map = game_map;
        this.playground = playground;
        this.ctx = ctx;
        this.i = i;
        this.j = j;
        this.cube_side_len = cube_side_len;
        // 因为canvas的xy坐标轴和二维数组是相反的，所以在使用下标计算坐标的时候要反一下
        // 这样在外面New的时候就可以正常使用i和j这样的数组下标
        this.y = this.i * this.cube_side_len;
        this.x = this.j * this.cube_side_len;

        // 相对画布的坐标
        this.relative_position_x = 0;
        this.relative_position_y = 0;

        this.stroke_color = stroke_color;  // 网格线的颜色
        this.is_poisoned = false; // 格子是否在毒圈
        this.base_fill_color = null;
        this.fill_color = this.base_fill_color;
    }

    start() { }

    on_destroy() {
        for (let i = 0; i < this.game_map.grids.length; i++) {
            if (this.game_map.grids[i] === this) {
                this.game_map.grids.splice(i, 1);
                break;
            }
        }
    }

    get_manhattan_dist(x1, y1, x2, y2) {
        return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
    }

    update() {
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

        this.set_player_point_color();
        this.set_color();
        this.render_grid_stroke(ctx_x, ctx_y, scale);
        this.render(ctx_x, ctx_y, scale);
    }

    set_color() {
    }

    set_player_point_color() {
        if (this.playground.players.length > 0) {
            let player = this.playground.players[0];
            if (player.character === "me" && this.get_manhattan_dist(this.x + this.cube_side_len / 2, this.y + this.cube_side_len / 2, player.x, player.y) < 0.5 * this.cube_side_len) {
                this.fill_color = "rgba(56, 93, 56, 0.2)";
            } else {
                this.fill_color = this.base_fill_color;
            }
        }
    }

    render(ctx_x, ctx_y, scale) {
    }

    render_grid_stroke(ctx_x, ctx_y, scale) {
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
        this.ctx.lineWidth = 0;
        this.ctx.rect(ctx_x * scale, ctx_y * scale, this.cube_side_len * scale, this.cube_side_len * scale);
        this.ctx.fillStyle = this.grass_color;
        this.ctx.fill();
        this.ctx.restore();
    }
}
