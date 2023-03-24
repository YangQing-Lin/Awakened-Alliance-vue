import { AcGameObject } from "./AcGameObject";

export class ScoreBoard extends AcGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.store = this.playground.store;

        this.win_img = new Image();
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png";

        this.lose_img = new Image();
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png";

        this.start();
        // this.win();
    }

    start() {

    }

    add_listening_events() {
        if (!this.ctx.canvas) {
            return false;
        }
        this.ctx.canvas.addEventListener('mouseup', e => {
            this.playground.show_select_mode();
        })
    }

    win() {
        this.playground.update_score();
        this.store.commit('updateGameState', "win");
        // this.playground.win();

        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 500);
    }

    lose() {
        this.playground.update_score();
        this.store.commit('updateGameState', "lose");
        // this.playground.lose();

        let outer = this;
        setTimeout(function () {
            outer.add_listening_events();
        }, 500);
    }

    late_late_update() {
        this.render();
    }

    render() {
        let len = this.playground.height / 2;

        if (this.store.state.game_state === "win") {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if (this.store.state.game_state == "lose") {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }
}