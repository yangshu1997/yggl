const { spawn } = require('child_process');
const http = require('http');

console.log('准备重启服务器...');

// 首先发送重启请求
const restartRequest = http.request({
    hostname: 'localhost',
    port: 8000,
    path: '/restart',
    method: 'POST'
}, (res) => {
    console.log('重启请求已发送，等待服务器关闭...');
    
    // 等待2秒后启动新的服务器实例
    setTimeout(() => {
        console.log('正在启动新的服务器实例...');
        
        // 使用 spawn 而不是 exec，这样可以继承父进程的标准输入输出
        const server = spawn('node', ['server.js'], {
            stdio: 'inherit',
            detached: true
        });

        // 错误处理
        server.on('error', (err) => {
            console.error('启动服务器失败:', err);
            process.exit(1);
        });

        // 分离子进程
        server.unref();
        
        // 等待服务器启动
        setTimeout(() => {
            console.log('\n服务器重启完成！');
            process.exit(0);
        }, 2000);
    }, 2000);
});

restartRequest.on('error', (error) => {
    console.error('发送重启请求失败:', error.message);
    process.exit(1);
});

restartRequest.end();
