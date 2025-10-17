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
