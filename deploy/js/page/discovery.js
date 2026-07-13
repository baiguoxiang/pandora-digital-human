// 获取公共角色数据
let discovery_cardsData = [];

async function fetchPublicRoles() {
    try {
        // 显示加载状态
        document.getElementById('discovery_cardsContainer').innerHTML = `
            <div class="discovery_loading">
                <i class="fas fa-spinner fa-spin"></i> 加载角色数据中...
            </div>
        `;
        // 获取当前已加载的avatar_id列表
        const avatar_id_list = discovery_cardsData.map(card => card.avatar_id);
        
        const response = await fetch('api/auth/fetch_public_roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                avatar_id_list: avatar_id_list
            }) 
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 0) {
            throw new Error(data.errorMessage || '获取角色数据失败');
        }
        // 转换数据格式以匹配前端需求
        discovery_cardsData = data.public_roles_list.map(role => ({
            ...role,       // 复制 role 对象的所有原始属性
            isLiked: false // 添加或覆盖 isLiked 属性
        }));

        localStorage.setItem('public_roles_list', JSON.stringify(discovery_cardsData));
        
        // 渲染卡片
        discovery_renderCards();
        discovery_addLikeEventListeners();
        
    } catch (error) {
        console.error('获取角色数据失败:', error);
        document.getElementById('discovery_cardsContainer').innerHTML = `
            <div class="discovery_error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>加载失败: ${error.message}</p>
                <button onclick="fetchPublicRoles()">重试</button>
            </div>
        `;
    }
}

function click_card(avatar_id) {
    localStorage.setItem('selectedRoleID', avatar_id);
    // 以public模式进入新版本
    window.location.href = 'character.html?mode=public&v=1.1';
}

// 点赞功能示例
function likeCard(event, id) {
    event.stopPropagation();
    const btn = event.currentTarget;
    btn.classList.toggle('discovery_liked');
    // 这里添加实际的 AJAX 点赞请求
    console.log("Liked card:", id);
}

// 生成卡片（安全改进版）
function discovery_generateCard(card) {
    // 转义 HTML 特殊字符
    const escapeHTML = str => str.replace(/[&<>"']/g, 
        ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]
    );

    return `
    <div class="discovery_card" onclick="click_card('${escapeHTML(String(card.avatar_id))}')">
        <div class="discovery_media-container">
            <img src="${escapeHTML(card.avatar_url)}" 
                 alt="${escapeHTML(card.description.substring(0, 20))}"
                 loading="lazy"
                 onerror="this.src='default-avatar.jpg'">
            <div class="discovery_tag">${escapeHTML(card.status)}</div>
        </div>
        <div class="discovery_content-info">
            <p class="discovery_description">${escapeHTML(card.description)}</p>
            <div class="discovery_user-info">
                <div class="discovery_user-name">${escapeHTML(card.avatar_name)}</div>
                <div class="discovery_action-bar">
                    <button class="discovery_like-btn ${card.isLiked ? 'discovery_liked' : ''}" 
                            onclick="likeCard(event, '${card.avatar_id}')">
                        <span class="material-icons">favorite</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}
// 渲染卡片
function discovery_renderCards() {
    const container = document.getElementById('discovery_cardsContainer');
    
    if (discovery_cardsData.length === 0) {
        container.innerHTML = `
            <div class="discovery_empty">
                <i class="fas fa-user-slash"></i>
                <p>暂无公开角色</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    discovery_cardsData.forEach(card => {
        container.innerHTML += discovery_generateCard(card);
    });
}

// 加载更多卡片
async function discovery_loadMoreCards() {
    const btn = document.getElementById('discovery_loadMoreBtn');
    if (!btn) return;
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 加载中...';
    btn.disabled = true;
    
    try {
        const avatar_id_list = discovery_cardsData.map(card => card.avatar_id);
        const response = await fetch('api/auth/fetch_public_roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                avatar_id_list: avatar_id_list
            })
        });
        
        const data = await response.json();
        
        if (data.code === 0) {
            const newCards = data.public_roles_list.map(role => ({
                avatar_id: role.avatar_id,
                unionid: role.unionid,
                description: role.description,
                status: role.status,
                avatar_name: role.avatar_name,
                avatar_url: role.avatar_url,
                cosyvoice_id: role.cosyvoice_id,
                system_prompt: role.system_prompt,
                video_url: role.video_url,
                video_asset_url: role.video_asset_url,
                isLiked: false,
                secret: role.secret,
                secret_expire_time: role.secret_expire_time,
                bg_id: role.bg_id
            }));
            
            discovery_cardsData.push(...newCards);
            localStorage.setItem('public_roles_list', JSON.stringify(discovery_cardsData));
            discovery_renderCards();
            discovery_addLikeEventListeners();
        }
    } catch (error) {
        console.error('加载更多失败:', error);
        XSAlert(error.message, '加载更多数据失败: ');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// 添加点赞事件监听
function discovery_addLikeEventListeners() {
    document.querySelectorAll('.discovery_like-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const cardId = this.getAttribute('data-id');
            const card = discovery_cardsData.find(c => c.avatar_id === cardId);
            
            if (card) {
                card.isLiked = !card.isLiked;
                this.classList.toggle('discovery_liked', card.isLiked);
                // try {
                //     // 发送点赞/取消点赞请求
                //     const response = await fetch('api/auth/like_role', {
                //         method: 'POST',
                //         headers: {
                //             'Content-Type': 'application/json'
                //         },
                //         body: JSON.stringify({
                //             avatar_id: cardId,
                //             action: card.isLiked ? 'unlike' : 'like'
                //         })
                //     });
                    
                //     const result = await response.json();
                    
                //     if (result.code === 0) {
                //         card.isLiked = !card.isLiked;
                //         this.classList.toggle('discovery_liked', card.isLiked);
                //     } else {
                //         throw new Error(result.message || '操作失败');
                //     }
                // } catch (error) {
                //     console.error('点赞操作失败:', error);
                //     alert('操作失败: ' + error.message);
                // }
            }
        });
    });
}

let is_inited = false;

// 初始化
function discovery_init()
{
    if (is_inited) {
        return;
    }
    is_inited = true;
    fetchPublicRoles();
    
    // 加载更多按钮事件
    const loadMoreBtn = document.getElementById('discovery_loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', discovery_loadMoreCards);
    }
};