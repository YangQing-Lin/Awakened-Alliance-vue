import { FireBall } from "./FireBall";

export class IceArrow extends FireBall {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
        super(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage);
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        let flag = player.is_attacked(angle, this.damage);

        // 调用广播函数
        // if (this.playground.store.state.game_mode === "multi mode") {
        //     this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        // }

        // 如果返回值是true，说明被攻击者死亡
        if (flag) {
            this.player.level_up();
            console.log("LEVEL UP: ", this.player.level);
            // 调用广播函数
            if (this.playground.store.state.game_mode === "multi mode") {
                // TODO：当本地被攻击者死亡的时候，在多人模式下，可能对方刚好释放了治疗术，没有死
                // 为了保持一致，需要发送一个死亡同步函数，告诉对方他已经死了
            }
        } else {
            // 被攻击者没死的话，寒冰箭会减速敌人
            // 每次减速20%，可叠加至100%，持续0.8秒
            player.change_state({
                "skill_name": "ice_arrow",
                "decelerate_ratio": 0.2,
                "time": 0.8,
            });
        }

        this.destroy();
    }
}