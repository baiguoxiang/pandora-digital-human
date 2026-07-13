// 鍒ゆ柇寰俊娴忚鍣?function isWeixinBrowser() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
}
// 鍒ゆ柇鏄惁鍦ㄥ井淇″皬绋嬪簭鐜涓?function isWechatMiniProgram() {
    return navigator.userAgent.toLowerCase().indexOf('miniprogram') !== -1;
}

// 鍒濆鍖栬儗鏅?function initBackground() {
    if (isWechatMiniProgram()) 
    {
        const businessCheckElement = document.getElementById('businessCheck');
        if (businessCheckElement) {
            businessCheckElement.style.display = 'none';
        }

        // 瑙ｆ瀽 URL 涓殑 openid 鍙傛暟
        const urlParams = new URLSearchParams(window.location.search);
        const mp_openid = urlParams.get('mp_openid');
        // console.log('Received mp_openid:', mp_openid);
        localStorage.setItem('mp_openid', mp_openid);
        const unionid = urlParams.get('unionid');
        // console.log('Received mp_openid:', mp_openid);
        localStorage.setItem('unionid', unionid);
    }
    const urlParams = new URLSearchParams(window.location.search);

    let isDesktop = urlParams.has('Desktop') ? 1 : 0; // 妫€鏌ユ槸鍚﹀瓨鍦↙ive鍙傛暟
    console.log(urlParams, isDesktop);
    if (isDesktop)
    {
        const businessCheckElement = document.getElementById('businessCheck');
        if (businessCheckElement) {
            businessCheckElement.style.visibility = "hidden";
        }
    }
}

document.addEventListener('DOMContentLoaded', initBackground);

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

async function wechatLogin() {
    const isWechat = isWeixinBrowser();
    const isMobile = isMobileDevice();

    // if (isMobile && !isWechat) {
    //     alert('璇峰湪寰俊鍐呯殑娴忚鍣ㄦ墦寮€');
    //     return;
    // }

    if (isWechatMiniProgram()) 
    {
        window.location.href = "https://www.pandora.example.com/weCB.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isApp = urlParams.has('app') ? 1 : 0;
    let isLive = 0;
    if (urlParams.has('CS')) {
        isLive = 4;
    }
    console.log("isApp:", isApp, "isLive:", isLive);

    // 濡傛灉storage涓瓨鍦╦wt_token,鐩存帴璁块棶鏈嶅姟鍣ㄧ殑/api/auth/auto_login鎺ュ彛   
    const jwt_token = localStorage.getItem('jwt_token');
    if (jwt_token) {
        console.log('try auto_login');
        try {
            const response = await fetch('https://www.pandora.example.com/api/auth/auto_login', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt_token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('auto_login response:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('auto_login result:', result);
            
            if (result.success === true && result.userInfo) {
                console.log('auto_login success:', result);
                localStorage.setItem('unionid', result.userInfo.unionid);
                localStorage.setItem('openid', result.userInfo.openid);
                localStorage.setItem('nickname', result.userInfo.nickname);
                localStorage.setItem('headimgurl', result.userInfo.headimgurl);
                localStorage.setItem('voices_list', JSON.stringify(result.userInfo.voices_list));
                localStorage.setItem('roles_list', JSON.stringify(result.userInfo.roles_list));
                localStorage.setItem('bg_list', JSON.stringify(result.userInfo.bg_list));
                localStorage.setItem('membership_level', result.userInfo.membership_level);
                localStorage.setItem('membership_expiry_time', result.userInfo.membership_expiry_time);
                localStorage.setItem('token_balance', result.userInfo.token_balance);
                localStorage.setItem('avatar_balance', result.userInfo.avatar_balance.toFixed(1));
                localStorage.setItem('voice_balance', result.userInfo.voice_balance.toFixed(1));
                localStorage.setItem('video_balance', result.userInfo.video_balance.toFixed(1));
                localStorage.setItem('jwt_token', result.userInfo.jwt_token);
                localStorage.setItem('use_tag', isLive);
                localStorage.setItem('notify', 1);
                window.location.href = 'home.html?v=2.0';
                return;
            } else {
                console.error('Auto login failed (business logic):', result);
                localStorage.removeItem('jwt_token');
            }
        } catch (error) {
            console.error('auto Login failed:', error);
            localStorage.removeItem('jwt_token');
        }
    }

    if (isApp) {
        window.location.href = 'app_login.html';
        return;
    }

    const config = {
        appid: isWechat ? 'wx47de255f3518767f' : 'wx47de255f3518767f',
        scope: isWechat ? 'snsapi_userinfo' : 'snsapi_login',
        platform: isWechat ? 'wechat' : 'web'
    };

    const redirect_uri = encodeURIComponent(
        `https://www.pandora.example.com/weCB.html?platform=${config.platform}&Live=${isLive}&v=1.1`
    );

    const authUrl = isWechat 
        ? `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${config.appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${config.scope}&state=STATE#wechat_redirect`
        : `https://open.weixin.qq.com/connect/qrconnect?appid=${config.appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${config.scope}&state=STATE#wechat_redirect`;
    window.location.href = authUrl;
}

