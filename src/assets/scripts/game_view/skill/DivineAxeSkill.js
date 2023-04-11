import { FireBall } from "./FireBall";
import { Skill } from "./Skill";

export class DivineAxeSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "龙炎";
        this.name = "DivineAxeSkill";
        this.skill_type = "general_skill";
        this.damage = 70;

        this.player_base_speed = this.player.base_speed;  // 暂存玩家的基础速度
        this.base_cold_time = 0.6;  // 冷却时间，单位：秒
        this.cold_time = 0;
        this.base_fire_interval = 0;  // 射击间隔，单位：秒
        this.fire_interval = this.base_fire_interval;
        this.base_bullet = 1;
        this.bullet = this.base_bullet;  // 剩余子弹数量

        this.hit_numbers = 0;  // 命中敌人的次数
        this.axe_length = this.player.radius * 4;  // 斧子攻击范围的长度
        this.axe_width = this.player.radius * 1.2;  // 斧子攻击范围的宽度

        this.base_duration = 0.3;
        this.duration = 0;  // 攻击特效的持续时间，最后才会产生伤害

        this.base_accelerate_time = 1.5;  // 击中敌人三次后加速1.5秒
        this.accelerate_time = 0;
        this.is_accelerating = false;  // 是否正在加速，用于结束加速状态
        this.accelerate_ratio = 2;  // 加速倍率

        this.angle = 0;  // 攻击的角度，攻击一旦开始角度不可变
        this.can_hit = false;  // 是否可以攻击，用于在特效结束后对范围内的敌人进行攻击
        this.color = "rgba(255, 0, 0, 0.6)";


        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/longyan/general_skill.png";
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
            let fireball = this.axe(tx, ty);
            this.fire_interval = this.base_fire_interval;
            this.bullet -= 1;
            this.can_hit = true;

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

        this.duration -= this.timedelta / 1000;
        this.duration = Math.max(this.duration, 0);

        this.accelerate_time -= this.timedelta / 1000;
        this.accelerate_time = Math.max(this.accelerate_time, 0);

        if (this.bullet === 0 && this.cold_time < this.eps) {
            this.bullet = this.base_bullet;
        }

        if (this.is_accelerating && this.accelerate_time < this.eps) {
            this.restore_accelerate();
        }

        this.update_hit_player();

        console.log(this.hit_numbers, this.player.speed);
    }

    restore_accelerate() {
        this.player.base_speed = this.player_base_speed;
        this.player.speed = this.player.base_speed;
        this.is_accelerating = false;
    }

    accelerate() {
        this.player.base_speed = this.player_base_speed * 2;
        this.player.speed = this.player.base_speed;
        this.is_accelerating = true;
        this.accelerate_time = this.base_accelerate_time;
    }

    update_hit_player() {
        if (this.can_hit && this.duration < this.eps) {
            this.can_hit = false;
            let back = this.hit_palyer();
            if (back) {
                this.hit_numbers += 1;
                if (this.hit_numbers % 3 === 0) {
                    this.accelerate();
                }
            }
        }
    }

    hit_palyer() {
        let is_hit = true;

        return is_hit;
    }

    axe(tx, ty) {
        this.angle = Math.atan2(ty - this.player.y, tx - this.player.x);
        this.duration = this.base_duration;
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    receive_use_skill(skill_data) {
        let fireball = this.axe(skill_data["tx"], skill_data["ty"]);
        fireball.uuid = skill_data["ball_uuid"];
        console.log("receive shoot fireball");
    }

    render() {
        if (this.duration < this.eps) {
            return;
        }

        let scale = this.playground.scale;
        let ctx_x = this.playground.my_calculate_relative_position_x(this.player.x);
        let ctx_y = this.playground.my_calculate_relative_position_y(this.player.y);
        let ctx_tx = ctx_x + this.axe_length * Math.cos(this.angle);
        let ctx_ty = ctx_y + this.axe_length * Math.sin(this.angle);
        // let ctx_tx = ctx_x + (this.axe_length * (1 - this.duration / this.base_duration)) * Math.cos(this.angle);
        // let ctx_ty = ctx_y + (this.axe_length * (1 - this.duration / this.base_duration)) * Math.sin(this.angle);
        // let cx = ctx_x + this.cube_side_len * 0.5, cy = ctx_y + this.cube_side_len * 0.5; // grid的中心坐标

        // 处于屏幕范围外，则不渲染
        if (this.playground.is_element_out_of_screen(ctx_x, ctx_y)) {
            return;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(ctx_x * scale, ctx_y * scale);
        this.ctx.lineTo(ctx_tx * scale, ctx_ty * scale);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.axe_width * scale * (1 - this.duration / this.base_duration);
        this.ctx.stroke();
        this.ctx.restore();
    }
}