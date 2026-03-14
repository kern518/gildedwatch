import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import os from 'os';

// 类型定义
interface CpuInfo {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

// 创建Express应用
const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// 中间件
app.use(cors());

// 只在生产环境使用helmet安全头
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}
// 开发环境：完全不使用helmet，避免安全策略干扰

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API路由
app.get('/api/health', (_req: Request, res: Response) => {
  // CPU使用率（需要计算）
  const cpus = os.cpus() as CpuInfo[];
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach((cpu: CpuInfo) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });
  
  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const cpuUsage = 100 - Math.round(100 * idle / total);
  
  // 内存使用率
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);
  
  // 系统负载
  const loadAvg = os.loadavg();
  
  // 进程内存使用
  const processMem = process.memoryUsage();
  
  // 获取网络接口信息（简化处理）
  const networkInterfaces = os.networkInterfaces();
  const networkInfo: Array<{address: string, netmask: string, mac: string}> = [];
  
  Object.values(networkInterfaces).forEach(ifaceArray => {
    if (ifaceArray) {
      ifaceArray.forEach(iface => {
        if (iface && !iface.internal && iface.family === 'IPv4') {
          networkInfo.push({
            address: iface.address,
            netmask: iface.netmask,
            mac: iface.mac
          });
        }
      });
    }
  });
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Simple Web App',
    version: '1.0.0',
    
    // 系统信息
    system: {
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(), // 系统运行时间（秒）
      
      // CPU信息
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        usage: `${cpuUsage}%`,
        details: cpus.map(cpu => ({
          model: cpu.model,
          speed: cpu.speed,
          times: cpu.times
        })).slice(0, 2) // 只显示前2个CPU核心的详细信息
      },
      
      // 内存信息
      memory: {
        total: formatBytes(totalMem),
        used: formatBytes(usedMem),
        free: formatBytes(freeMem),
        usage: `${memUsage}%`,
        details: {
          totalBytes: totalMem,
          usedBytes: usedMem,
          freeBytes: freeMem,
          usagePercentage: memUsage
        },
        process: {
          rss: formatBytes(processMem.rss),      // 常驻内存
          heapTotal: formatBytes(processMem.heapTotal), // 堆内存总量
          heapUsed: formatBytes(processMem.heapUsed),   // 堆内存使用量
          external: formatBytes(processMem.external),   // 外部内存
          arrayBuffers: formatBytes(processMem.arrayBuffers || 0) // 数组缓冲区
        }
      },
      
      // 系统负载（1分钟、5分钟、15分钟）
      load: {
        '1min': loadAvg[0].toFixed(2),
        '5min': loadAvg[1].toFixed(2),
        '15min': loadAvg[2].toFixed(2),
        raw: loadAvg
      },
      
      // 网络接口
      network: networkInfo,
      
      // 其他系统信息
      userInfo: os.userInfo(),
      release: os.release(),
      type: os.type()
    },
    
    // 进程信息
    process: {
      pid: process.pid,
      uptime: process.uptime(), // 进程运行时间（秒）
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      memory: {
        rss: processMem.rss,
        heapTotal: processMem.heapTotal,
        heapUsed: processMem.heapUsed,
        external: processMem.external,
        arrayBuffers: processMem.arrayBuffers || 0
      }
    },
    
    // 性能指标
    performance: {
      cpuUsage: cpuUsage,
      memoryUsage: memUsage,
      loadAverage: loadAvg[0],
      timestamp: Date.now()
    }
  });
});

// 辅助函数：格式化字节大小
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

app.get('/api/greet', (req: Request, res: Response) => {
  const name = req.query.name || 'Visitor';
  res.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/echo', (req: Request, res: Response) => {
  const data = req.body;
  res.json({
    received: data,
    echoed: true,
    timestamp: new Date().toISOString()
  });
});

// 页面路由
app.get('/', (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple Web App - OpenClaw Demo</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        body {
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
          max-width: 800px;
          width: 100%;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        h1 {
          color: #333;
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        
        .subtitle {
          color: #666;
          font-size: 1.2rem;
        }
        
        .status {
          background: #f0f9ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .status h3 {
          color: #1e40af;
          margin-bottom: 10px;
        }
        
        .endpoints {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .endpoint {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .endpoint:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .method {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        
        .get { background: #d1fae5; color: #065f46; }
        .post { background: #dbeafe; color: #1e40af; }
        
        .path {
          font-family: 'Monaco', 'Courier New', monospace;
          color: #334155;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        
        .description {
          color: #64748b;
          font-size: 0.95rem;
        }
        
        .demo {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .demo h3 {
          color: #92400e;
          margin-bottom: 15px;
        }
        
        .buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }
        
        .primary {
          background: #3b82f6;
          color: white;
        }
        
        .primary:hover {
          background: #2563eb;
        }
        
        .secondary {
          background: #e2e8f0;
          color: #475569;
        }
        
        .secondary:hover {
          background: #cbd5e1;
        }
        
        .response {
          margin-top: 20px;
          background: #1e293b;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 0.9rem;
          max-height: 200px;
          overflow-y: auto;
          display: none;
        }
        
        .footer {
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        
        .openclaw-badge {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          margin-left: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Simple Web App</h1>
          <p class="subtitle">OpenClaw自动生成的TypeScript + Express项目演示</p>
        </div>
        
        <div class="status">
          <h3>✅ 服务状态</h3>
          <p>服务器正在运行中！这是一个由OpenClaw AI助手自动创建和部署的完整Web应用。</p>
        </div>
        
        <div class="endpoints">
          <div class="endpoint">
            <span class="method get">GET</span>
            <div class="path">/api/health</div>
            <p class="description">检查服务健康状态，返回服务信息和时间戳。</p>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <div class="path">/api/greet?name=YourName</div>
            <p class="description">个性化问候接口，可传递name参数。</p>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>
            <div class="path">/api/echo</div>
            <p class="description">回显接口，发送JSON数据会原样返回。</p>
          </div>
        </div>
        
        <div class="demo">
          <h3>🔄 实时演示</h3>
          <p>点击按钮测试API接口：</p>
          
          <div class="buttons">
            <button class="primary" onclick="testHealth()">测试健康检查</button>
            <button class="primary" onclick="testGreet()">测试问候接口</button>
            <button class="secondary" onclick="testEcho()">测试回显接口</button>
          </div>
          
          <div id="response" class="response"></div>
        </div>
        
        <div class="footer">
          <p>✨ 这个项目完全由OpenClaw AI助手自动生成，包括：</p>
          <p>• TypeScript配置 • Express服务器 • 完整的前端界面 • API文档 • 实时演示</p>
          <p>生成时间: <span id="current-time"></span></p>
          <p>Powered by <span class="openclaw-badge">OpenClaw</span></p>
        </div>
      </div>
      
      <script>
        // 显示当前时间
        function updateTime() {
          const now = new Date();
          document.getElementById('current-time').textContent = 
            now.toLocaleString('zh-CN', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // API测试函数
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
          const name = prompt('请输入你的名字:', 'OpenClaw用户');
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
          const message = prompt('请输入要回显的消息:', 'Hello OpenClaw!');
          if (message) {
            try {
              const response = await fetch('/api/echo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                  message: message,
                  timestamp: new Date().toISOString(),
                  from: 'Web Demo'
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
          const responseEl = document.getElementById('response');
          responseEl.textContent = JSON.stringify(data, null, 2);
          responseEl.style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});

// 404处理
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${_req.path} was not found`,
    timestamp: new Date().toISOString()
  });
});

// 错误处理
app.use((err: Error, _req: Request, res: Response) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 服务器启动成功！
  
  📍 本地访问: http://localhost:${PORT}
  📍 健康检查: http://localhost:${PORT}/api/health
  📍 API文档: http://localhost:${PORT}
  
  📊 服务信息:
    • 环境: ${process.env.NODE_ENV || 'development'}
    • 端口: ${PORT}
    • 时间: ${new Date().toISOString()}
    • PID: ${process.pid}
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});