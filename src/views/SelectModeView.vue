<template>
    <div class="select_mode">
        <img src="" alt="" />
        <button @click="start('single mode')">单人模式</button>
        <button @click="show_ranklist('single mode')">人机排行榜</button>
        <button @click="start('multi mode')">联机对战</button>
        <button @click="show_ranklist('multi mode')">联机排行榜</button>
        <button @click="logout_on_remote_jwt()">登出</button>
        <RankList
            v-if="$store.state.single_mode_list"
            v-bind:select_type="'single mode score'"
        />
        <RankList
            v-if="$store.state.ranklist"
            v-bind:select_type="'rank score'"
        />
    </div>
</template>

<script>
import { useStore } from "vuex";
import { init } from "@/assets/scripts/game_view/init";
import router from "@/router";
import Cookies from "js-cookie";
import { onMounted } from "vue";
import RankList from "@/components/RankList"; // 不能加大括号

export default {
    namespaced: true,
    name: "SelectMode",
    components: {
        RankList,
    },
    setup: () => {
        const store = useStore();
        // 检查登录状态，成功登陆后初始化store
        init(store);

        onMounted(() => {
            console.log("select mode Mounted");
        });

        const start = (game_mode) => {
            store.commit("updateGameMode", game_mode);
            router.push("/select_hero");
        };

        const show_ranklist = (mode_name) => {
            if (mode_name === "single mode") {
                store.commit("updateSingleModeList", true);
            } else if (mode_name === "multi mode") {
                store.commit("updateRanklist", true);
            }
        };

        // 使用jwt验证的登出（直接清空access和refresh即可）
        const logout_on_remote_jwt = () => {
            if (store.state.platform === "ACAPP") {
                // store.state.AcWingOS.api.window.close();
            } else {
                // 清除access和refresh，并跳转到登陆界面
                Cookies.remove("access");
                Cookies.remove("refresh");
                if (window.refresh_id != -1) {
                    clearInterval(window.refresh_id);
                }
                router.push("/login");
            }
        };

        // 早期的登出，需要调用服务器对应的接口
        const logout_on_remote = () => {
            if (
                store.state.platform === "ACAPP" &&
                store.state.AcWingOS !== "AcWingOS"
            ) {
                // 调用acwing的窗口关闭函数
                store.state.AcWingOS.api.window.close();
            } else {
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
            }
        };

        return {
            start,
            show_ranklist,
            logout_on_remote_jwt,
        };
    },
    methods: {},
};
</script>

<style scoped>
div.select_mode {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;

    /* 溢出隐藏 */
    overflow-x: hidden;
    /* 渐变方向从左到右 */
    background: linear-gradient(
        to right,
        rgb(247, 209, 215),
        rgb(191, 227, 241)
    );
}
/* 
.select_mode > button {
    background-color: #0d6efd;
    border: solid 0;
    border-radius: 5px;
    font-size: 3vh;
    color: white;
    padding: 3vh;
    cursor: pointer;
    margin: 0 0.5vh;
} */

.select_mode > button {
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