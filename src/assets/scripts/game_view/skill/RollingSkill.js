import { Skill } from "./Skill";

export class RollingSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "太二";
        this.name = "Rolling";
        this.skill_type = "awakened_skill";
        this.base_cold_time = 1.8;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/taier/awakened_skill.png";

        this.speed = this.player.base_speed * 3;
    }

    use_skill() {
        if (this.cold_time < this.eps) {
            this.rolling();
            this.cold_time = this.base_cold_time;

            if (this.playground.store.state.game_mode === "multi mode") {
                let skill_data = {
                    "tx": tx,
                    "ty": ty,
                };
                // this.playground.mps.send_use_summoner_skill(skill_data);
                // console.log("send use summoner skill");
            }
        }
    }

    receive_use_skill(skill_data) {
        this.rolling();
        console.log("receive blink");
    }

    update_move() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
            this.player.state = "normal";
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.player.x += this.vx * moved;
            this.player.y += this.vy * moved;
            this.move_length -= moved;
        }
    }

    rolling() {
        this.player.state = "displacement";
        this.player.general_skill.fresh_cold_time();
        // 位移距离用屏幕高度的百分比来限制
        this.move_length = 0.3;
        this.speed_angle = this.player.speed_angle;
        this.vx = Math.cos(this.speed_angle);
        // robot的Y轴移动和player不同，player为了更加直观用的是角度方向
        // 如Math.PI / 2这个角度就是向上移动，那么vy就是负数
        // 而机器人在移动的时候还需要用到this.move_length，比player更加复杂，所以不能用this.update_move();代替
        this.vy = Math.sin(this.speed_angle);
    }

    late_late_update() {
        this.update_code_time();
        if (this.player.character === "me") {
            this.render_icon();
        }
        this.render();
        if (this.player.state === "displacement") {
            this.update_move();
            // console.log(this.move_length);
        }
    }

    // 计算两点间欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}