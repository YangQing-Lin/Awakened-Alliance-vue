import { Player } from "./Player";
import { FireBallSkill } from "../skill/FireBallSkill";
import { BlinkSkill } from "../skill/BlinkSkill";
import { ShieldSkill } from "../skill/ShieldSkill";

export class FireMage extends Player {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super(playground, x, y, radius, color, speed, character, username, photo);

        this.hero_name = "Fire Mage";
        this.general_skill = new FireBallSkill(this.playground, this, 0.6, 0.9, 0.04);  // 英雄普攻
        this.awakened_skill = new ShieldSkill(this.playground, this, 0.8, 0.9, 0.04);  // 英雄觉醒技能
        this.summoner_skill = new BlinkSkill(this.playground, this, 1.0, 0.9, 0.04);  // 召唤师技能
    }
}