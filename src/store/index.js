import { tagEmits } from 'element-plus';
import { createStore } from 'vuex'

// game_state: waiting -> fighting -> win/lose
// game_mode: no mode / single mode / multi mode
// which_introduce: hero / general_skill / awakened_skill
export default createStore({
    state: {
        score: 0,
        record: 0,
        AcWingOS: "AcWingOS",
        ranklist: false,
        single_mode_list: false,
        username: "",
        photo: "",
        platform: "WEB",
        game_mode: "multi mode",
        game_state: "waiting",
        chatting: false,
        show_history: false,
        // playground_focusing: true,
        select_hero_name: "太二",
        select_hero_info: {},
        which_introduce: "hero",
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
        updateSingleModeList: (state, single_mode_list) => {
            state.single_mode_list = single_mode_list;
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

        updateSelectHeroName: (state, name) => {
            state.select_hero_name = name;
        },
        updateSelectHeroInfo: (state, info) => {
            state.select_hero_info = info;
        },
        updateWhichIntroduce: (state, which) => {
            state.which_introduce = which;
        },
    },
    actions: {
    },
    modules: {
    }
})
