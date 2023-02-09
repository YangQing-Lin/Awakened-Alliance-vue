<template>
    <div class="playground">
        <div ref="div" class="game-map-div">
            <canvas ref="canvas" tabindex="0"></canvas>
            <div class="operation">
                <!-- <button @click="restart">开始游戏</button>
            <button @click="show_ranklist">排行榜</button> -->
            </div>
            <!-- <RankList v-if="$store.state.ranklist" /> -->
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { PlayGround } from "@/assets/scripts/game_view/PlayGround";
import { Settings } from "@/assets/scripts/login_view/Settings";
// import { useStore } from "vuex";
// import { init } from "@/assets/scripts/game_view/init";
// import RankList from "./RankList"; // 不能加大括号

export default {
    name: "PlayGround",
    components: {
        // RankList,
    },
    setup: () => {
        let div = ref(null);
        let canvas = ref(null);
        // const store = useStore();
        let playground = null;
        let settings = null;

        // init(store);

        // 当组件被成功挂载之后执行
        onMounted(() => {
            // settings = new Settings();
            playground = new PlayGround(
                canvas,
                canvas.value.getContext("2d"),
                div.value
                // store
            );
        });

        const restart = () => {
            playground.restart();
        };

        // const show_ranklist = () => {
        //     store.commit("updateRanklist", true);
        // };

        return {
            div,
            canvas,
            restart,
            // show_ranklist,
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
</style>