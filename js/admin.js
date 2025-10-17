// 管理员专用功能
const admin = {
    // 增强的权限检查
    checkPrivileges: function() {
        if (!auth.isAdmin()) {
            console.warn('权限不足：需要管理员权限');
            return false;
        }
        return true;
    },
    
    // 数据备份功能
    backupData: function() {
        if (!this.checkPrivileges()) return;
        
        const backup = {
            timestamp: new Date().toISOString(),
            logs: utils.storage.get('blogLogs', []),
            notes: utils.storage.get('blogNotes', []),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        this.downloadFile(dataStr, `blog_backup_${backup.timestamp.split('T')[0]}.json`);
    },
    
    // 数据恢复功能
    restoreData: function(file) {
        if (!this.checkPrivileges()) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (confirm(`确定要恢复 ${backup.timestamp} 的备份吗？当前数据将被覆盖。`)) {
                    utils.storage.set('blogLogs', backup.logs || []);
                    utils.storage.set('blogNotes', backup.notes || []);
                    alert('数据恢复成功！页面将重新加载。');
                    location.reload();
                }
            } catch (error) {
                alert('备份文件格式错误！');
                console.error('恢复失败:', error);
            }
        };
        reader.readAsText(file);
    },
    
    // 数据统计
    getStats: function() {
        if (!this.checkPrivileges()) return null;
        
        const logs = utils.storage.get('blogLogs', []);
        const notes = utils.storage.get('blogNotes', []);
        
        return {
            totalLogs: logs.length,
            totalNotes: notes.length,
            publicLogs: logs.filter(log => !log.private).length,
            publicNotes: notes.filter(note => !note.private).length,
            lastUpdated: new Date().toISOString()
        };
    },
    
    // 文件下载工具
    downloadFile: function(content, filename, type = 'application/json') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    // 批量操作
    batchDelete: function(type) {
        if (!this.checkPrivileges() || !confirm('确定要批量删除吗？此操作不可恢复！')) return;
        
        if (type === 'logs') {
            utils.storage.set('blogLogs', []);
        } else if (type === 'notes') {
            utils.storage.set('blogNotes', []);
        }
        
        alert('批量删除完成！页面将重新加载。');
        location.reload();
    }
};

// 后门功能扩展点
auth.backdoor.extendFunctionality(function() {
    console.log('后门功能已加载 - 可用于后续扩展');
    
    // 示例：添加紧急恢复功能
    window.emergencyRecovery = function() {
        if (confirm('紧急恢复：重置所有数据？')) {
            localStorage.clear();
            alert('数据已重置，页面将重新加载。');
            location.reload();
        }
    };
});
