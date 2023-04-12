import { normalizeStyle } from "vue";
import { FireBall } from "./FireBall";
import { IceArrow } from "./IceArrow";
import { Skill } from "./Skill";

export class ThousandArrowsSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "帝释天";
        this.name = "ThousandArrowsSkill";
        this.skill_type = "awakened_skill";
        this.base_cold_time = 2;  // 冷却时间，单位：秒
        this.cold_time = 0;

        this.decelerate_ratio = this.player.general_skill.decelerate_ratio;  // 寒冰箭的减速比例
        this.decelerate_time = this.player.general_skill.decelerate_time;  // 寒冰箭的减速持续时间
        this.damage = this.player.general_skill.damage;
        this.radius = this.player.general_skill.radius;
        this.speed = this.player.general_skill.speed;
        this.move_length = this.player.general_skill.move_length;

        this.base_fire_interval = 0;  // 射击间隔，单位：秒
        this.fire_interval = this.base_fire_interval;
        this.base_bullet = 1;
        this.bullet = this.base_bullet;  // 剩余子弹数量

        this.scatter = 3;  // 散射量

        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/dishitian/awakened_skill.png";
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
            let fireball = this.archery(tx, ty);
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

    archery(tx, ty) {
        let delta_angle = Math.PI / 10;

        if (this.scatter === 3) {
            this.shoot_fireball(tx, ty, delta_angle)
            this.shoot_fireball(tx, ty, 0);
            this.shoot_fireball(tx, ty, -delta_angle);
        } else if (this.scatter === 5) {
            this.shoot_fireball(tx, ty, delta_angle);
            this.shoot_fireball(tx, ty, -delta_angle);
            this.shoot_fireball(tx, ty, 0);
            this.shoot_fireball(tx, ty, delta_angle * 2);
            this.shoot_fireball(tx, ty, -delta_angle * 2);
        } else {
            console.log("[SCATTER ERROR]");
        }
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
        let color = "red";
        let fireball = null;
        console.log(this.radius, this.speed, this.move_length, this.damage, this.decelerate_time, this.decelerate_time);
        if (this.player.character === "me") {
            fireball = new IceArrow(this.playground, this.player, this.player.x, this.player.y, this.radius, vx, vy, color, this.speed, this.move_length, this.damage, this.decelerate_ratio, this.decelerate_time);
        } else {
            fireball = new IceArrow(this.playground, this.player, this.player.x, this.player.y, this.radius, vx, vy, color, this.speed, this.move_length, 10, this.decelerate_ratio, this.decelerate_time);
        }
        this.playground.fireballs.push(fireball);

        return fireball;
    }
}