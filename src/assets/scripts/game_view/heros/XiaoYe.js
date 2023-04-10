import { Player } from "./Player";
import { FireBallSkill } from "../skill/FireBallSkill";
import { BlinkSkill } from "../skill/BlinkSkill";
import { ShieldSkill } from "../skill/ShieldSkill";
import { RapidFireSkill } from "../skill/RapidFireSkill";
import { RollingSkill } from "../skill/RollingSkill";
import { MagicLightBallSkill } from "../skill/MagicLightBallSkill";
import { MagicalMagicSkill } from "../skill/MagicalMagicSkill";

export class XiaoYe extends Player {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super(playground, x, y, radius, color, speed, character, username, photo);

        this.hero_name = "小耶";
        this.general_skill = new MagicLightBallSkill(this.playground, this, 0.6, 0.9, 0.04);  // 英雄普攻
        this.awakened_skill = new MagicalMagicSkill(this.playground, this, 0.8, 0.9, 0.04);  // 英雄觉醒技能
        this.summoner_skill = new BlinkSkill(this.playground, this, 1.0, 0.9, 0.04);  // 召唤师技能
    }

    // load_image() {
    //     this.img = new Image();
    //     this.img.src = this.playground.store.state.select_hero_info.avatar;
    // }
}