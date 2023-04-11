import { Player } from "./Player";
import { FireBallSkill } from "../skill/FireBallSkill";
import { BlinkSkill } from "../skill/BlinkSkill";
import { ShieldSkill } from "../skill/ShieldSkill";
import { RapidFireSkill } from "../skill/RapidFireSkill";
import { RollingSkill } from "../skill/RollingSkill";
import { DivineAxeSkill } from "../skill/DivineAxeSkill";
import { HeroChargeSkill } from "../skill/HeroChargeSkill";

export class LongYan extends Player {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super(playground, x, y, radius, color, speed, character, username, photo);

        this.hero_name = "龙炎";
        this.general_skill = new DivineAxeSkill(this.playground, this, 0.6, 0.9, 0.04);  // 英雄普攻
        this.awakened_skill = new HeroChargeSkill(this.playground, this, 0.8, 0.9, 0.04);  // 英雄觉醒技能
        this.summoner_skill = new BlinkSkill(this.playground, this, 1.0, 0.9, 0.04);  // 召唤师技能
    }

    level_up() {
        this.level += 1;
        if (this.level == 5) {
            this.general_skill.damage *= 1.5;
        }
        if (this.level == 10) {
            this.awakened_skill.base_bullet = 2;
        }
        // this.awakened_skill.bullet = this.awakened_skill.base_bullet;
        this.health = this.base_health;
    }
}