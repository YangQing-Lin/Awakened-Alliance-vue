import { tagEmits } from 'element-plus';
import { createStore } from 'vuex'

// game_state: waiting -> fighting -> win/lose
export default createStore({
    state: {
        score: 0,
        record: 0,
        AcWingOS: "AcWingOS",
        ranklist: false,
        username: "",
        photo: "",
        platform: "WEB",
        game_mode: "no mode",
        game_state: "waiting",
        chatting: false,
        show_history: false,
        // playground_focusing: true,
    },
    getters: {
    },
    mutations: {
        updateScore: (state, score) => {
            state.score = score;
        },
        updateRecord: (state, score) => {
            if (state.record < score) {
                state.record = score;
            }
        },
        updateRanklist: (state, ranklist) => {
            state.ranklist = ranklist;
        },
        udpateUsername: (state, username) => {
            state.username = username;
        },
        updatePhoto: (state, photo) => {
            state.photo = photo;
        },
        updatePlatform: (state, platform) => {
            state.platform = platform;
        },
        updateGameMode: (state, game_mode) => {
            state.game_mode = game_mode;
        },
        updateGameState: (state, game_state) => {
            state.game_state = game_state;
        },
        updateChatting: (state, chatting) => {
            state.chatting = chatting;
        },
        updateShowHistory: (state, show_history) => {
            state.show_history = show_history;
        },
    },
    actions: {
    },
    modules: {
    }
})
