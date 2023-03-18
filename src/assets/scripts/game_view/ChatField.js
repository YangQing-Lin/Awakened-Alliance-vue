// 聊天区

export class ChatField {
    constructor(playground, $input) {
        this.playground = playground;
        this.store = this.playground.store;
        this.$input = $input;

        this.start();
    }

    start() {
        // this.add_listening_events();
    }

    show_input() {
        console.log("show input");
        this.store.commit('updateChatting', true);
    }

    hide_input() {
        console.log("hide input");
        this.store.commit('updateChatting', false);
    }
}