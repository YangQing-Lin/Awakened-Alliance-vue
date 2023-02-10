import $ from 'jquery';

export class Settings {
    constructor(store) {
        this.store = store;

        this.store.commit('updatePlatform', "WEB");
        if (this.store.state.AcWingOS !== "AcWingOS") {
            this.store.commit('udatePlatform', "ACAPP");
        }
        console.log("settings store AcWingOS:", this.store.state.AcWingOS);

        this.start();
    }

    start() {
        this.getinfo();
    }

    // 打开注册界面
    register() {

    }

    // 打开登录界面
    login() {

    }

    getinfo() {
        let outer = this;

        $.ajax({
            url: "https://app4689.acapp.acwing.com.cn:4436/settings/getinfo/",
            type: "GET",
            data: {
                platform: outer.store.state.platform,
            },
            success: function (resp) {
                console.log("Settings resp:", resp.result);
                if (resp.result === "success") {
                    console.log("已经登陆");
                    // outer.hide();
                    // outer.root.menu.show();
                    outer.store.commit('udpateUsername', resp.username);
                    outer.store.commit('updatePhoto', resp.photo);
                } else {
                    console.log("还未登录");
                    outer.login();
                }
            }
        });
    }
}