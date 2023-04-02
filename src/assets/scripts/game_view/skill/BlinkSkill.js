import { FireBall } from "./FireBall";
import { Skill } from "./Skill";

export class BlinkSkill extends Skill {
    constructor(playground, player, x, y, r) {
        super(playground, player, x, y, r);

        this.name = "Blink";
        this.base_cold_time = 3;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.img = new Image();
        this.img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
    }

    use_skill(tx, ty) {
        if (this.cold_time < this.eps) {
            this.blink(tx, ty);
            this.cold_time = this.base_cold_time;

            // TODO
            // if (this.playground.store.state.game_mode === "multi mode") {
            //     this.playground.mps.send_use_summoner_skill(tx, ty);
            //     console.log("send use summoner skill");
            // }
        }
    }

    blink(tx, ty) {
        let d = this.get_dist(this.player.x, this.player.y, tx, ty);
        d = Math.min(d, 0.6);
        let angle = Math.atan2(ty - this.player.y, tx - this.player.x);
        this.player.x += d * Math.cos(angle);
        this.player.y += d * Math.sin(angle);
    }

    // 计算两点间欧几里得距离
    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }
}