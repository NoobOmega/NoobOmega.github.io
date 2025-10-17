// 通用工具函数
const utils = {
    // 格式化日期
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // 防抖函数
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 安全HTML渲染
    sanitizeHtml: function(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    // 本地存储增强
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('存储失败:', e);
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('读取失败:', e);
                return defaultValue;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('删除失败:', e);
                return false;
            }
        }
    },
    
    // 响应式助手
    responsive: {
        isMobile: function() {
            return window.innerWidth <= 768;
        },
        
        isTablet: function() {
            return window.innerWidth > 768 && window.innerWidth <= 1024;
        },
        
        isDesktop: function() {
            return window.innerWidth > 1024;
        }
    }
};

// 主题管理
const themeManager = {
    currentTheme: localStorage.getItem('blogTheme') || 'light',
    
    init: function() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
    },
    
    applyTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('blogTheme', theme);
        this.currentTheme = theme;
    },
    
    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },
    
    createThemeToggle: function() {
        // 可以在这里添加主题切换按钮
    }
};

// 初始化通用功能
document.addEventListener('DOMContentLoaded', function() {
    themeManager.init();
    
    // 添加全局错误处理
    window.addEventListener('error', function(e) {
        console.error('全局错误:', e.error);
    });
});
