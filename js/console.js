// 管理员功能处理函数
function handleWriteDiary() {
    if (!authSystem.checkAuth()) {
        showMessage('请先登录管理员账户', 'error');
        return;
    }
    
    // 跳转到日志页面并打开编辑器
    if (window.location.pathname.includes('diary.html')) {
        showEditor('diary');
    } else {
        window.location.href = 'diary.html';
        // 在日记页面加载后自动打开编辑器
        localStorage.setItem('autoOpenEditor', 'diary');
    }
}

function handleWriteNote() {
    if (!authSystem.checkAuth()) {
        showMessage('请先登录管理员账户', 'error');
        return;
    }
    
    // 跳转到笔记页面并打开编辑器
    if (window.location.pathname.includes('notes.html')) {
        showEditor('notes');
    } else {
        window.location.href = 'notes.html';
        // 在笔记页面加载后自动打开编辑器
        localStorage.setItem('autoOpenEditor', 'notes');
    }
}

function handleBackup() {
    if (!authSystem.checkAuth()) {
        showMessage('请先登录管理员账户', 'error');
        return;
    }
    
    backupData();
}

function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        authSystem.logout();
        showMessage('已退出登录', 'success');
        // 刷新页面以更新UI状态
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// 数据备份功能
function backupData() {
    try {
        const backup = {
            diaries: JSON.parse(localStorage.getItem('diaries')) || [],
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            backupTime: new Date().toISOString(),
            version: '1.0'
        };
        
        // 创建备份文件下载
        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `blog-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showMessage('数据备份成功，文件已开始下载', 'success');
        
    } catch (error) {
        console.error('备份失败:', error);
        showMessage('数据备份失败: ' + error.message, 'error');
    }
}

// 数据恢复功能（可选添加）
function restoreData(backupFile) {
    if (!authSystem.checkAuth()) {
        showMessage('权限不足', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            // 验证备份文件格式
            if (backup.diaries && backup.notes) {
                if (confirm('这将覆盖现有数据，确定要继续吗？')) {
                    localStorage.setItem('diaries', JSON.stringify(backup.diaries));
                    localStorage.setItem('notes', JSON.stringify(backup.notes));
                    showMessage('数据恢复成功', 'success');
                    // 重新加载内容
                    if (window.location.pathname.includes('diary.html')) {
                        loadDiaries();
                    } else if (window.location.pathname.includes('notes.html')) {
                        loadNotes();
                    }
                }
            } else {
                showMessage('无效的备份文件格式', 'error');
            }
        } catch (error) {
            showMessage('恢复失败: ' + error.message, 'error');
        }
    };
    reader.readAsText(backupFile);
}

// 更新认证系统，显示/隐藏管理员功能
class AuthSystem {
    // ... 原有代码 ...
    
    updateUI() {
        // ... 原有代码 ...
        
        // 更新管理员功能显示
        const adminFunctions = document.getElementById('adminFunctions');
        if (adminFunctions) {
            if (this.isAuthenticated) {
                adminFunctions.style.display = 'block';
            } else {
                adminFunctions.style.display = 'none';
            }
        }
    }
}

// 页面加载时检查是否需要自动打开编辑器
document.addEventListener('DOMContentLoaded', function() {
    // ... 原有代码 ...
    
    // 检查是否需要自动打开编辑器
    const autoOpenEditor = localStorage.getItem('autoOpenEditor');
    if (autoOpenEditor && authSystem.checkAuth()) {
        setTimeout(() => {
            showEditor(autoOpenEditor);
            localStorage.removeItem('autoOpenEditor');
        }, 500);
    }
});
