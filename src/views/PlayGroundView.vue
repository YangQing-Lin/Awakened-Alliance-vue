<template>
    <div class="playground">
        <div ref="div" class="game-map-div">
            <canvas ref="canvas" tabindex="0"></canvas>
            <ChatField ref="chat_field_ref" />
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
import ChatField from "@/components/ChatField";
import $ from "jquery";

export default {
    namespaced: true,
    name: "PlayGround",
    components: {
        ChatField,
    },
    setup: () => {
        let div = ref(null);
        let canvas = ref(null);
        let chat_field_ref = ref(null);
        let playground = {
            message: "let playground",
        };

        const store = useStore();
        // 检查登录状态，成功登陆后初始化store
        // init(store);

        // 当组件被成功挂载之后执行
        onMounted(() => {
            console.log(store.state.game_mode);
            if (store.state.game_mode === "no mode") {
                router.push("/select_mode");
                return;
            }
            playground = new PlayGround(
                canvas,
                canvas.value.getContext("2d"),
                div.value,
                store,
                chat_field_ref.value
            );

            playground.restart(store.state.game_mode);
        });

        return {
            div,
            canvas,
            chat_field_ref,
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