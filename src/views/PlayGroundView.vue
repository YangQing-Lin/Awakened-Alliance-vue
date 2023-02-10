<template>
    <div class="playground">
        <div ref="div" class="game-map-div">
            <canvas ref="canvas" tabindex="0"></canvas>
            <div class="operation" v-if="$store.state.restart">
                <button @click="restart()">开始游戏</button>
                <button @click="show_ranklist()">排行榜</button>
                <button @click="logout_on_remote()">登出</button>
            </div>
            <RankList v-if="$store.state.ranklist" />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { PlayGround } from "@/assets/scripts/game_view/PlayGround";
import { Settings } from "@/assets/scripts/login_view/Settings";
import { useStore } from "vuex";
import { useSizeProp } from "element-plus";
import { init } from "@/assets/scripts/game_view/init";
import RankList from "@/components/RankList"; // 不能加大括号
import $ from "jquery";

export default {
    name: "PlayGround",
    components: {
        RankList,
    },
    setup: () => {
        let div = ref(null);
        let canvas = ref(null);
        let playground = null;
        let settings = null;
        const store = useStore();

        init(store);

        // 当组件被成功挂载之后执行
        onMounted(() => {
            settings = new Settings(store);
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

        return {
            div,
            canvas,
            restart,
            show_ranklist,
            logout_on_remote,
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