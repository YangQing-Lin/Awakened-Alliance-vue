import { tagEmits } from 'element-plus';
import { createStore } from 'vuex'

export default createStore({
    state: {
        score: 0,
        record: 0,
        restart: true,
        AcWingOS: "AcWingOS",
        ranklist: false,
        username: "",
        photo: "",
        platform: "WEB",
        mode_name: "single mode",
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
        updateRestart: (state, restart) => {
            state.restart = restart;
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
        updateModeName: (state, mode_name) => {
            state.mode_name = mode_name;
        },
    },
    actions: {
    },
    modules: {
    }
})
