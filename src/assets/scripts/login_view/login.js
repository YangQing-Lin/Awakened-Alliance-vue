import $ from "jquery";
import router from "@/router";
import Cookies from "js-cookie";

// 调用服务器接口，通过用户名和密码登录，获得的access和refresh存到cookie里
const login_on_remote_jwt = (loginForm, username, password) => {
    username = username || loginForm.username;
    password = password || loginForm.password;

    $.ajax({
        url: "https://app4689.acapp.acwing.com.cn:4436/api/token/",
        type: "post",
        data: {
            username: username,
            password: password,
        },
        success: (resp) => {
            // 设置Cookie有效期为4.5分钟
            let expires_time = new Date(new Date() * 1 + 4.5 * 60 * 1000);
            Cookies.set("access", resp.access, {
                expires: expires_time,
            });
            // 设置Cookie有效期为14.5天
            Cookies.set("refresh", resp.refresh, { expires: 14.5 });

            // 获取到获取到新的access和refresh之后直接跳转到模式选择界面
            // 在模式选择界面会自动使用access获取各个用户信息
            router.push("/select_mode");

            // 获取到新的access和refresh之后用它们获取username和photo
            // getinfo_web();
        },
        error: () => {
            console.log("用户名或密码错误");
        },
    });
};

// 在远程服务器上注册
const register_on_remote_jwt = (registerForm) => {
    let username = registerForm.username;
    let password = registerForm.password;
    let confirmPassword = registerForm.confirmPassword;

    $.ajax({
        url: "https://app4689.acapp.acwing.com.cn:4436/settings/register_jwt/",
        type: "post",
        data: {
            username: username,
            password: password,
            password_confirm: confirmPassword,
        },
        success: (resp) => {
            if (resp.result === "success") {
                login_on_remote_jwt("", username, password);
            } else {
                console.log("注册失败：", resp.result);
            }
        },
    });
};

export {
    login_on_remote_jwt,
    register_on_remote_jwt,
}