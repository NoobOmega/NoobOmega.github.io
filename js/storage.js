class DataStorage {
    constructor() {
        this.storageKeys = {
            LOGS: 'blog_logs',
            NOTES: 'blog_notes',
            SETTINGS: 'blog_settings'
        };
        this.initializeData();
    }
    
    initializeData() {
        // 初始化示例数据
        if (!this.getLogs().length) {
            const sampleLogs = [
                {
                    id: 'log_1',
                    title: '欢迎来到我的博客',
                    content: '这是我的第一篇日志，欢迎来到我的个人博客空间！',
                    date: new Date().toISOString(),
                    private: false,
                    type: 'log'
                }
            ];
            localStorage.setItem(this.storageKeys.LOGS, JSON.stringify(sampleLogs));
        }
    }
    
    // 日志相关方法
    getLogs() {
        return JSON.parse(localStorage.getItem(this.storageKeys.LOGS) || '[]');
    }
    
    addLog(logData) {
        const logs = this.getLogs();
        logs.push(logData);
        this.saveLogs(logs);
    }
    
    updateLog(logId, newData) {
        const logs = this.getLogs();
        const index = logs.findIndex(log => log.id === logId);
        if (index !== -1) {
            logs[index] = { ...logs[index], ...newData };
            this.saveLogs(logs);
        }
    }
    
    deleteLog(logId) {
        const logs = this.getLogs().filter(log => log.id !== logId);
        this.saveLogs(logs);
    }
    
    saveLogs(logs) {
        localStorage.setItem(this.storageKeys.LOGS, JSON.stringify(logs));
    }
    
    // 通用方法
    getRecentPosts(limit = 5) {
        const allPosts = [...this.getLogs(), ...this.getNotes()];
        return allPosts
            .filter(post => !post.private)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }
    
    exportData() {
        const data = {
            logs: this.getLogs(),
            notes: this.getNotes(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.logs) this.saveLogs(data.logs);
            if (data.notes) this.saveNotes(data.notes);
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }
}

const storage = new DataStorage();
