import { FireBall } from "./FireBall";
import { Skill } from "./Skill";

export class MagicLightBallSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "小耶";
        this.name = "MagicLightBall";
        this.skill_type = "general_skill";
        this.base_cold_time = 0.8;  // 冷却时间，单位：秒
        this.cold_time = 0;

        this.base_fire_interval = 0;  // 射击间隔，单位：秒
        this.fire_interval = this.base_fire_interval;
        this.base_bullet = 1;
        this.bullet = this.base_bullet;  // 剩余子弹数量

        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/xiaoye/general_skill.png";

        this.radius = this.playground.height * 0.02 / this.playground.scale;
        this.color = "pink";
        this.speed = this.playground.height * 0.8 / this.playground.scale;
        this.move_length = this.playground.height * 0.6 / this.playground.scale;
        this.damage = 80;

        // this.player.level = 10;
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
            let fireball = this.fire(tx, ty);
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

    fire(tx, ty) {
        this.shoot_fireball(tx, ty, 0);
    }

    receive_use_skill(skill_data) {
        let fireball = this.shoot_fireball(skill_data["tx"], skill_data["ty"]);
        fireball.uuid = skill_data["ball_uuid"];
        console.log("receive shoot fireball");
    }

    shoot_fireball(tx, ty, delta_angle) {
        let angle = Math.atan2(ty - this.player.y, tx - this.player.x);
        angle += delta_angle;
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let fireball = null;
        if (this.player.character === "me") {
            fireball = new FireBall(this.playground, this.player, this.player.x, this.player.y, this.radius, vx, vy, this.color, this.speed, this.move_length, this.damage);
        } else {
            fireball = new FireBall(this.playground, this.player, this.player.x, this.player.y, this.radius, vx, vy, this.color, this.speed, this.move_length, 10);
        }
        this.playground.fireballs.push(fireball);

        return fireball;
    }
}