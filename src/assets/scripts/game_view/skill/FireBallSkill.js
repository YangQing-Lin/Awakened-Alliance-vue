import { FireBall } from "./FireBall";
import { Skill } from "./Skill";

export class FireBallSkill extends Skill {
    constructor(playground, player, x, y, r) {
        super(playground, player, x, y, r);

        this.name = "FireBall";
        this.base_cold_time = 1;  // 冷却时间，单位：秒
        this.cold_time = this.base_cold_time;
        this.img = new Image();
        this.img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
    }

    use_skill(tx, ty) {
        // 只有当火球不在CD才会成功发射
        if (this.cold_time < this.eps) {
            let fireball = this.shoot_fireball(tx, ty);
            this.cold_time = this.base_cold_time;

            // TODO 编写对应的同步函数
            if (this.player.character === "me" && this.playground.store.state.game_mode === "multi mode") {
                let skill_data = {
                    "ball_uuid": fireball.uuid,
                    "tx": tx,
                    "ty": ty,
                };
                this.playground.mps.send_use_general_skill(skill_data);
                console.log("send use general attack");
            }
        }
    }

    receive_use_skill(skill_data) {
        let fireball = this.shoot_fireball(skill_data["tx"], skill_data["ty"]);
        fireball.uuid = skill_data["ball_uuid"];
        console.log("receive shoot fireball");
    }

    shoot_fireball(tx, ty) {
        let radius = this.playground.height * 0.01 / this.playground.scale;
        let angle = Math.atan2(ty - this.player.y, tx - this.player.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5 / this.playground.scale;
        let move_length = this.playground.height * 1.5 / this.playground.scale;
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