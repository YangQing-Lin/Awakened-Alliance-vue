

export class Settings {
    constructor() {
        this.platform = "WEB";
        // if (this.root.AcWingOS) this.platform = "ACAPP";

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
                platform: outer.platform,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    // outer.hide();
                    // outer.root.menu.show();
                    console.log("getinfo success");
                } else {
                    outer.login();
                }
            }
        });
    }
}