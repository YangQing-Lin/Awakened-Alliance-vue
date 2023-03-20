import { AcGameObject } from "../AcGameObject";

export class Wall extends AcGameObject {
    constructor(game_map, ctx, x, y, l, wall_img) {
        super();
        this.game_map = game_map;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.l = l;
        this.ax = this.x * this.l;
        this.ay = this.y * this.l;
        this.wall_img = wall_img;
    }

    start() {
    }

    on_destroy() {
        for (let i = 0; i < this.game_map.walls.length; i++) {
            if (this.game_map.walls[i] === this) {
                this.game_map.walls.splice(i, 1);
                break;
            }
        }
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = this.l * 0.03;
        this.ctx.strokeStyle = "rgba(0,0,0,0)";
        this.ctx.rect(this.ax, this.ay, this.l, this.l);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.wall_img, this.ax, this.ay, this.l, this.l);
        this.ctx.restore();
    }
}
