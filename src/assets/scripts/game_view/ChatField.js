// 聊天区
import $ from "jquery";

export class ChatField {
    constructor(playground, chat_field_ref) {
        this.playground = playground;
        this.store = this.playground.store;
        this.chat_field_ref = chat_field_ref;

        this.func_id = null;

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.chat_field_ref.chat_field_input_ref.addEventListener('keydown', e => {
            console.log("in {chat}", e.key);
            if (e.key === 'Enter') {
                console.log(this.store.state.username, this.chat_field_ref.chat_field_input_ref.value);
                let username = this.store.state.username;
                let text = this.chat_field_ref.chat_field_input_ref.value;
                if (text !== "") {
                    this.chat_field_ref.chat_field_input_ref.value = "";
                    this.add_message(username, text);
                }
                this.hide_input();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                this.hide_input();
                e.preventDefault();
            }
        });
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        let message = `[${username}] ${text}`;
        this.chat_field_ref.chat_field_history_ref.append(this.render_message(message)[0]);
        // 实现消息的自动滚动
        this.chat_field_ref.chat_field_history_ref.scrollTop = this.chat_field_ref.chat_field_history_ref.scrollHeight;
    }

    show_history() {
        this.playground.store.commit('updateShowHistory', true);
    }

    show_input() {
        // 两次打开输入框的间隔很短，上次的历史记录可能还没有关，所以要把上次的监听函数关掉，让历史记录常亮
        if (this.func_id) {
            clearTimeout(this.func_id);
        }

        this.show_history();

        this.playground.store.commit('updateChatting', true);
        // 需要再按一次回车才能打字
        this.chat_field_ref.chat_field_input_ref.focus();
    }

    hide_input() {
        this.playground.store.commit('updateChatting', false);
        this.playground.ctx.canvas.focus();

        let outer = this;
        // 关闭输入框之后三秒钟自动关闭历史记录
        // 存储监听函数的id，之后可以根据id删除监听函数
        this.func_id = setTimeout(function () {
            outer.playground.store.commit('updateShowHistory', false);
            outer.func_id = null;  // 关闭历史记录的时候顺便把监听函数id也清空了
        }, 3000);
    }
}