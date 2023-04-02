import { AcGameObject } from "../AcGameObject";

// 技能基类
export class Skill extends AcGameObject {
    constructor(playground, player, x, y, r) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.r = r;

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
            this.render();
        }
    }

    update_code_time() {
        this.cold_time -= this.timedelta / 1000;
        this.cold_time = Math.max(this.cold_time, 0);
    }

    render() {
        let scale = this.playground.scale;

        // 绘制技能图片
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.img, (this.x - this.r) * scale, (this.y - this.r) * scale, this.r * 2 * scale, this.r * 2 * scale);
        this.ctx.restore();
        // 绘制蒙板
        if (this.cold_time > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x * scale, this.y * scale);
            this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.cold_time / this.base_cold_time) - Math.PI / 2, true);
            this.ctx.lineTo(this.x * scale, this.y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
            this.ctx.fill();
        }
    }
}