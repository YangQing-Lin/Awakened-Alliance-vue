import { Player } from "./Player";
import { FireBallSkill } from "../skill/FireBallSkill";
import { BlinkSkill } from "../skill/BlinkSkill";
import { ShieldSkill } from "../skill/ShieldSkill";
import { RapidFireSkill } from "../skill/RapidFireSkill";
import { RollingSkill } from "../skill/RollingSkill";
import { IceArrowSkill } from "../skill/IceArrowSkill";
import { ThousandArrowsSkill } from "../skill/ThousandArrowsSkill";

export class DiShiTian extends Player {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super(playground, x, y, radius, color, speed, character, username, photo);

        this.hero_name = "帝释天";
        this.general_skill = new IceArrowSkill(this.playground, this, 0.6, 0.9, 0.04);  // 英雄普攻
        this.awakened_skill = new ThousandArrowsSkill(this.playground, this, 0.8, 0.9, 0.04);  // 英雄觉醒技能
        this.summoner_skill = new BlinkSkill(this.playground, this, 1.0, 0.9, 0.04);  // 召唤师技能
    }

    level_up() {
        this.level += 1;
        if (this.level == 5) {
            this.awakened_skill.scatter = 5;
        }
        if (this.level == 10) {
            // 10级增加寒冰箭的减速比例和减速时间
            this.general_skill.decelerate_ratio * 1.5;
            this.general_skill.decelerate_time * 1.2;
        }
        this.health = this.base_health;
    }
}