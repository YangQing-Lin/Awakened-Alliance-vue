import { AcGameObject } from "../AcGameObject";

export class Arrow extends AcGameObject {
    constructor(playground, player, max_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player = player;
        this.max_length = max_length;
        this.angle = 0;

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
        this.tx = this.player.tx;
        this.ty = this.player.ty;

        if (this.playground.store.state.game_state === "fighting") {
            this.render();
        }
    }

    render() {
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.y);
        let ctx_tx = this.playground.my_calculate_relative_position_x(this.tx);
        let ctx_ty = this.playground.my_calculate_relative_position_y(this.ty);

        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
            return;
        }

        // this.drawArrow(this.ctx, this.x, this.y, this.ctx_x, this.ctx_y, )
        this.drawArrow(this.ctx, ctx_x * scale, ctx_y * scale, ctx_tx * scale, ctx_ty * scale, 30, this.player.radius * scale, this.player.radius * 0.2 * scale, 'yellow');

        // this.ctx.beginPath();
        // this.ctx.moveTo((ctx_x - this.half_line * 1.13) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineTo((ctx_x + this.half_line * 1.13) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineWidth = 11;
        // this.ctx.strokeStyle = "black";
        // this.ctx.stroke();

        // this.ctx.beginPath();
        // this.ctx.moveTo((ctx_x - this.half_line * 1.1) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineTo((ctx_x + this.half_line * 1.1) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineWidth = 9;
        // this.ctx.strokeStyle = this.background_color;
        // this.ctx.stroke();

        // this.ctx.beginPath();
        // this.ctx.moveTo((ctx_x - this.half_line) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineTo((ctx_x + (this.half_line * 2 * this.player.health / 100 - this.half_line)) * scale, (ctx_y - this.botton_on_player) * scale);
        // this.ctx.lineWidth = 5;
        // this.ctx.strokeStyle = this.color;
        // this.ctx.stroke();

        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
    }

    drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {

        theta = typeof (theta) != 'undefined' ? theta : 30;
        headlen = typeof (theta) != 'undefined' ? headlen : 10;
        width = typeof (width) != 'undefined' ? width : 1;
        color = typeof (color) != 'color' ? color : '#000';

        // 计算各角度和对应的P2,P3坐标
        var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
            angle1 = (angle + theta) * Math.PI / 180,
            angle2 = (angle - theta) * Math.PI / 180,
            topX = headlen * Math.cos(angle1),
            topY = headlen * Math.sin(angle1),
            botX = headlen * Math.cos(angle2),
            botY = headlen * Math.sin(angle2);

        ctx.save();
        ctx.beginPath();

        var arrowX = fromX - topX,
            arrowY = fromY - topY;

        ctx.moveTo(arrowX, arrowY);
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        arrowX = toX + topX;
        arrowY = toY + topY;
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(toX, toY);
        arrowX = toX + botX;
        arrowY = toY + botY;
        ctx.lineTo(arrowX, arrowY);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.restore();
    }
}