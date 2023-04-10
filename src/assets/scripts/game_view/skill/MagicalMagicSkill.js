import MagicCircle from "./MagicCircle";
import { Skill } from "./Skill";

export class MagicalMagicSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "小耶";
        this.name = "MagicalMagic";
        this.skill_type = "awakened_skill";
        this.base_cold_time = 1.8;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/xiaoye/awakened_skill.png";

        this.radius = this.playground.height * 0.11 / this.playground.scale;
        this.color = "pink";
    }

    use_skill() {
        if (this.cold_time < this.eps) {
            this.magic(this.player.tx, this.player.ty);
            this.cold_time = this.base_cold_time;

            if (this.playground.store.state.game_mode === "multi mode") {
                let skill_data = {
                    "tx": this.player.tx,
                    "ty": this.player.ty,
                };
                // this.playground.mps.send_use_summoner_skill(skill_data);
                // console.log("send use summoner skill");
            }
        }
    }

    receive_use_skill(skill_data) {
        this.magic(skill_data["tx"], skill_data["ty"]);
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
            this.player.y += -this.vy * moved;
            this.move_length -= moved;
        }
    }

    magic(tx, ty) {
        this.magic_circle = new MagicCircle(this.playground, this.player, tx, ty, this.radius, this.color);
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