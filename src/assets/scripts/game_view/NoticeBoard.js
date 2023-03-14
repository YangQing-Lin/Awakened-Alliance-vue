// 实现联机对战（下） 01：10：08

import { AcGameObject } from "./AcGameObject";

export class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.player_count = 0;
        this.text = "已就绪：0人";
    }

    start() {

    }

    add() {
        this.player_count += 1;
        this.write("已就绪：" + this.player_count + "人");
    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "40px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, this.playground.height * 0.1);
    }
}