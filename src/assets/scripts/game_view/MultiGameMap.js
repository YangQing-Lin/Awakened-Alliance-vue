import { AcGameObject } from "./AcGameObject";
import { Floor } from "./map_element/Floor";
import { Grass } from "./map_element/Grass";
import { Grid } from "./map_element/Grid";
import { Wall } from "./map_element/Wall";

export class MultiGameMap extends AcGameObject {
    constructor(playground, canvas) {
        super();
        this.playground = playground;
        this.ctx = this.playground.ctx;
        this.canvas = canvas;

        this.width = this.playground.virtual_map_width;
        this.height = this.playground.virtual_map_height;
        this.cube_side_len = this.height * 0.05;  // 小方块边长
        this.nx = Math.ceil(this.width / this.cube_side_len);  // 20
        this.ny = Math.ceil(this.height / this.cube_side_len);  // 20

        this.grids = [];
        this.wall_img = new Image();
        this.wall_img.src = "https://s3.bmp.ovh/imgs/2021/11/837412e46f4f61a6.jpg";
        this.background_color = "gray";
        this.stroke_color = "rgb(222, 237, 225)";
    }

    start() {
        this.load_map();

        this.generate_grid();
        // this.generate_grass();
    }

    get_random_color() {
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00', '#FFDAB9', '#FF6437', '#CD853F'];
        return colors[Math.floor(Math.random() * 6)];
    }

    generate_grid() {
        for (let i = 0; i < this.nx; i++) {
            for (let j = 0; j < this.ny; j++) {
                if (this.map[i][j] === 1) {
                    this.grids.push(new Floor(this, this.playground, this.ctx, i, j, this.cube_side_len, this.stroke_color));
                } else if (this.map[i][j] === 0) {
                    this.grids.push(new Wall(this, this.playground, this.ctx, i, j, this.cube_side_len, this.stroke_color));
                }
            }
        }
    }

    win() {

    }

    lose() {
    }

    restart() {
    }

    on_destroy() {
        while (this.grids && this.grids.length > 0) {
            this.grids[0].destroy();
        }
        this.grids = [];

        console.log("game map destroy DONE");
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.fillStyle = this.background_color;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    load_map() {
        this.map = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0],
            [0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }
}