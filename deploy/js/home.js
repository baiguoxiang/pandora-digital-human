let rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
let intervalId = null; // 全局变量存储计时器 ID

function refreshMembership() {
    const membership_level = parseInt(localStorage.getItem('membership_level')) || 0;
    const membership_expiry_time = localStorage.getItem('membership_expiry_time'); //格式类似'2025-03-23 00:00:00'
    console.log("refreshMembership", membership_expiry_time, membership_level)
    if (membership_level > 0 && membership_expiry_time) {
        // const expiryDate = new Date(membership_expiry_time);
        // 拆分日期和时间部分
        const [datePart, timePart] = membership_expiry_time.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const expiryDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // 检查是否过期
        if (expiryDate < new Date()) {
            document.getElementById("vipDuration").textContent = "普通用户";
        } else {
            console.log('expiryDate:', expiryDate, expiryDate.toLocaleDateString())
            const formattedDate = `${year}-${month}-${day}`;
            document.getElementById("vipDuration").textContent = `VIP会员 · ${formattedDate}`;
        }
    } else {
        document.getElementById("vipDuration").textContent = "普通用户";
    }
}

function createRoleCard(role) {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    // 添加失败状态类名
    if (role.status === 'failed') {
        card.classList.add('failed-card');
    }

    // 图片容器
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    // 图片元素
    const img = document.createElement('img');
    img.className = 'character-image';
    img.src = role.avatar_url;

    // 将图片添加到容器
    imgContainer.appendChild(img);

    // 处理失败状态
    if (role.status === 'failed') {
        // 创建错误覆盖层
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';

        errorOverlay.innerHTML = `
            <span class="material-icons error-icon">error_outline</span>
            <div class="error-message">${role.errorMessage || '上传失败'}</div>
        `;
        imgContainer.appendChild(errorOverlay);
    }

    // 如果状态为 pending，添加加载动画并禁用点击事件
    if (role.status === 'pending') {
        // 添加加载动画
        const loader = document.createElement('div');
        loader.className = 'loader'; // 使用 CSS 实现加载动画
        imgContainer.appendChild(loader);

        // 禁用点击事件
        card.style.pointerEvents = 'none';
    }

    // 角色名称
    const nameDiv = document.createElement('div');
    nameDiv.className = 'character-name';
    nameDiv.textContent = role.avatar_name;

    // 将元素添加到卡片
    card.appendChild(imgContainer);
    card.appendChild(nameDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = '删除角色';

    // 添加 Material Icon
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-icons';
    deleteIcon.textContent = 'delete';
    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isConfirmed = await XSConfirm(`确定要删除 ${role.avatar_name} 吗？`);
        if (isConfirmed) {
            try {
                const response = await fetch('/api/auth/remove_role', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        unionid: role.unionid,
                        avatar_id: role.avatar_id
                    })
                });

                if (!response.ok) throw new Error('请求失败');

                card.remove();
                rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
                rolesList = rolesList.filter(item => item.avatar_id !== role.avatar_id);
                localStorage.setItem('roles_list', JSON.stringify(rolesList));
                console.log(`已删除角色：${role.avatar_name}`);
                XSAlert('角色删除成功');
            } catch (error) {
                console.error('删除角色失败:', error);
                XSAlert('删除角色失败，请重试');
            }
        }
    });
    card.appendChild(deleteBtn);

    if (role.status !== 'pending') {
        card.addEventListener('click', async () => {
            localStorage.setItem('selectedRoleID', role.avatar_id);

            const response = await fetch('/api/auth/check_role_status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    unionid: role.unionid,
                    avatar_id: role.avatar_id  // 保持字段名不变
                })
            });
            const result_role = await response.json();
            rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
            const existingIndex = rolesList.findIndex(r => r.avatar_id === role.avatar_id);
            rolesList[existingIndex] = { ...rolesList[existingIndex], ...result_role };
            localStorage.setItem('roles_list', JSON.stringify(rolesList));

                        // Navigate to role detail page (supports both v1 and v2.0)
            let roleId = role.id || 1;
            if (role.avatar_id) {
                const roleMap = {"av1":1,"av2":2,"av3":3,"av4":4,"av5":5,"av6":6};
                roleId = roleMap[role.avatar_id] || 1;
            }
            window.location.href = 'create-role.html?id=' + roleId;
        });
    }

    return card;
}

function renderRoleCards() {
    const gridGallery = document.querySelector('.grid-gallery');
    gridGallery.innerHTML = ''; // 清空现有内容

    // 生成角色卡片
    rolesList.forEach(role => {
        gridGallery.appendChild(createRoleCard(role));
    });

    // 添加"新增形象"卡片
    const addCard = document.createElement('div');
    addCard.className = 'gallery-item add-card';
    addCard.innerHTML = `
        <span class="material-icons add-icon">add_circle</span>
        <div class="character-name">新增形象</div>
    `;
    addCard.addEventListener('click', () => {
        window.location.href = 'create-role.html?v=1.20'; // 示例跳转
    });
    gridGallery.appendChild(addCard);
}

async function refreshBalance() {
    try {
        // 获取token（假设存储在localStorage）
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            XSAlert('请先登录');
            return;
        }

        const response = await fetch('/api/auth/check_balance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('请求失败');
        
        const result = await response.json();

        localStorage.setItem('membership_level', result.membership_level);
        localStorage.setItem('membership_expiry_time', result.membership_expiry_time);
        localStorage.setItem('token_balance', result.token_balance);
        localStorage.setItem('avatar_balance', result.avatar_balance.toFixed(1));
        localStorage.setItem('voice_balance', result.voice_balance.toFixed(1));
        localStorage.setItem('video_balance', result.video_balance.toFixed(1));
        
        // 更新显示
        updateBalanceDisplay();
        XSAlert('能量更新成功');
    } catch (error) {
        console.error('刷新失败:', error);
        XSAlert('刷新失败，请检查网络');
    }
}

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// 创建防抖版本
const debouncedRefreshBalance = debounce(refreshBalance, 500);

function updateBalanceDisplay() {
    refreshMembership();

    let balance = localStorage.getItem('token_balance') || 0;
    const balanceElement = document.querySelector('.quota-value');
    const progressBar = document.querySelector('.progress');
    
    if (balanceElement) {
        balanceElement.textContent = `能量：${balance}/30000`;
    }
    
    if (progressBar) {
        let percent = (balance / 30000) * 100;
        progressBar.style.width = `${Math.min(percent, 100)}%`;
    }
    // 新增三个项目的更新
    document.getElementById('avatarBalance').textContent = localStorage.getItem('avatar_balance') || 5;
    document.getElementById('voiceBalance').textContent = localStorage.getItem('voice_balance') || 3;
    document.getElementById('videoBalance').textContent = localStorage.getItem('video_balance') || 3;
}

function showPage(pageId, event) {
    if (pageId == "discovery-page") {
        discovery_init();
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('page-active');
    });
    document.getElementById(pageId).classList.add('page-active');
}

function applyPayPage() {
    // 微信环境检测
    if (typeof WeixinJSBridge === 'undefined') {
        XSAlert('请在手机微信浏览器中打开支付页面');
        // document.getElementById('payButton').style.display = 'none';
    } else {
        window.location.href='pay/subscrib.html' 
    }
}

// 具体业务函数修改
function showAvatarTip() {
    const count = localStorage.getItem('avatar_balance') || 5;
    XSAlert(
        `上传20秒以内人像视频完成人物定制，您还有${count}次机会`,
        "人物定制提示"
    );
}

function showVoiceTip() {
    const count = localStorage.getItem('voice_balance') || 3;
    XSAlert(
        `录制10秒清晰语音完成声纹采集，您还有${count}次机会`,
        "语音定制提示",
    );
}

function showVideoTip() {
    const count = localStorage.getItem('video_balance') || 3;
    XSAlert(
        `上传高清图片生成5秒人物视频进行定制，您还有${count}次机会`,
        "视频生成提示（未开放）",
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const nickname = localStorage.getItem('nickname');
    const headimgurl = localStorage.getItem('headimgurl');
    // 更新头像
    const headimg = document.querySelector('.headimg');
    if (headimgurl) {
        headimg.style.backgroundImage = `url('${headimgurl}')`;
        headimg.style.backgroundSize = 'cover'; // 确保图片正确显示
    }

    // 更新昵称
    const nicknameElement = document.querySelector('.nickname');
    if (nicknameElement) {
        nicknameElement.textContent = nickname || '默认昵称';
    }

    // 初始化能量显示
    updateBalanceDisplay();

    // 初始化角色卡片
    renderRoleCards();

    document.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
            if(card.querySelector('.character-image')) {
                card.querySelector('.character-image').style.transform = 'scale(1.05)';
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'none';
            if(card.querySelector('.character-image')) {
                card.querySelector('.character-image').style.transform = 'none';
            }
        });
    });

    document.querySelectorAll('.setting-item').forEach(item => {
        item.addEventListener('click', () => {
            item.style.background = '#F8F9FA';
            setTimeout(() => item.style.background = '', 200);
        });
    });

    // 能量区域点击事件
    document.querySelector('.quota-value').addEventListener('click', () => {
        XSAlert(
            "十点能量可以同时完成十个字的语音输入和十个字的语音输出",
            "能量说明",
        );
    });
});

// 监听 localStorage 的变化
window.addEventListener('storage', (event) => {
    if (event.key === 'roles_list') {
        // 如果 roles_list 发生变化，立即调用 renderRoleCards
        console.log('roles_list 发生变化，重新渲染角色卡片');
        rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
        renderRoleCards();
    }
});

// 在页面卸载时清除计时器
window.addEventListener('pagehide', () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});

window.addEventListener('pageshow', () => {
    let rolesList_ = JSON.parse(localStorage.getItem('roles_list')) || [];

    // 清除旧的计时器
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // 遍历角色列表
    rolesList_.forEach(async (role) => {
        if (role.status === 'pending') {
            // 定义一个函数，用于检查角色状态
            const checkRoleStatus = async () => {
                try {
                    // 发送请求检查角色状态
                    const response = await fetch('/api/auth/check_role_status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            unionid: role.unionid,
                            avatar_id: role.avatar_id  // 保持字段名不变
                        })
                    });

                    // 解析响应
                    const result_role = await response.json();

                    // 如果角色状态为 "success"，停止计时器并更新角色状态
                    if (result_role.status === 'success' || result_role.status === 'failed') {
                        clearInterval(intervalId); // 停止计时器
                        intervalId = null; // 重置计时器 ID
                        // 更新role为result_role
                        Object.assign(role, result_role);
                        localStorage.setItem('roles_list', JSON.stringify(rolesList_)); // 更新localStorage
                        console.log(`角色 ${role.avatar_id} 状态已更新为 ${role.status}`);
                        rolesList = rolesList_;
                        renderRoleCards();
                    }
                } catch (error) {
                    console.error('请求失败:', error);
                }
            };

            // 开启一个计时器，每1分钟向服务器发送请求
            intervalId = setInterval(checkRoleStatus, 30000); // 每半分钟执行一次
        }
    });
});