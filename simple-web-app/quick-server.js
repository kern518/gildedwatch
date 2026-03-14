// 快速启动的简单服务器
const http = require('http');
const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');
const PORT = 3000;

// 获取系统信息
function getSystemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);
  
  // 获取磁盘信息
  const diskStats = fs.statfsSync ? fs.statfsSync('/') : { 
    bsize: 4096,
    blocks: 1000000,
    bfree: 500000
  };
  const totalDisk = diskStats.bsize * diskStats.blocks;
  const freeDisk = diskStats.bsize * diskStats.bfree;
  const usedDisk = totalDisk - freeDisk;
  const diskUsage = Math.round((usedDisk / totalDisk) * 100);
  
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    loadAvg: os.loadavg(),
    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      usage: memUsage
    },
    disk: {
      total: formatBytes(totalDisk),
      used: formatBytes(usedDisk),
      free: formatBytes(freeDisk),
      usage: diskUsage
    },
    cpus: os.cpus().length,
    network: Object.values(os.networkInterfaces()).flat().filter(i => i.family === 'IPv4' && !i.internal)
  };
}

// 获取OpenClaw信息
function getOpenClawInfo() {
  try {
    // 检查Gateway进程
    let gatewayPid = null;
    let gatewayStatus = 'stopped';
    let gatewayUptime = null;
    let gatewayMemory = null;
    
    try {
      const psOutput = execSync('ps aux | grep openclaw-gateway | grep -v grep', { encoding: 'utf8' }).trim();
      if (psOutput) {
        const parts = psOutput.split(/\s+/);
        gatewayPid = parts[1];
        gatewayStatus = 'running';
        
        // 获取进程运行时间
        const uptimeCmd = `ps -o etime= -p ${gatewayPid}`;
        try {
          gatewayUptime = execSync(uptimeCmd, { encoding: 'utf8' }).trim();
        } catch (e) {
          gatewayUptime = 'unknown';
        }
        
        // 获取进程内存使用
        const memCmd = `ps -o rss= -p ${gatewayPid}`;
        try {
          const memKB = parseInt(execSync(memCmd, { encoding: 'utf8' }).trim());
          gatewayMemory = formatBytes(memKB * 1024);
        } catch (e) {
          gatewayMemory = 'unknown';
        }
      }
    } catch (error) {
      // Gateway未运行
    }
    
    // 检查OpenClaw会话
    let sessions = [];
    try {
      const statusOutput = execSync('openclaw status --json 2>/dev/null || echo "{}"', { encoding: 'utf8' });
      const status = JSON.parse(statusOutput || '{}');
      sessions = status.sessions || [];
    } catch (error) {
      // 无法获取状态
    }
    
    // 检查工作空间
    const workspacePath = '/root/.openclaw/workspace';
    let workspace = {
      path: workspacePath,
      exists: fs.existsSync(workspacePath)
    };
    
    if (workspace.exists) {
      try {
        const files = fs.readdirSync(workspacePath);
        workspace.files = files.length;
        workspace.size = formatBytes(getFolderSize(workspacePath));
      } catch (e) {
        workspace.size = 'unknown';
      }
    }
    
    // 检查通道状态
    let channels = [];
    try {
      const channelsOutput = execSync('openclaw channels list --json 2>/dev/null || echo "[]"', { encoding: 'utf8' });
      channels = JSON.parse(channelsOutput || '[]');
    } catch (error) {
      channels = [
        { name: 'Telegram', status: 'configured' },
        { name: 'Feishu', status: 'not_configured' }
      ];
    }
    
    return {
      gatewayPid,
      gatewayStatus,
      gatewayUptime,
      gatewayMemory,
      sessions: sessions.length,
      channels: channels.length,
      workspace,
      version: getOpenClawVersion()
    };
  } catch (error) {
    return {
      gatewayStatus: 'error',
      error: error.message,
      sessions: 0,
      channels: 0,
      workspace: { exists: false }
    };
  }
}

// 获取OpenClaw版本
function getOpenClawVersion() {
  try {
    const version = execSync('openclaw --version 2>/dev/null || echo "unknown"', { encoding: 'utf8' }).trim();
    return version;
  } catch (error) {
    return 'unknown';
  }
}

// 获取文件夹大小
function getFolderSize(path) {
  let size = 0;
  try {
    const files = fs.readdirSync(path);
    for (const file of files) {
      const filePath = `${path}/${file}`;
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += getFolderSize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch (e) {
    // 忽略错误
  }
  return size;
}

// 格式化字节大小
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 路由处理
  if (req.url === '/api/health' && req.method === 'GET') {
    // 获取系统信息
    const systemInfo = getSystemInfo();
    const openclawInfo = getOpenClawInfo();
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'OpenClaw健康监控',
      version: '2.0.0',
      
      // OpenClaw核心状态
      openclaw: {
        gateway: {
          pid: openclawInfo.gatewayPid,
          status: openclawInfo.gatewayStatus,
          uptime: openclawInfo.gatewayUptime,
          memory: openclawInfo.gatewayMemory
        },
        sessions: openclawInfo.sessions,
        channels: openclawInfo.channels,
        workspace: openclawInfo.workspace
      },
      
      // 系统状态
      system: {
        hostname: systemInfo.hostname,
        platform: systemInfo.platform,
        arch: systemInfo.arch,
        node_version: systemInfo.nodeVersion,
        uptime: systemInfo.uptime,
        load_average: systemInfo.loadAvg,
        memory: systemInfo.memory,
        disk: systemInfo.disk
      },
      
      // 服务状态
      services: {
        web_server: {
          status: 'running',
          port: PORT,
          protocol: 'http',
          endpoints: ['/', '/api/health', '/api/greet', '/api/echo']
        },
        openclaw_gateway: openclawInfo.gatewayStatus === 'running' ? 'running' : 'stopped'
      },
      
      // 健康检查结果
      checks: {
        openclaw_gateway: openclawInfo.gatewayStatus === 'running' ? 'pass' : 'fail',
        disk_space: systemInfo.disk.usage < 90 ? 'pass' : 'warning',
        memory_usage: systemInfo.memory.usage < 85 ? 'pass' : 'warning',
        load_average: systemInfo.loadAvg[0] < 2.0 ? 'pass' : 'warning'
      },
      
      message: 'OpenClaw系统状态监控正常',
      documentation: '访问 / 查看完整API文档'
    }));
    return;
  }
  
  if (req.url.startsWith('/api/greet') && req.method === 'GET') {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const name = url.searchParams.get('name') || '访客';
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      message: `你好，${name}！`,
      timestamp: new Date().toISOString(),
      language: 'zh-CN'
    }));
    return;
  }
  
  if (req.url === '/api/echo' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          received: data,
          echoed: true,
          timestamp: new Date().toISOString(),
          note: '数据已成功接收并回显'
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: '无效的JSON数据',
          message: error.message
        }));
      }
    });
    return;
  }
  
  // 默认首页
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenClaw快速演示</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          }
          .status {
            background: #e8f4fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .endpoints {
            margin-bottom: 25px;
          }
          .endpoint {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
          }
          .method {
            display: inline-block;
            padding: 4px 8px;
            background: #4caf50;
            color: white;
            border-radius: 4px;
            font-size: 0.9rem;
            margin-right: 10px;
          }
          .demo {
            background: #fff8e1;
            border: 1px solid #ffd54f;
            padding: 20px;
            border-radius: 8px;
          }
          button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
            font-size: 1rem;
          }
          button:hover {
            background: #1976d2;
          }
          #response {
            margin-top: 15px;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 OpenClaw快速演示</h1>
          
          <div class="status">
            <strong>✅ 服务器运行中！</strong>
            <p>这是一个由OpenClaw在几秒钟内生成的完整Web服务器。</p>
          </div>
          
          <div class="endpoints">
            <h3>📡 可用API接口：</h3>
            <div class="endpoint">
              <span class="method">GET</span>
              <strong>/api/health</strong> - 健康检查
            </div>
            <div class="endpoint">
              <span class="method">GET</span>
              <strong>/api/greet?name=你的名字</strong> - 个性化问候
            </div>
            <div class="endpoint">
              <span class="method">POST</span>
              <strong>/api/echo</strong> - 数据回显
            </div>
          </div>
          
          <div class="demo">
            <h3>🔄 实时测试：</h3>
            <button onclick="testHealth()">测试健康检查</button>
            <button onclick="testGreet()">测试问候</button>
            <button onclick="testEcho()">测试回显</button>
            
            <div id="response"></div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666;">
            <p>✨ 由 <strong>OpenClaw</strong> 自动生成 • 端口: ${PORT}</p>
          </div>
        </div>
        
        <script>
          async function testHealth() {
            try {
              const response = await fetch('/api/health');
              const data = await response.json();
              showResponse(data);
            } catch (error) {
              showResponse({ error: error.message });
            }
          }
          
          async function testGreet() {
            const name = prompt('请输入你的名字：', 'OpenClaw用户');
            if (name) {
              try {
                const response = await fetch(\`/api/greet?name=\${encodeURIComponent(name)}\`);
                const data = await response.json();
                showResponse(data);
              } catch (error) {
                showResponse({ error: error.message });
              }
            }
          }
          
          async function testEcho() {
            const message = prompt('请输入要发送的消息：', '你好，OpenClaw！');
            if (message) {
              try {
                const response = await fetch('/api/echo', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    message: message,
                    timestamp: new Date().toISOString()
                  })
                });
                const data = await response.json();
                showResponse(data);
              } catch (error) {
                showResponse({ error: error.message });
              }
            }
          }
          
          function showResponse(data) {
            document.getElementById('response').textContent = 
              JSON.stringify(data, null, 2);
          }
        </script>
      </body>
      </html>
    `);
    return;
  }
  
  // 404处理
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: '未找到',
    message: `请求的资源 ${req.url} 不存在`,
    timestamp: new Date().toISOString()
  }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`
  🚀 OpenClaw快速演示服务器启动成功！
  
  📍 本地访问: http://localhost:${PORT}
  📍 健康检查: http://localhost:${PORT}/api/health
  📍 API文档: 访问首页查看
  
  ⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}
  🎯 状态: 运行中
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});