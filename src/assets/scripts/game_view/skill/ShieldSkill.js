import { Skill } from "./Skill";

export class ShieldSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.name = "Shield";
        this.base_cold_time = 2;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.shield_radius = this.player.radius * 2;
        this.img.src = "https://tank-war-static.oss-cn-hangzhou.aliyuncs.com/BattleOfBalls/skill/shield.jfif";
        this.color = "rgb(158,55,155)";
        this.base_duration_time = 3;
        this.duration_time = 0;  // 护盾持续时间
    }

    use_skill() {
        console.log("use shield");
        if (this.cold_time < this.eps) {
            this.generate_shield();
            this.cold_time = this.base_cold_time;

            if (this.playground.store.state.game_mode === "multi mode") {
                let skill_data = {};
                this.playground.mps.send_use_awakened_skill(skill_data);
                console.log("send use awakened skill");
            }
        }
    }

    receive_use_skill(skill_data) {
        this.generate_shield();
        console.log("receive blink");
    }

    generate_shield() {
        this.duration_time = this.base_duration_time;
    }

    render() {
        if (this.duration_time <= this.eps) {
            this.duration_time = 0;
            return false;
        }
        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.player.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.player.y);

        this.ctx.beginPath();
        this.ctx.arc(ctx_x * scale, ctx_y * scale, this.shield_radius * scale, 0, Math.PI * 2, false);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
    }

    update() {
        this.update_duration_time();
        this.update_destroy_ball();
    }

    update_duration_time() {
        this.duration_time -= this.timedelta / 1000;
        this.duration_time = Math.max(0, this.duration_time);
    }

    update_destroy_ball() {
        if (this.duration_time < this.eps) {
            return;
        }
        for (let fireball of this.playground.fireballs) {
            if (fireball.player !== this.player && this.is_collision(fireball)) {
                fireball.destroy();
            }
        }
    }

    is_collision(ball) {
        if (this.get_dist(this.player.x, this.player.y, ball.x, ball.y) <= this.shield_radius + ball.radius) {
            return true;
        }
        return false;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}