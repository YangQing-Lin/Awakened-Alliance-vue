import { AcGameObject } from "./AcGameObject";
import { Grid } from "./map_element/Grid";
import { Wall } from "./map_element/Wall";

export class GameMap extends AcGameObject {
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

        this.console_flag = true;
    }

    start() {
        // this.canvas.focus();

        this.generate_grid();
        // this.generate_wall();
        this.generate_grass();
    }

    resize() {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
    }

    get_random_color() {
        let colors = ['#00FFFF', '#00FF7F', '#8A2BE2', '#CD2990', '#7FFF00', '#FFDAB9', '#FF6437', '#CD853F'];
        return colors[Math.floor(Math.random() * 6)];
    }

    generate_grid() {
        this.grids = [];
        for (let i = 0; i < this.ny; i++) {
            for (let j = 0; j < this.nx; j++) {
                this.grids.push(new Grid(this.playground, this.ctx, j, i, this.cube_side_len, "rgb(222, 237, 225)"));
            }
        }
    }

    generate_wall() {
        let wall_pic = "https://s3.bmp.ovh/imgs/2021/11/837412e46f4f61a6.jpg";
        this.walls = [];
        for (let i = 0; i < this.ny; i++) {
            for (let j = 0; j < this.nx; j++) {
                if (Math.random() < 20 / (this.nx * this.ny)) {
                    this.walls.push(new Wall(this.playground, this.ctx, j, i, this.cube_side_len, wall_pic));
                }
            }
        }
    }

    generate_grass() {
        this.grass = [];
        let grass_x = [3, 4, 7, 8, 9, 10, 11, 12, 15, 16];
        let grass_y = [3, 4, 7, 8, 9, 10, 11, 12, 15, 16];
        for (let i = 0; i < grass_y.length; i++) {
            for (let j = 0; j < grass_x.length; j++) {
                if ((grass_x[j] === 9 || grass_x[j] === 10) && (grass_y[i] === 9 || grass_y[i] === 10))
                    continue;
                if ((grass_x[j] === 9 || grass_x[j] === 10) && (grass_y[i] === 3 || grass_y[i] === 4 || grass_y[i] === 15 || grass_y[i] === 16))
                    continue;
                if ((grass_y[i] === 9 || grass_y[i] === 10) && (grass_x[j] === 3 || grass_x[j] === 4 || grass_x[j] === 15 || grass_x[j] === 16))
                    continue;
                this.grids[grass_y[i] * this.nx + grass_x[j]].has_grass = true;
            }
        }
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
        this.ctx.fillStyle = "rgb(136, 188, 194)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}