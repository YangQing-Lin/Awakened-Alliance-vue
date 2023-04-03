import { AcGameObject } from "../AcGameObject";

export class HealthBar extends AcGameObject {
    constructor(playground, player) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player = player;
        this.half_line = this.player.radius * 1.2;
        this.botton_on_player = this.player.radius * 1.35;
        this.x = this.player.x;
        this.y = this.player.y;
        this.background_color = "grey";
        this.color = null;

        this.eps = 0.01;
    }

    start() {
        if (this.player.character === "robot" || this.player.character === "enemy") {
            this.color = "red";
        } else if (this.player.character === "me") {
            this.color = "lightgreen";
        } else {
            this.color = "yellow";
        }
    }

    late_update() {
        this.x = this.player.x;
        this.y = this.player.y;

        this.render();
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);

        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo((ctx_x - this.half_line * 1.13) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineTo((ctx_x + this.half_line * 1.13) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineWidth = 11;
        this.ctx.strokeStyle = this.black;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo((ctx_x - this.half_line * 1.1) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineTo((ctx_x + this.half_line * 1.1) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineWidth = 9;
        this.ctx.strokeStyle = this.background_color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo((ctx_x - this.half_line) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineTo((ctx_x + (this.half_line * 2 * this.player.health / 100 - this.half_line)) * scale, (ctx_y - this.botton_on_player) * scale);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
    }
}