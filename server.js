const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// 启用 CORS
app.use(cors());

// 静态文件服务
console.log('配置静态文件目录:', __dirname);
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// 添加路由以确保所有HTML文件都能访问
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/today', (req, res) => {
    res.sendFile(path.join(__dirname, 'today.html'));
});

app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'calendar.html'));
});

app.get('/gantt', (req, res) => {
    res.sendFile(path.join(__dirname, 'gantt.html'));
});

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// JSON 解析中间件
app.use(express.json());

// 测试路由
app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: '服务器运行正常' });
});

// 处理状态更新的POST请求
app.post('/updateData', (req, res) => {
    try {
        const data = req.body;
        // 检查文件是否存在和可写
        const dataPath = path.join(__dirname, 'data.json');
        console.log('正在写入文件:', dataPath);
        
        try {
            // 检查文件权限
            fs.accessSync(dataPath, fs.constants.W_OK);
            console.log('文件可写');
        } catch (err) {
            console.error('文件权限错误:', err);
            throw new Error('文件无法写入，请检查权限');
        }

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
        console.log('数据已成功写入文件');
        res.json({ success: true, message: '数据已更新' });
    } catch (error) {
        console.error('更新数据失败:', error);
        res.status(500).json({ success: false, message: '更新失败' });
    }
});

// 处理删除任务的POST请求
app.post('/deleteTask', (req, res) => {
    try {
        const index = req.body.index;
        const dataPath = path.join(__dirname, 'data.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        if (index >= 0 && index < data.employees.length) {
            data.employees.splice(index, 1);
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
            res.json({ success: true, message: '任务已删除' });
        } else {
            res.status(400).json({ success: false, message: '无效的索引' });
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        res.status(500).json({ success: false, message: '删除任务失败' });
    }
});

// 启动服务器
const PORT = 8000;
app.listen(PORT, () => {
    console.log('\n=== 服务器启动成功 ===');
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('\n=== 环境信息 ===');
    console.log('静态文件目录:', __dirname);
    console.log('当前工作目录:', process.cwd());
    console.log('\n=== 可用端点 ===');
    console.log('- GET  /              静态文件服务');
    console.log('- GET  /test          服务器状态测试');
    console.log('- POST /updateData    更新数据');
    console.log('\n=== 文件服务 ===');
    console.log('- index.html          列表视图');
    console.log('- today.html          今日任务');
    console.log('- calendar.html       日历视图');
    console.log('- gantt.html          甘特图');
    console.log('- data.json           数据文件');
    console.log('\n服务器已准备就绪，请访问 http://localhost:8000\n');
});

// 添加重启服务器的路由
app.post('/restart', (req, res) => {
    console.log('\n=== 服务器正在重启 ===');
    res.json({ success: true, message: '服务器正在重启...' });
    
    // 确保响应发送后再重启
    res.on('finish', () => {
        // 等待所有连接处理完成
        setTimeout(() => {
            process.exit(0); // 使用 exit code 0 表示正常退出
        }, 1000);
    });
});

// 添加错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器内部错误');
});

// 优雅退出处理
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，准备关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，准备关闭服务器...');
    process.exit(0);
});
