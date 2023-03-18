<template>
    <div class="playground">
        <div ref="div" class="game-map-div">
            <canvas ref="canvas" tabindex="0"></canvas>
            <div class="operation" v-if="$store.state.restart">
                <button @click="restart('single mode')">开始游戏</button>
                <button @click="restart('multi mode')">联机对战</button>
                <button @click="show_ranklist()">排行榜</button>
                <button @click="logout_on_remote_jwt()">登出</button>
            </div>
            <RankList v-if="$store.state.ranklist" />
            <ChatField v-if="$store.state.chatting" ref="chat_field_ref" />
        </div>
    </div>
</template>

<script>
import { getCurrentInstance, ref, onMounted } from "vue";
import { PlayGround } from "@/assets/scripts/game_view/PlayGround";
// import { Settings } from "@/assets/scripts/login_view/Settings";
import { useStore } from "vuex";
import router from "@/router";
import { extractTimeFormat, useSizeProp } from "element-plus";
import { init } from "@/assets/scripts/game_view/init";
import RankList from "@/components/RankList"; // 不能加大括号
import ChatField from "@/components/ChatField";
import $ from "jquery";
import Cookies from "js-cookie";

export default {
    name: "PlayGround",
    components: {
        RankList,
        ChatField,
    },
    setup: () => {
        let div = ref(null);
        let canvas = ref(null);
        let chat_field_ref = ref(null);
        let playground = {
            message: "let playground",
        };
        // let settings = null;
        const store = useStore();

        // 检查登录状态，成功登陆后初始化store
        init(store);

        // 当组件被成功挂载之后执行
        onMounted(() => {
            console.log(canvas);

            // settings = new Settings(store);
            playground = new PlayGround(
                canvas,
                canvas.value.getContext("2d"),
                div.value,
                store,
                chat_field_ref.value.chat_field_input
            );
        });

        const restart = (mode_name) => {
            store.commit("updateModeName", mode_name);
            playground.restart(mode_name);
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
            div,
            canvas,
            restart,
            show_ranklist,
            chat_field_ref,
            logout_on_remote,
            logout_on_remote_jwt,
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

/* canvas居中，不过上面已经居中了，所以这里不需要 */
/* .game-map-div > canvas {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50, -50%);
} */

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