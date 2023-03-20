import { AcGameObject } from "./AcGameObject";
import { GameMap } from "./GameMap";
import { Player } from "./Player";
import { MultiPlayerSocket } from "./socket/multiplayer";
import { NoticeBoard } from "./NoticeBoard";
import $ from 'jquery';
import Cookies from "js-cookie";
import { ChatField } from "./ChatField";
import { ScoreBoard } from "./ScoreBoard";

export class PlayGround extends AcGameObject {
    constructor(canvas, ctx, div, store, chat_field_ref) {
        super();
        this.canvas = canvas;
        this.ctx = ctx;
        this.div = div;
        this.store = store;
        this.width = this.div.clientWidth;
        this.height = this.div.clientHeight;
        this.chat_field_ref = chat_field_ref;

        this.scale = this.height;
        this.players = [];
        this.fireballs = [];
        this.virtual_map_width = 3;  // 虚拟地图大小改成相对大小
        this.virtual_map_height = this.virtual_map_width; // 正方形地图，方便画格子
        // 画布中心在虚拟地图上的相对位置
        this.ctx_x = 0.5 * this.width / this.scale;
        this.ctx_y = 0.5 * this.height / this.scale;

        this.game_map = new GameMap(this, this.canvas);

    }

    start() {
        this.resize();
        let outer = this;
        let resize_uuid = this.create_uuid();
        $(window).on(`resize.${resize_uuid}`, function () {
            outer.resize();
            console.log("window.resize()");
        });

        if (this.store.state.AcWingOS !== "AcWingOS") {
            this.store.state.AcWingOS.api.window.on_close(function () {
                $(window).off(`resize.${resize_uuid}`);
                outer.hide();
            });
        }

        // let player = new Player(this, 0.5 * this.width / this.scale, 0.5 * this.height / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.3 / this.scale, "me");
        // this.players.push(player);
        // this.re_calculate_cx_cy(player.x, player.y);
        // this.focus_player = player;

        // for (let i = 0; i < 20; i++) {
        //     let rand_x = Math.random() * this.virtual_map_width;
        //     let rand_y = Math.random() * this.virtual_map_height;
        //     this.players.push(new Player(this, rand_x, rand_y, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.3 / this.scale, "robot"));
        // }

    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 20; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    resize() {
        this.ctx.canvas.width = this.div.clientWidth;
        this.ctx.canvas.height = this.div.clientHeight;
        this.width = this.div.clientWidth;
        this.height = this.div.clientHeight;
        this.scale = this.height;
    }

    // 根据各个元素在虚拟地图上的相对位置计算在画布上的相对位置
    // 返回值是相对大小，以屏幕高度为单位1，所以在使用的时候要乘上this.scale
    my_calculate_relative_position_x(x) {
        return x - this.ctx_x + 0.5 * this.width / this.scale;
    }
    my_calculate_relative_position_y(y) {
        return y - this.ctx_y + 0.5 * this.height / this.scale;
    }

    // 通过玩家鼠标的点击位置计算在虚拟地图中的对应位置
    my_calculate_tx(x) {
        return (x - 0.5 * this.width) / this.scale + this.ctx_x;
    }
    my_calculate_ty(y) {
        return (y - 0.5 * this.height) / this.scale + this.ctx_y;
    }


    // 根据各个元素在虚拟地图上的相对位置计算在画布上的相对位置
    re_calculate_cx_cy(x, y) {
        // 计算物体相对于屏幕中心的坐标
        this.cx = x - 0.5 * this.width / this.scale;
        this.cy = y - 0.5 * this.height / this.scale;

        let cube_side_len = this.game_map.cube_side_len;
        if (this.focus_player) {
            this.cx = Math.max(this.cx, -2 * cube_side_len);
            this.cx = Math.min(this.cx, this.virtual_map_width - (this.width / this.scale - 2 * cube_side_len));
            this.cy = Math.max(this.cy, -cube_side_len);
            this.cy = Math.min(this.cy, this.virtual_map_height - (this.height / this.scale - cube_side_len));
        }
    }

    append_player() {
        let rand_x = Math.random() * this.virtual_map_width;
        let rand_y = Math.random() * this.virtual_map_height;
        this.players.push(new Player(this, rand_x, rand_y, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.3 / this.scale, "robot"));

        const score = this.store.state.score + 1;
        this.store.commit('updateScore', score);
        this.store.commit('updateRecord', score);
        console.log("[score]:", this.store.state.score, "[record]:", this.store.state.record);
    }

    get_random_color() {
        let colors = ["red", "pink", "grey", "green", "lightblue", "lightgreen", "yellow", "orange", "gold"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 更新分数到服务器
    update_score() {
        $.ajax({
            url: "https://app4689.acapp.acwing.com.cn:4436/update_score/",
            type: "post",
            data: {
                score: this.store.state.score,
            },
            headers: {
                'Authorization': "Bearer " + Cookies.get("access"),
            },
        });
    }

    restart(game_mode) {
        let outer = this;
        this.store.commit('updateScore', 0);
        let player = new Player(this, 0.5 * this.width / this.scale, 0.5 * this.height / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.3 / this.scale, "me", this.store.state.username, this.store.state.photo);
        this.players.push(player);
        this.re_calculate_cx_cy(player.x, player.y);
        this.focus_player = player;

        this.ctx.canvas.focus();

        if (game_mode === "single mode") {
            for (let i = 0; i < 20; i++) {
                let rand_x = Math.random() * this.virtual_map_width;
                let rand_y = Math.random() * this.virtual_map_height;
                this.players.push(new Player(this, rand_x, rand_y, this.height * 0.05 / this.scale, this.get_random_color(), this.height * 0.3 / this.scale, "robot"));
            }
            this.store.commit('updateGameState', "fighting");  // 单人模式中，添加所有机器人之后要设置成“战斗模式”
            // this.store.commit('updateGameState', "win");  // 单人模式中，添加所有机器人之后要设置成“战斗模式”
        } else if (game_mode === "multi mode") {
            this.notice_board = new NoticeBoard(this);
            this.chat_field = new ChatField(this, this.chat_field_ref);
            this.mps = new MultiPlayerSocket(this);  // 创建连接
            this.mps.uuid = this.players[0].uuid;  // 将连接的uuid设置为玩家的uuid，方便之后分辨窗口归属

            // 当连接创建成功时发送消息
            this.mps.ws.onopen = function () {
                outer.mps.send_create_player(outer.store.state.username, outer.store.state.photo);
            };
        }
        this.score_board = new ScoreBoard(this);
    }

    win() {
        this.update_score();
    }

    lose() {
        this.update_score();
    }

    hide() {
        console.log("playground show hide");
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
            console.log(this.players.length);
        }
        console.log("1");
        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }
        console.log("2");

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }
        console.log("3");

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        console.log("playground show hide DONE")
    }

    show_menu() {
        console.log("playground show menu");
        this.hide();
    }

    update() {
        if (this.focus_player) {
            this.ctx_x = this.focus_player.x;
            this.ctx_y = this.focus_player.y;
        }

        this.render();
    }

    render() {
    }
}