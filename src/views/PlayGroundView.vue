<template>
    <div class="playground">
        <div ref="div" class="game-map-div">
            <canvas ref="canvas" tabindex="0"></canvas>
            <div class="operation" v-if="$store.state.restart">
                <button @click="restart()">开始游戏</button>
                <button @click="show_ranklist()">排行榜</button>
                <button @click="logout_on_remote_jwt()">登出</button>
                <button @click="getinfo_web()">仅获取登录信息</button>
            </div>
            <RankList v-if="$store.state.ranklist" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { PlayGround } from "@/assets/scripts/game_view/PlayGround";
// import { Settings } from "@/assets/scripts/login_view/Settings";
import { useStore } from "vuex";
import router from "@/router";
import { extractTimeFormat, useSizeProp } from "element-plus";
import { init } from "@/assets/scripts/game_view/init";
import RankList from "@/components/RankList"; // 不能加大括号
import $ from "jquery";
import Cookies from "js-cookie";

export default {
    name: "PlayGround",
    components: {
        RankList,
    },
    setup: () => {
        let div = ref(null);
        let canvas = ref(null);
        let playground = null;
        // let settings = null;
        const store = useStore();

        init(store);

        // 当组件被成功挂载之后执行
        onMounted(() => {
            getinfo_web();
            // settings = new Settings(store);
            playground = new PlayGround(
                canvas,
                canvas.value.getContext("2d"),
                div.value,
                store
            );
        });

        const restart = () => {
            playground.restart();
        };

        const show_ranklist = () => {
            store.commit("updateRanklist", true);
        };

        // 使用jwt验证的登出（直接清空access和refresh即可）
        const logout_on_remote_jwt = () => {
            if (store.state.platform === "ACAPP") {
                // store.state.AcWingOS.api.window.close();
            } else {
                // 清除access和refresh，并跳转到登陆界面
                Cookies.remove("access");
                Cookies.remove("refresh");
                router.push("/login");
            }
        };

        // 早期的登出，需要调用服务器对应的接口
        const logout_on_remote = () => {
            if (store.state.platform === "ACAPP") {
                return false;
            }

            $.ajax({
                url: "https://app4689.acapp.acwing.com.cn:4436/settings/logout/",
                type: "GET",
                success: function (resp) {
                    if (resp.result === "success") {
                        console.log("成功登出账号");
                        // 登出成功就刷新页面
                        // location.reload();
                    }
                },
            });
        };

        // 用jwt的token从服务器上获取username和photo信息
        const getinfo_web = () => {
            // 如果Cookies里面没有access，就说明还未登录或登陆状态过期，使用router跳转到登陆界面
            if (!Cookies.get("access")) {
                router.push("/login");
                return false;
            }
            $.ajax({
                url: "https://app4689.acapp.acwing.com.cn:4436/settings/getinfo_jwt/",
                type: "get",
                data: {
                    platform: store.state.platform,
                },
                headers: {
                    Authorization: "Bearer " + Cookies.get("access"),
                },
                success: function (resp) {
                    console.log("getinfo_web:", resp);
                    if (resp.result === "success") {
                        store.commit("udpateUsername", resp.username);
                        store.commit("updatePhoto", resp.photo);
                        // 跳转到游戏界面
                        // outer.hide();
                        // outer.root.menu.show();
                    } else {
                        console.log("jwt还未登录");
                    }
                },
                error: () => {
                    console.log("jwt登录报错");
                },
            });
        };

        return {
            div,
            canvas,
            restart,
            show_ranklist,
            logout_on_remote,
            logout_on_remote_jwt,
            getinfo_web,
        };
    },
};
</script>


<style scoped>
.playground {
    display: flex;
    width: 100vw;
    height: 100vh;
}

.game-map-div {
    /* height: calc(100% - 8vh); */
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

div.operation {
    position: absolute;
}

.operation > button {
    background-color: #0d6efd;
    border: solid 0;
    border-radius: 5px;
    font-size: 3vh;
    color: white;
    padding: 3vh;
    cursor: pointer;
    margin: 0 0.5vh;
}

.operation > button {
    background-color: #0d6efd;
    border: solid 0;
    border-radius: 5px;
    font-size: 3vh;
    color: white;
    padding: 3vh;
    cursor: pointer;
    margin: 0 0.5vh;
}
</style>