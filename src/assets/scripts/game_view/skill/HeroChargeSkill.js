import { Skill } from "./Skill";

export class HeroChargeSkill extends Skill {
    constructor(playground, player, icon_x, icon_y, icon_r) {
        super(playground, player, icon_x, icon_y, icon_r);

        this.owner = "龙炎";
        this.name = "HeroCharge";
        this.skill_type = "awakened_skill";
        this.base_cold_time = 1.8;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.base_move_length = 0.6;  // “英雄冲锋”的冲刺距离
        this.img.src = "https://project-static-file.oss-cn-hangzhou.aliyuncs.com/AwakenedAlliance/aoyi/longyan/awakened_skill.png";

        this.speed = this.player.base_speed * 4.5;
        this.base_bullet = 1;
        this.bullet = this.base_bullet;

        this.inner_players = new Set();  // 被冲锋沉默的玩家
    }

    start() {
    }

    use_skill() {
        if (this.cold_time < this.eps) {
            this.charge();
            this.bullet -= 1;

            if (this.bullet <= 0) {
                this.cold_time = this.base_cold_time;
            }

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
        this.charge();
        console.log("receive blink");
    }

    update_move() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
            this.player.state = "normal";
            // 冲锋结束后玩家还会眩晕0.5秒
            for (let player of this.inner_players) {
                setTimeout(function () {
                    player.state = "normal";
                }, 500);
            }
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.player.x += this.vx * moved;
            this.player.y -= this.vy * moved;
            this.move_length -= moved;
            this.update_inner_player_move(this.vx, this.vy, moved);
        }
    }

    update_inner_player_move(vx, vy, moved) {
        for (let player of this.playground.players) {
            if (player === this.player) continue;
            if (this.get_dist(this.player.x, this.player.y, player.x, player.y) <= this.player.radius + player.radius) {
                player.state = "vertigo";
                this.inner_players.add(player);
                player.x += vx * moved;
                player.y -= vy * moved;
            }
        }
    }

    charge() {
        this.player.state = "displacement";
        this.player.general_skill.fresh_cold_time();
        // 位移距离用屏幕高度的百分比来限制
        this.move_length = this.base_move_length;
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
        }
    }

    update_code_time() {
        this.cold_time -= this.timedelta / 1000;
        this.cold_time = Math.max(this.cold_time, 0);

        if (this.bullet === 0 && this.cold_time < this.eps) {
            this.bullet = this.base_bullet;
        }
    }

    // 计算两点间欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}