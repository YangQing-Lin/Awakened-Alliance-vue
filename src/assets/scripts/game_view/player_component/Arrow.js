import { AcGameObject } from "../AcGameObject";

export class Arrow extends AcGameObject {
    constructor(playground, player, max_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player = player;
        this.max_length = max_length;
        this.angle = 0;

        this.x = this.player.x;
        this.y = this.player.y;

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
        // console.log(this.angle);
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.player.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.player.y);
        let ctx_tx = this.playground.my_calculate_relative_position_x(this.player.tx);
        let ctx_ty = this.playground.my_calculate_relative_position_y(this.player.ty);

        if (this.playground.store.state.game_state === "fighting") {
            this.render(scale, ctx_x, ctx_y, ctx_tx, ctx_ty);
        }
    }

    render(scale, ctx_x, ctx_y, ctx_tx, ctx_ty) {
        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
            return;
        }

        this.angle = Math.atan2(ctx_ty * scale - ctx_y * scale, ctx_tx * scale - ctx_x * scale);
        this.drawArrow(this.ctx, ctx_x * scale, ctx_y * scale, ctx_tx * scale, ctx_ty * scale, 30, this.player.radius * scale, this.player.radius * 0.2 * scale, 'yellow');

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