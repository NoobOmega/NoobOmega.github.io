class AuthSystem {
    constructor() {
        this.defaultPasswords = [
            'noobomega_admin_2024',
            'admin123',
            'password',
            '123456'
        ];
        this.backdoorPasswords = [
            'emergency_access_2024',
            'backdoor_omega'
        ];
    }
    
    isLoggedIn() {
        return localStorage.getItem('admin_logged_in') === 'true';
    }
    
    login(password) {
        // 检查默认密码
        if (this.defaultPasswords.includes(password)) {
            this.setLoginStatus(true);
            return true;
        }
        
        // 检查后门密码
        if (this.backdoorPasswords.includes(password)) {
            this.setLoginStatus(true);
            console.log('后门访问已激活');
            return true;
        }
        
        // 检查动态密码
        if (this.checkDynamicPassword(password)) {
            this.setLoginStatus(true);
            return true;
        }
        
        return false;
    }
    
    logout() {
        this.setLoginStatus(false);
        window.location.href = 'index.html';
    }
    
    setLoginStatus(status) {
        localStorage.setItem('admin_logged_in', status.toString());
    }
    
    checkDynamicPassword(input) {
        const date = new Date();
        const dynamicPattern = `omega_${date.getMonth() + 1}${date.getDate()}`;
        return input === dynamicPattern;
    }
    
    // 便于后续扩展的方法
    addPassword(password) {
        if (!this.defaultPasswords.includes(password)) {
            this.defaultPasswords.push(password);
        }
    }
    
    removePassword(password) {
        this.defaultPasswords = this.defaultPasswords.filter(p => p !== password);
    }
}

// 创建全局实例
const auth = new AuthSystem();
