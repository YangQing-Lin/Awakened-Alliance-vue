import { AcGameObject } from "../AcGameObject";

// 技能基类
export class Skill extends AcGameObject {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player = player;
        this.icon_x = icon_x;
        this.icon_y = icon_y;
        this.icon_r = icon_r;

        this.name = "Skill";
        this.base_cold_time = 0;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.img = new Image();

        this.eps = 0.001;
    }

    use_skill() {

    }

    receive_use_skill() {

    }

    late_late_update() {
        this.update_code_time();
        if (this.player.character === "me") {
            this.render_icon();
        }
        this.render();
    }

    update_code_time() {
        this.cold_time -= this.timedelta / 1000;
        this.cold_time = Math.max(this.cold_time, 0);
    }

    render() {

    }

    render_icon() {
        let scale = this.playground.scale;

        // 绘制技能图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.icon_x * scale, this.icon_y * scale, this.icon_r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (this.icon_x - this.icon_r) * scale, (this.icon_y - this.icon_r) * scale, this.icon_r * 2 * scale, this.icon_r * 2 * scale);
        this.ctx.restore();
        // 绘制蒙板
        if (this.cold_time > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.icon_x * scale, this.icon_y * scale);
            this.ctx.arc(this.icon_x * scale, this.icon_y * scale, this.icon_r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.cold_time / this.base_cold_time) - Math.PI / 2, true);
            this.ctx.lineTo(this.icon_x * scale, this.icon_y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            this.ctx.fill();
        }
    }
}