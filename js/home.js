let rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
let intervalId = null; // å¨å±åéå­å¨è®¡æ¶å¨ ID

function refreshMembership() {
    const membership_level = parseInt(localStorage.getItem('membership_level')) || 0;
    const membership_expiry_time = localStorage.getItem('membership_expiry_time'); //æ ¼å¼ç±»ä¼¼'2025-03-23 00:00:00'
    console.log("refreshMembership", membership_expiry_time, membership_level)
    if (membership_level > 0 && membership_expiry_time) {
        // const expiryDate = new Date(membership_expiry_time);
        // æåæ¥æåæ¶é´é¨å
        const [datePart, timePart] = membership_expiry_time.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const expiryDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // æ£æ¥æ¯å¦è¿æ
        if (expiryDate < new Date()) {
            document.getElementById("vipDuration").textContent = "æ®éç¨æ·";
        } else {
            console.log('expiryDate:', expiryDate, expiryDate.toLocaleDateString())
            const formattedDate = `${year}-${month}-${day}`;
            document.getElementById("vipDuration").textContent = `VIPä¼å Â· ${formattedDate}`;
        }
    } else {
        document.getElementById("vipDuration").textContent = "æ®éç¨æ·";
    }
}

function createRoleCard(role) {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    // æ·»å å¤±è´¥ç¶æç±»å
    if (role.status === 'failed') {
        card.classList.add('failed-card');
    }

    // å¾çå®¹å¨
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    // å¾çåç´ 
    const img = document.createElement('img');
    img.className = 'character-image';
    img.src = role.avatar_url;

    // å°å¾çæ·»å å°å®¹å¨
    imgContainer.appendChild(img);

    // å¤çå¤±è´¥ç¶æ
    if (role.status === 'failed') {
        // åå»ºéè¯¯è¦çå±
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';

        errorOverlay.innerHTML = `
            <span class="material-icons error-icon">error_outline</span>
            <div class="error-message">${role.errorMessage || 'ä¸ä¼ å¤±è´¥'}</div>
        `;
        imgContainer.appendChild(errorOverlay);
    }

    // å¦æç¶æä¸º pendingï¼æ·»å å è½½å¨ç»å¹¶ç¦ç¨ç¹å»äºä»¶
    if (role.status === 'pending') {
        // æ·»å å è½½å¨ç»
        const loader = document.createElement('div');
        loader.className = 'loader'; // ä½¿ç¨ CSS å®ç°å è½½å¨ç»
        imgContainer.appendChild(loader);

        // ç¦ç¨ç¹å»äºä»¶
        card.style.pointerEvents = 'none';
    }

    // è§è²åç§°
    const nameDiv = document.createElement('div');
    nameDiv.className = 'character-name';
    nameDiv.textContent = role.avatar_name;

    // å°åç´ æ·»å å°å¡ç
    card.appendChild(imgContainer);
    card.appendChild(nameDiv);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.title = 'å é¤è§è²';

    // æ·»å  Material Icon
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-icons';
    deleteIcon.textContent = 'delete';
    deleteBtn.appendChild(deleteIcon);

    deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isConfirmed = await XSConfirm(`ç¡®å®è¦å é¤ ${role.avatar_name} åï¼`);
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

                if (!response.ok) throw new Error('è¯·æ±å¤±è´¥');

                card.remove();
                rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
                rolesList = rolesList.filter(item => item.avatar_id !== role.avatar_id);
                localStorage.setItem('roles_list', JSON.stringify(rolesList));
                console.log(`å·²å é¤è§è²ï¼${role.avatar_name}`);
                XSAlert('è§è²å é¤æå');
            } catch (error) {
                console.error('å é¤è§è²å¤±è´¥:', error);
                XSAlert('å é¤è§è²å¤±è´¥ï¼è¯·éè¯');
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
                    avatar_id: role.avatar_id  // ä¿æå­æ®µåä¸å
                })
            });
            const result_role = await response.json();
            rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
            const existingIndex = rolesList.findIndex(r => r.avatar_id === role.avatar_id);
            rolesList[existingIndex] = { ...rolesList[existingIndex], ...result_role };
            localStorage.setItem('roles_list', JSON.stringify(rolesList));

            if (role.version === 1 || role.version === "1") {
                // ä»¥privateæ¨¡å¼è¿å¥æ°çæ¬
                let use_tag = localStorage.getItem('use_tag');
                if (use_tag == 4) {
                    window.location.href = 'character2.html?avatar_mode=private';
                }
                else {
                    window.location.href = 'character.html?avatar_mode=private';
                }
            } else {
                XSAlert('1.0çæ¬è§è²ç±äºé®é¢è¾å¤å·²ä¸åæ¯æï¼ä¸ºä½ å¸¦æ¥çä¸ä¾¿æ·±ææ±æ­ã');
            }
        });
    }

    return card;
}

function renderRoleCards() {
    const gridGallery = document.querySelector('.grid-gallery');
    gridGallery.innerHTML = ''; // æ¸ç©ºç°æåå®¹

    // çæè§è²å¡ç
    rolesList.forEach(role => {
        gridGallery.appendChild(createRoleCard(role));
    });

    // æ·»å "æ°å¢å½¢è±¡"å¡ç
    const addCard = document.createElement('div');
    addCard.className = 'gallery-item add-card';
    addCard.innerHTML = `
        <span class="material-icons add-icon">add_circle</span>
        <div class="character-name">æ°å¢å½¢è±¡</div>
    `;
    addCard.addEventListener('click', () => {
        window.location.href = 'create-role.html?v=1.20'; // ç¤ºä¾è·³è½¬
    });
    gridGallery.appendChild(addCard);
}

async function refreshBalance() {
    try {
        // è·åtokenï¼åè®¾å­å¨å¨localStorageï¼
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            XSAlert('è¯·åç»å½');
            return;
        }

        const response = await fetch('/api/auth/check_balance', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('è¯·æ±å¤±è´¥');
        
        const result = await response.json();

        localStorage.setItem('membership_level', result.membership_level);
        localStorage.setItem('membership_expiry_time', result.membership_expiry_time);
        localStorage.setItem('token_balance', result.token_balance);
        localStorage.setItem('avatar_balance', result.avatar_balance.toFixed(1));
        localStorage.setItem('voice_balance', result.voice_balance.toFixed(1));
        localStorage.setItem('video_balance', result.video_balance.toFixed(1));
        
        // æ´æ°æ¾ç¤º
        updateBalanceDisplay();
        XSAlert('è½éæ´æ°æå');
    } catch (error) {
        console.error('å·æ°å¤±è´¥:', error);
        XSAlert('å·æ°å¤±è´¥ï¼è¯·æ£æ¥ç½ç»');
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

// åå»ºé²æçæ¬
const debouncedRefreshBalance = debounce(refreshBalance, 500);

function updateBalanceDisplay() {
    refreshMembership();

    let balance = localStorage.getItem('token_balance') || 0;
    const balanceElement = document.querySelector('.quota-value');
    const progressBar = document.querySelector('.progress');
    
    if (balanceElement) {
        balanceElement.textContent = `è½éï¼${balance}/30000`;
    }
    
    if (progressBar) {
        let percent = (balance / 30000) * 100;
        progressBar.style.width = `${Math.min(percent, 100)}%`;
    }
    // æ°å¢ä¸ä¸ªé¡¹ç®çæ´æ°
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
    // å¾®ä¿¡ç¯å¢æ£æµ
    if (typeof WeixinJSBridge === 'undefined') {
        XSAlert('è¯·å¨ææºå¾®ä¿¡æµè§å¨ä¸­æå¼æ¯ä»é¡µé¢');
        // document.getElementById('payButton').style.display = 'none';
    } else {
        window.location.href='pay/subscrib.html' 
    }
}

// å·ä½ä¸å¡å½æ°ä¿®æ¹
function showAvatarTip() {
    const count = localStorage.getItem('avatar_balance') || 5;
    XSAlert(
        `ä¸ä¼ 20ç§ä»¥åäººåè§é¢å®æäººç©å®å¶ï¼æ¨è¿æ${count}æ¬¡æºä¼`,
        "äººç©å®å¶æç¤º"
    );
}

function showVoiceTip() {
    const count = localStorage.getItem('voice_balance') || 3;
    XSAlert(
        `å½å¶10ç§æ¸æ°è¯­é³å®æå£°çº¹ééï¼æ¨è¿æ${count}æ¬¡æºä¼`,
        "è¯­é³å®å¶æç¤º",
    );
}

function showVideoTip() {
    const count = localStorage.getItem('video_balance') || 3;
    XSAlert(
        `ä¸ä¼ é«æ¸å¾ççæ5ç§äººç©è§é¢è¿è¡å®å¶ï¼æ¨è¿æ${count}æ¬¡æºä¼`,
        "è§é¢çææç¤ºï¼æªå¼æ¾ï¼",
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const nickname = localStorage.getItem('nickname');
    const headimgurl = localStorage.getItem('headimgurl');
    // æ´æ°å¤´å
    const headimg = document.querySelector('.headimg');
    if (headimgurl) {
        headimg.style.backgroundImage = `url('${headimgurl}')`;
        headimg.style.backgroundSize = 'cover'; // ç¡®ä¿å¾çæ­£ç¡®æ¾ç¤º
    }

    // æ´æ°æµç§°
    const nicknameElement = document.querySelector('.nickname');
    if (nicknameElement) {
        nicknameElement.textContent = nickname || 'é»è®¤æµç§°';
    }

    // åå§åè½éæ¾ç¤º
    updateBalanceDisplay();

    // åå§åè§è²å¡ç
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

    // è½éåºåç¹å»äºä»¶
    document.querySelector('.quota-value').addEventListener('click', () => {
        XSAlert(
            "åç¹è½éå¯ä»¥åæ¶å®æåä¸ªå­çè¯­é³è¾å¥ååä¸ªå­çè¯­é³è¾åº",
            "è½éè¯´æ",
        );
    });
});

// çå¬ localStorage çåå
window.addEventListener('storage', (event) => {
    if (event.key === 'roles_list') {
        // å¦æ roles_list åçååï¼ç«å³è°ç¨ renderRoleCards
        console.log('roles_list åçååï¼éæ°æ¸²æè§è²å¡ç');
        rolesList = JSON.parse(localStorage.getItem('roles_list')) || [];
        renderRoleCards();
    }
});

// å¨é¡µé¢å¸è½½æ¶æ¸é¤è®¡æ¶å¨
window.addEventListener('pagehide', () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
});

window.addEventListener('pageshow', () => {
    let rolesList_ = JSON.parse(localStorage.getItem('roles_list')) || [];

    // æ¸é¤æ§çè®¡æ¶å¨
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // éåè§è²åè¡¨
    rolesList_.forEach(async (role) => {
        if (role.status === 'pending') {
            // å®ä¹ä¸ä¸ªå½æ°ï¼ç¨äºæ£æ¥è§è²ç¶æ
            const checkRoleStatus = async () => {
                try {
                    // åéè¯·æ±æ£æ¥è§è²ç¶æ
                    const response = await fetch('/api/auth/check_role_status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            unionid: role.unionid,
                            avatar_id: role.avatar_id  // ä¿æå­æ®µåä¸å
                        })
                    });

                    // è§£æååº
                    const result_role = await response.json();

                    // å¦æè§è²ç¶æä¸º "success"ï¼åæ­¢è®¡æ¶å¨å¹¶æ´æ°è§è²ç¶æ
                    if (result_role.status === 'success' || result_role.status === 'failed') {
                        clearInterval(intervalId); // åæ­¢è®¡æ¶å¨
                        intervalId = null; // éç½®è®¡æ¶å¨ ID
                        // æ´æ°roleä¸ºresult_role
                        Object.assign(role, result_role);
                        localStorage.setItem('roles_list', JSON.stringify(rolesList_)); // æ´æ°localStorage
                        console.log(`è§è² ${role.avatar_id} ç¶æå·²æ´æ°ä¸º ${role.status}`);
                        rolesList = rolesList_;
                        renderRoleCards();
                    }
                } catch (error) {
                    console.error('è¯·æ±å¤±è´¥:', error);
                }
            };

            // å¼å¯ä¸ä¸ªè®¡æ¶å¨ï¼æ¯1åéåæå¡å¨åéè¯·æ±
            intervalId = setInterval(checkRoleStatus, 30000); // æ¯ååéæ§è¡ä¸æ¬¡
        }
    });
});