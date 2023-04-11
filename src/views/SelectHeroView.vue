<template>
    <div class="select_hero">
        <div class="heros">
            <div
                class="heros_hero"
                v-for="(value, index) in heros_info"
                :key="index"
                @click="chooseHero(value.name)"
            >
                <img v-bind:src="value.avatar" alt="" />
            </div>
        </div>
        <div class="heros_info">
            <div class="hero_image">
                <img :src="store.state.select_hero_info.default_right" alt="" />
                <div class="general_skill" ref="general_skill">
                    <img
                        :src="store.state.select_hero_info.general_skill.image"
                        alt=""
                    />
                </div>
                <div class="awakened_skill" ref="awakened_skill">
                    <img
                        :src="store.state.select_hero_info.awakened_skill.image"
                        alt=""
                    />
                </div>
            </div>
            <div class="hero_bio" v-if="store.state.which_introduce === 'hero'">
                英雄：{{ store.state.select_hero_info.name }} <br />
                定位：{{ store.state.select_hero_info.type }} <br />
                5级天赋：{{ store.state.select_hero_info.Level_5_talent }}
                <br />
                10级天赋：{{ store.state.select_hero_info.Level_10_talent }}
                <br />
                故事：{{ store.state.select_hero_info.introduce }}
            </div>
            <div
                class="hero_bio"
                v-else-if="store.state.which_introduce === 'general_skill'"
            >
                技能名称：{{ store.state.select_hero_info.general_skill.name }}
                <br />
                操作按键：{{
                    store.state.select_hero_info.general_skill.operation
                }}
                <br />
                效果描述：{{
                    store.state.select_hero_info.general_skill.introduce
                }}
            </div>
            <div
                class="hero_bio"
                v-else-if="store.state.which_introduce === 'awakened_skill'"
            >
                技能名称：{{ store.state.select_hero_info.awakened_skill.name }}
                <br />
                操作按键：{{
                    store.state.select_hero_info.awakened_skill.operation
                }}
                <br />
                技能效果描述：{{
                    store.state.select_hero_info.awakened_skill.introduce
                }}
            </div>
            <div class="chat"></div>
        </div>
        <div class="right_box">
            <div class="players">
                <div class="player me">
                    <div class="player_choose_hero">
                        <img
                            :src="store.state.select_hero_info.default_left"
                            alt=""
                        />
                    </div>
                    <div class="user_photo">
                        <img
                            src="https://project-static-file.oss-cn-hangzhou.aliyuncs.com/avatar/2.jpeg"
                            alt=""
                            class="photo"
                        />
                    </div>
                    <div class="user_name">admin</div>
                </div>

                <div
                    class="player"
                    v-if="store.state.game_mode === 'multi mode'"
                >
                    <div class="user_photo">
                        <img
                            src="https://project-static-file.oss-cn-hangzhou.aliyuncs.com/avatar/3.jpeg"
                            alt=""
                            class="photo"
                        />
                    </div>
                    <div class="user_name">yangqing</div>
                </div>
                <div
                    class="player"
                    v-if="store.state.game_mode === 'multi mode'"
                >
                    <div class="user_photo">
                        <img
                            src="https://project-static-file.oss-cn-hangzhou.aliyuncs.com/avatar/4.jpeg"
                            alt=""
                            class="photo"
                        />
                    </div>
                    <div class="user_name">123</div>
                </div>
                <div
                    class="player"
                    v-if="store.state.game_mode === 'multi mode'"
                >
                    <div class="user_photo">
                        <img
                            src="https://project-static-file.oss-cn-hangzhou.aliyuncs.com/avatar/5.jpeg"
                            alt=""
                            class="photo"
                        />
                    </div>
                    <div class="user_name">456</div>
                </div>
            </div>
            <div class="button_box">
                <button @click="startGame()">开始游戏</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from "vue";
import heros_info from "../../static/HeroInfo.json";
import { useStore } from "vuex";
import router from "@/router";

export default {
    namespaced: true,
    name: "SelectHero",
    setup: () => {
        const store = useStore();
        const general_skill = ref(null);
        const awakened_skill = ref(null);

        onMounted(() => {
            console.log(store.state.game_mode);
            if (store.state.game_mode === "no mode") {
                router.push("/select_mode");
                return;
            }

            general_skill.value.addEventListener("mouseenter", function () {
                store.commit("updateWhichIntroduce", "general_skill");
            });
            general_skill.value.addEventListener("mouseleave", function () {
                store.commit("updateWhichIntroduce", "hero");
                console.log("鼠标移出");
            });

            awakened_skill.value.addEventListener("mouseenter", function () {
                store.commit("updateWhichIntroduce", "awakened_skill");
                console.log("鼠标移入");
            });
            awakened_skill.value.addEventListener("mouseleave", function () {
                store.commit("updateWhichIntroduce", "hero");
                console.log("鼠标移出");
            });
        });

        const chooseHero = (hero_name) => {
            console.log(hero_name);
            for (let hero_info of heros_info) {
                if (hero_info.name === hero_name) {
                    store.commit("updateSelectHeroName", hero_name);
                    store.commit("updateSelectHeroInfo", hero_info);
                    break;
                }
            }
        };

        const startGame = () => {
            console.log(store.state.game_mode);
            router.push("/playground");
        };

        return {
            heros_info,
            store,
            general_skill,
            awakened_skill,
            chooseHero,
            startGame,
        };
    },
    created() {
        this.heros_info = heros_info;
        this.store.commit("updateSelectHeroName", "太二");
        for (let hero_info of this.heros_info) {
            if (hero_info.name === this.store.state.select_hero_name) {
                this.store.commit("updateSelectHeroInfo", hero_info);
                break;
            }
        }
    },
};
</script>

<style scoped>
.select_hero {
    width: 100vw;
    height: 100vh;
    display: flex;
    /* justify-content: center;
    align-items: center;
    position: absolute; */

    /* 溢出隐藏 */
    overflow-x: hidden;
    /* 渐变方向从左到右 */
    background: linear-gradient(
        to right,
        rgb(247, 209, 215),
        rgb(191, 227, 241)
    );
}

img {
    -webkit-user-drag: none;
}

.select_hero > div {
    margin-top: 2%;
    margin-left: 1%;
    height: 93%;
}

.heros {
    width: 20%;
    background-color: aqua;
}

.heros_hero {
    float: left;
    width: 16vh;
    height: 16vh;
    margin-left: 2%;
    margin-top: 1%;
    /* background-color: darkorchid; */
}

.heros_hero > img {
    width: 100%;
    height: 100%;
}

.heros_info {
    width: 51%;
    background-color: brown;
}

.heros_info > div {
    width: 98%;
    margin-top: 1%;
    margin-left: 1%;
}

.hero_image {
    display: flex;
    align-items: flex-end;
    height: 48%;
    background-color: aquamarine;
}

.hero_image > img {
    object-fit: fill;
    position: absolute;
}

.skills {
    display: flex;
    align-items: flex-end;
    width: 21%;
    height: 17%;
    margin-left: 76%;
    margin-bottom: 2%;
    background-color: black;
}

.general_skill {
    width: 6vh;
    height: 6vh;
    margin-left: 68vh;
    margin-bottom: 3vh;
    background-color: blueviolet;
    z-index: 99;
}

.awakened_skill {
    width: 6vh;
    height: 6vh;
    margin-left: 2vh;
    margin-bottom: 3vh;
    background-color: blueviolet;
    z-index: 99;
}

.hero_bio {
    height: 24%;
    background-color: bisque;
    overflow: auto;
    /* white-space: pre-line; */
}

.chat {
    height: 24%;
    background-color: darkgrey;
}

.right_box {
    width: 25%;
    height: 98%;
    background-color: coral;
}

.players {
    width: 100%;
    height: 80% !important;
    background-color: coral;
    display: flex;
    flex-direction: column;
}

.players > .player {
    width: 96%;
    margin-top: 2%;
    margin-left: 2%;
    background-color: chartreuse;
    display: flex;
    flex-direction: column;
    height: 24%;
}

.player_choose_hero {
    /* float: left; */
    width: 40vh;
    height: 18vh;
    position: absolute;
    /* background-color: aqua; */
}

.player_choose_hero > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user_photo {
    /* float: left; */
    width: 8vh;
    height: 8vh;
    margin-left: 5%;
    margin-top: 4%;
    background-color: aliceblue;
    z-index: 99;
}

.photo {
    width: 100%;
    height: 100%;
    background-size: cover;
}

.user_name {
    width: 40%;
    height: 13%;
    /* line-height: 13%; */
    vertical-align: bottom;
    display: table-cell;
    margin-left: 5%;
    margin-top: 5%;
    background-color: burlywood;
    z-index: 99;
}

.button_box {
    width: 100%;
    height: 19% !important;
    display: flex;
    /* background-color: green; */
    margin-top: 1%;
    justify-content: center;
    align-items: center;
}

button {
    background-color: #0d6efd;
    border: solid 0;
    border-radius: 5px;
    font-size: 3vh;
    color: white;
    padding: 3vh;
    cursor: pointer;
    width: 94%;
    height: 72%;
}
</style>