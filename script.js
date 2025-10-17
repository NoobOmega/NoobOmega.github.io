// 页面导航
function navigateTo(page) {
    window.location.href = page;
}

// 编辑器控制
function showEditor(type) {
    if (!authSystem.checkAuth()) {
        alert('请先登录管理员账户');
        return;
    }
    
    const editor = document.getElementById(type + 'Editor');
    if (editor) {
        editor.style.display = 'block';
    }
}

function hideEditor(type) {
    const editor = document.getElementById(type + 'Editor');
    if (editor) {
        editor.style.display = 'none';
        // 清空编辑器内容
        const contentField = document.getElementById(type + 'Content');
        if (contentField) contentField.value = '';
        
        const titleField = document.getElementById(type + 'Title');
        if (titleField) titleField.value = '';
    }
}

// 内容保存功能
function saveDiary() {
    const content = document.getElementById('diaryContent').value.trim();
    if (!content) {
        alert('请输入日志内容');
        return;
    }
    
    const diary = {
        id: Date.now(),
        content: content,
        date: new Date().toLocaleDateString('zh-CN'),
        timestamp: new Date().toISOString()
    };
    
    this.saveContent('diaries', diary);
    hideEditor('diary');
    loadDiaries();
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleDateString('zh-CN'),
        timestamp: new Date().toISOString()
    };
    
    this.saveContent('notes', note);
    hideEditor('notes');
    loadNotes();
}

// 本地存储管理
function saveContent(type, content) {
    let items = JSON.parse(localStorage.getItem(type)) || [];
    items.unshift(content); // 新的放在前面
    localStorage.setItem(type, JSON.stringify(items));
}

function loadContent(type) {
    return JSON.parse(localStorage.getItem(type)) || [];
}

function loadDiaries() {
    const diaries = loadContent('diaries');
    const diaryList = document.getElementById('diaryList');
    
    if (!diaryList) return;
    
    if (diaries.length === 0) {
        diaryList.innerHTML = '<div class="empty-state"><p>暂无日志内容</p></div>';
        return;
    }
    
    diaryList.innerHTML = diaries.map(diary => `
        <div class="content-item">
            <div class="date">${diary.date}</div>
            <div class="content">${diary.content.replace(/\n/g, '<br>')}</div>
        </div>
    `).join('');
}

function loadNotes() {
    const notes = loadContent('notes');
    const notesList = document.getElementById('notesList');
    
    if (!notesList) return;
    
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state"><p>暂无学习笔记</p></div>';
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="content-item">
            <h3>${note.title}</h3>
            <div class="date">${note.date}</div>
            <div class="content">${note.content.replace(/\n/g, '<br>')}</div>
        </div>
    `).join('');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单处理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const key = document.getElementById('adminKey').value;
            if (authSystem.login(key)) {
                document.getElementById('authStatus').textContent = '登录成功！';
                document.getElementById('adminKey').value = '';
            } else {
                document.getElementById('authStatus').textContent = '密钥错误！';
            }
        });
    }
    
    // 根据当前页面加载相应内容
    if (window.location.pathname.includes('diary.html')) {
        loadDiaries();
    } else if (window.location.pathname.includes('notes.html')) {
        loadNotes();
    }
    
    // 初始化UI状态
    authSystem.updateUI();
});

// 删除功能全局变量
let noteToDelete = null;

// 增强的笔记加载功能
function loadNotes() {
    const notes = loadContent('notes');
    const notesList = document.getElementById('notesList');
    
    if (!notesList) return;
    
    if (notes.length === 0) {
        notesList.innerHTML = '<div class="empty-state"><p>暂无学习笔记</p></div>';
        return;
    }
    
    notesList.innerHTML = notes.map(note => `
        <div class="content-item ${authSystem.checkAuth() ? 'admin' : ''}">
            ${authSystem.checkAuth() ? `
                <div class="item-actions">
                    <button class="delete-btn" onclick="initiateDelete('${note.id}')" 
                            title="删除这篇笔记">🗑️</button>
                </div>
            ` : ''}
            <h3>${escapeHtml(note.title)}</h3>
            <div class="meta-info">
                <span class="date">${note.date} ${note.time}</span>
                <span class="category">${getCategoryName(note.category)}</span>
            </div>
            <div class="content">${formatContent(note.content)}</div>
            ${note.reference ? `
                <div class="reference">
                    <a href="${note.reference}" target="_blank">📎 参考链接</a>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 初始化删除流程
function initiateDelete(noteId) {
    if (!authSystem.checkAuth()) {
        showMessage('请先登录管理员账户', 'error');
        return;
    }
    
    noteToDelete = noteId;
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'flex';
    
    // 获取笔记标题用于确认
    const notes = loadContent('notes');
    const note = notes.find(n => n.id == noteId);
    if (note) {
        modal.querySelector('p').textContent = `确定要删除笔记"${note.title}"吗？此操作无法撤销。`;
    }
}

// 确认删除
function confirmDelete() {
    if (!noteToDelete) return;
    
    deleteNote(noteToDelete);
    noteToDelete = null;
    hideDeleteModal();
}

// 取消删除
function cancelDelete() {
    noteToDelete = null;
    hideDeleteModal();
}

// 隐藏删除确认对话框
function hideDeleteModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'none';
}

// 删除笔记核心逻辑
function deleteNote(noteId) {
    if (!authSystem.checkAuth()) {
        showMessage('权限不足，无法删除笔记', 'error');
        return false;
    }
    
    let notes = loadContent('notes');
    const initialLength = notes.length;
    
    // 过滤掉要删除的笔记
    notes = notes.filter(note => note.id != noteId);
    
    if (notes.length === initialLength) {
        showMessage('未找到要删除的笔记', 'error');
        return false;
    }
    
    // 保存更新后的笔记列表
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // 重新加载笔记列表
    loadNotes();
    
    showMessage('笔记删除成功', 'success');
    return true;
}

// 辅助函数：HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 辅助函数：加载内容
function loadContent(type) {
    return JSON.parse(localStorage.getItem(type)) || [];
}

// 保存笔记功能（保持不变）
function saveNote() {
    if (!authSystem.checkAuth()) {
        showMessage('请先登录管理员账户', 'error');
        return;
    }
    
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const category = document.getElementById('noteCategory').value;
    const reference = document.getElementById('noteReference').value;
    
    if (!title || !content) {
        showMessage('请填写标题和内容', 'error');
        return;
    }
    
    const note = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        reference: reference,
        date: new Date().toLocaleDateString('zh-CN'),
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        timestamp: new Date().getTime()
    };
    
    saveContent('notes', note);
    showMessage('笔记发布成功！', 'success');
    hideEditor('notes');
    loadNotes();
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    loadNotes();
    
    // 点击模态框外部关闭
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cancelDelete();
            }
        });
    }
});
