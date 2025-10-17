// 简单的权限管理系统
class AuthSystem {
    constructor() {
        this.adminKey = 'noobomega123'; // 默认管理员密钥，实际使用中应该更复杂
        this.isAuthenticated = false;
        this.init();
    }
    
    init() {
        // 检查本地存储中的认证状态
        const savedAuth = localStorage.getItem('blog_admin_auth');
        if (savedAuth === this.adminKey) {
            this.isAuthenticated = true;
        }
        this.updateUI();
    }
    
    login(key) {
        if (key === this.adminKey) {
            this.isAuthenticated = true;
            localStorage.setItem('blog_admin_auth', key);
            this.updateUI();
            return true;
        }
        return false;
    }
    
    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('blog_admin_auth');
        this.updateUI();
    }
    
    checkAuth() {
        return this.isAuthenticated;
    }
    
    updateUI() {
        // 更新界面显示
        const authStatus = document.getElementById('authStatus');
        const diaryAccess = document.getElementById('diaryAccess');
        const notesAccess = document.getElementById('notesAccess');
        const addDiaryBtn = document.getElementById('addDiaryBtn');
        const addNoteBtn = document.getElementById('addNoteBtn');
        
        if (this.isAuthenticated) {
            if (authStatus) authStatus.textContent = '管理员模式';
            if (diaryAccess) {
                diaryAccess.textContent = '可读写';
                diaryAccess.className = 'access-badge admin';
            }
            if (notesAccess) {
                notesAccess.textContent = '可读写';
                notesAccess.className = 'access-badge admin';
            }
            if (addDiaryBtn) addDiaryBtn.style.display = 'block';
            if (addNoteBtn) addNoteBtn.style.display = 'block';
        } else {
            if (authStatus) authStatus.textContent = '';
            if (diaryAccess) {
                diaryAccess.textContent = '只读模式';
                diaryAccess.className = 'access-badge';
            }
            if (notesAccess) {
                notesAccess.textContent = '只读模式';
                notesAccess.className = 'access-badge';
            }
            if (addDiaryBtn) addDiaryBtn.style.display = 'none';
            if (addNoteBtn) addNoteBtn.style.display = 'none';
        }
    }
}

// 初始化认证系统
const authSystem = new AuthSystem();
