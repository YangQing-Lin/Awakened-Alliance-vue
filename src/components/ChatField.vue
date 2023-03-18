<template>
    <div class="chatfield">
        <div class="ac-game-field-history"></div>
        <input
            type="text"
            ref="chat_field_input"
            class="ac-game-chat-field-input"
            @keydown.esc="keydownEsc"
        />
    </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { ChatField } from "@/assets/scripts/game_view/ChatField";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { useStore } from "vuex";
import { placeholderSign } from "element-plus/es/components/table-v2/src/private";

export default {
    name: "ChatField",
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
        let chat_field_input = ref(null);

        onMounted(() => {
            chat_field_input.value.focus();
            store.commit("updateChatting", true);
        });

        const keydownEsc = () => {
            store.commit("updateChatting", false);
        };

        return {
            chat_field_input,
            keydownEsc,
        };
    },
    methods: {
        // chat_focus() {
        //     this.$refs.chat_field_input.focus();
        // },
        // chat_flur() {
        //     this.$refs.chat_field_input.flur();
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