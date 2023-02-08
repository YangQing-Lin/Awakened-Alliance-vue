import { AcGameObject } from "./AcGameObject";
import { GameMap } from "./GameMap";
import { Player } from "./Player";

export class PlayGround extends AcGameObject {
    constructor(canvas, ctx, root) {
        super();
        this.canvas = canvas;
        this.ctx = ctx;
        this.root = root;
        this.width = this.root.clientWidth;
        this.height = this.root.clientHeight;

        this.scale = this.height;
        this.players = [];
        this.virtual_map_width = 3;  // 虚拟地图大小改成相对大小
        this.virtual_map_height = this.virtual_map_width; // 正方形地图，方便画格子

        this.game_map = new GameMap(this, this.canvas);
    }

    start() {
        this.update_size();

        let player = new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05, "white", this.height * 0.3, "me");
        this.players.push(player);
        this.re_calculate_cx_cy(player.x, player.y);
        this.focus_player = player;

        for (let i = 0; i < 10; i++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05, this.get_random_color(), this.height * 0.3, "robot"));
        }
    }

    // 根据玩家位置确定画布相对于虚拟地图的偏移量
    re_calculate_cx_cy(x, y) {
        this.cx = x - 0.5 * this.width / this.scale;
        this.cy = y - 0.5 * this.height / this.scale;

        let l = this.game_map.l;
        if (this.focus_player) {
            this.cx = Math.max(this.cx, -2 * l);
            this.cx = Math.min(this.cx, this.virtual_map_width - (this.width / this.scale - 2 * l));
            this.cy = Math.max(this.cy, -l);
            this.cy = Math.min(this.cy, this.virtual_map_height - (this.height / this.scale - l));
        }
    }

    append_player() {
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05, this.get_random_color(), this.height * 0.3, "robot"));
    }

    get_random_color() {
        let colors = ["red", "pink", "grey", "green", "lightblue", "lightgreen", "yellow", "orange", "gold"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update_size() {
        this.ctx.canvas.width = this.root.clientWidth;
        this.ctx.canvas.height = this.root.clientHeight;
    }

    win() {

    }

    lose() {

    }

    restart() {

    }

    update() {
        this.render();
    }

    render() {
    }
}