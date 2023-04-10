import { FireBall } from "./FireBall";
import { Skill } from "./Skill";

export class RapidFireSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "太二";
        this.name = "RapidFireSkill";
        this.skill_type = "general_skill";
        this.base_cold_time = 1;  // 冷却时间，单位：秒
        this.cold_time = 0;

        this.base_fire_interval = 0.3;  // 射击间隔，单位：秒
        this.fire_interval = this.base_fire_interval;
        this.base_bullet = 7;
        this.bullet = this.base_bullet;  // 剩余子弹数量

        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/taier/general_skill.png";
    }

    start() {
        this.fresh_cold_time();
    }

    fresh_cold_time() {
        this.cold_time = 0;
        this.fire_interval = 0;
        this.bullet = this.base_bullet;
    }

    use_skill(tx, ty) {
        // 只有当技能不在CD，并且不在射击间隔内，并且还有子弹时才会成功发射
        if (this.cold_time < this.eps && this.fire_interval < this.eps && this.bullet > 0) {
            let fireball = this.rapid_fire(tx, ty);
            this.fire_interval = this.base_fire_interval;
            this.bullet -= 1;

            if (this.bullet <= 0) {
                this.cold_time = this.base_cold_time;
            }

            if (this.player.character === "me" && this.playground.store.state.game_mode === "multi mode") {
                let skill_data = {
                    "ball_uuid": fireball.uuid,
                    "tx": tx,
                    "ty": ty,
                };
                // this.playground.mps.send_use_general_skill(skill_data);
                // console.log("send use general attack");
            }
        }
    }

    update_code_time() {
        this.cold_time -= this.timedelta / 1000;
        this.cold_time = Math.max(this.cold_time, 0);

        this.fire_interval -= this.timedelta / 1000;
        this.fire_interval = Math.max(this.fire_interval, 0);

        if (this.bullet === 0 && this.cold_time < this.eps) {
            this.bullet = this.base_bullet;
        }
    }

    rapid_fire(tx, ty) {
        let delta_angle = Math.PI / 10;

        if (this.player.level < 5) {
            this.shoot_fireball(tx, ty, delta_angle / 2);
            this.shoot_fireball(tx, ty, -delta_angle / 2);
        } else if (this.player.level < 10) {
            this.shoot_fireball(tx, ty, delta_angle)
            this.shoot_fireball(tx, ty, 0);
            this.shoot_fireball(tx, ty, -delta_angle);
        } else {
            this.shoot_fireball(tx, ty, delta_angle / 2);
            this.shoot_fireball(tx, ty, delta_angle * 1.5);
            this.shoot_fireball(tx, ty, -delta_angle / 2);
            this.shoot_fireball(tx, ty, -delta_angle * 1.5);
        }

    }

    receive_use_skill(skill_data) {
        let fireball = this.shoot_fireball(skill_data["tx"], skill_data["ty"]);
        fireball.uuid = skill_data["ball_uuid"];
        console.log("receive shoot fireball");
    }

    shoot_fireball(tx, ty, delta_angle) {
        let radius = this.playground.height * 0.01 / this.playground.scale;
        let angle = Math.atan2(ty - this.player.y, tx - this.player.x);
        angle += delta_angle;
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "red";
        let speed = this.playground.height * 0.8 / this.playground.scale;
        let move_length = this.playground.height * 0.4 / this.playground.scale;
        let fireball = null;
        if (this.player.character === "me") {
            fireball = new FireBall(this.playground, this.player, this.player.x, this.player.y, radius, vx, vy, color, speed, move_length, 50);
        } else {
            fireball = new FireBall(this.playground, this.player, this.player.x, this.player.y, radius, vx, vy, color, speed, move_length, 10);
        }
        this.playground.fireballs.push(fireball);

        return fireball;
    }
}