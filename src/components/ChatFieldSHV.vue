
<template>
    <div class="chatfield">
        <div
            class="ac-game-chat-field-history"
            ref="chat_field_history_ref"
            v-show="$store.state.show_history"
        ></div>

        <input
            type="text"
            ref="chat_field_input_ref"
            class="ac-game-chat-field-input"
            v-show="$store.state.chatting"
        />
    </div>
</template>

<script>
import { onMounted, ref, Vue } from "vue";
// import animate from "animate.css"; // 渐变效果
import { ChatFieldSHV } from "@/assets/scripts/game_view/ChatFieldSHV";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { useStore } from "vuex";
import { placeholderSign } from "element-plus/es/components/table-v2/src/private";

export default {
    name: "ChatFieldSHV",
    components: {},
    props: {
        // playground: {
        //     type: Object,
        //     default: {
        //         message: "null",
        //     },
        // },
    },
    setup: (props) => {
        const store = useStore();
        let chat_field_input_ref = ref(null);
        let chat_field_history_ref = ref(null);

        onMounted(() => {});

        return {
            chat_field_input_ref,
            chat_field_history_ref,
        };
    },
    methods: {
        // chat_focus() {
        //     this.$refs.chat_field_input_ref.focus();
        // },
        // chat_flur() {
        //     this.$refs.chat_field_input_ref.flur();
        // },
    },
};
</script>

<style scoped>
.ac-game-chat-field-history {
    position: absolute;
    top: 66%;
    left: 20%;

    transform: translate(-50%, -50%);

    width: 20%;
    height: 32%;

    color: white;
    font-size: 2vh;

    padding: 5px;
    overflow: auto;
}

.ac-game-chat-field-history::-webkit-scrollbar {
    width: 0;
}

.ac-game-chat-field-input {
    position: absolute;
    top: 86%;
    left: 20%;
    transform: translate(-50%, -50%);

    width: 20%;
    height: 3vh;

    color: white;
    font-size: 2vh;

    background-color: rgba(222, 225, 230, 0.2);
}

.bootstrap-input {
    position: absolute;
    top: 86%;
    left: 20%;
    transform: translate(-50%, -50%);

    width: 20%;
    height: 3vh;

    color: white;
    font-size: 2vh;

    background-color: rgba(222, 225, 230, 0.2);
}
</style>