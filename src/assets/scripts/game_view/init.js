import $ from 'jquery';
import router from "@/router";
import Cookies from "js-cookie";

export const init = (store) => {
    window.refresh_id = -1;
    // const vw = window.innerWidth;
    // const vh = window.innerHeight;
    // AcWingOS.api.window.resize(59.5 * vh / vw, 64.5);

    const confirm_login_status_web = () => {
        // 如果Cookies里面没有refresh，就说明还未登录或登陆状态过期，使用router跳转到登陆界面
        if (!Cookies.get("refresh")) {
            router.push("/login");
            return false;
        }

        // 设置每4.5分钟自动更新access
        // （这个函数调用多次会多次更新，刷新后才会失效，所以尽量只在进入页面后调用一次）
        set_auto_refresh_jwt_token();

        // 登录成功后获取账号信息
        getinfo_web();
    };

    const confirm_login_status_acapp = () => {
        if (!Cookies.get("refresh")) {
            router.push("/login");
            return false;
        }

        set_auto_refresh_jwt_token();

        getinfo_acapp();
    };

    // 每4.5分钟使用refresh获得新的access_token
    const set_auto_refresh_jwt_token = () => {
        // 先执行一次，然后设置4.5分钟的自动更新
        refresh_jwt_token();
        if (window.refresh_id != -1) {
            clearInterval(window.refresh_id);
            window.refresh_id = -1;
        }
        window.refresh_id = setInterval(refresh_jwt_token, 4.5 * 60 * 1000);
    };

    const refresh_jwt_token = () => {
        $.ajax({
            url: "https://app4689.acapp.acwing.com.cn:4436/api/token/refresh/",
            type: "post",
            data: {
                refresh: Cookies.get("refresh"),
            },
            success: (resp) => {
                console.log("access刷新成功:", resp.access);
                // 设置Cookie有效期为4.5分钟
                let expires_time = new Date(new Date() * 1 + 4.5 * 60 * 1000);
                Cookies.set("access", resp.access, {
                    expires: expires_time,
                });
            },
            error: () => {
                console.log("access刷新失败");
            }
        });
    }

    // 用jwt的token从服务器上获取username和photo信息
    const getinfo_web = () => {
        $.ajax({
            url: "https://app4689.acapp.acwing.com.cn:4436/settings/getinfo_jwt/",
            type: "get",
            data: {
                platform: store.state.platform,
            },
            headers: {
                Authorization: "Bearer " + Cookies.get("access"),
            },
            success: function (resp) {
                if (resp.result === "success") {
                    store.commit("udpateUsername", resp.username);
                    store.commit("updatePhoto", resp.photo);
                    // 跳转到游戏界面
                    // outer.hide();
                    // outer.root.menu.show();
                } else {
                    console.log("jwt还未登录");
                }
            },
            error: () => {
                console.log("jwt登录报错");
                router.push("/login");
            },
        });
    };

    const getinfo_acapp = () => {
        // AcWing第三方授权登录
        $.ajax({
            url: "https://app4689.acapp.acwing.com.cn:4436/apply_code/",
            type: "get",
            success: function (resp) {
                console.log("getinfo_acapp:", resp);
                if (resp.result === "success") {
                    AcWingOS.api.oauth2.authorize(resp.appid, resp.redirect_uri, resp.scope, resp.state, resp => {
                        if (resp.result === "success") {
                            // 设置Cookie有效期为4.5分钟
                            let expires_time = new Date(new Date() * 1 + 4.5 * 60 * 1000);
                            Cookies.set("access", resp.access, {
                                expires: expires_time,
                            });
                            // 设置Cookie有效期为14.5天
                            Cookies.set("refresh", resp.refresh, { expires: 14.5 });
                        }
                    });
                }
            }
        });
    };

    const AcWingOS = store.state.AcWingOS;
    if (AcWingOS === "AcWingOS") {
        confirm_login_status_web();
    } else {
        confirm_login_status_acapp();
    }
}