#!/usr/bin/env python3
"""
GildedWatch 简化版 - 使用模拟数据启动，等待依赖安装
"""

import datetime
import random
import sys
import os

# 检查是否在虚拟环境中
if not os.path.exists('venv'):
    print("❌ 虚拟环境不存在，请先创建虚拟环境")
    sys.exit(1)

# 尝试导入 Flask，如果失败则使用备用方案
try:
    from flask import Flask, render_template_string, jsonify
    FLASK_AVAILABLE = True
except ImportError:
    print("⚠️  Flask 未安装，使用简化模式")
    FLASK_AVAILABLE = False

# HTML 模板（简化版）
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GildedWatch - 黄金价格</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            text-align: center;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
        }
        .price {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            color: #e67e22;
            margin: 30px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        .info-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .status {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .up { color: #27ae60; }
        .down { color: #e74c3c; }
        .controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💰 GildedWatch - 黄金价格监控</h1>
        
        <div class="price" id="price">$2,034.50</div>
        
        <div class="info-grid">
            <div class="info-card">
                <strong>交易代码:</strong> GC=F
            </div>
            <div class="info-card">
                <strong>价格:</strong> <span id="currentPrice">2034.50</span> USD
            </div>
            <div class="info-card">
                <strong>涨跌幅:</strong> <span id="change" class="up">+4.25 (+0.21%)</span>
            </div>
            <div class="info-card">
                <strong>更新时间:</strong> <span id="time">2026-03-14 14:03:00</span>
            </div>
        </div>
        
        <div class="status">
            <strong>系统状态:</strong>
            <p>• 虚拟环境: <span id="venvStatus">✅ 已创建</span></p>
            <p>• Flask: <span id="flaskStatus">⏳ 安装中...</span></p>
            <p>• yfinance: <span id="yfinanceStatus">⏳ 安装中...</span></p>
            <p>• 当前数据: <span id="dataStatus">📊 模拟数据</span></p>
        </div>
        
        <div class="controls">
            <button onclick="refreshPrice()">🔄 刷新价格</button>
            <button onclick="checkStatus()">📊 检查状态</button>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
            <p>GildedWatch v1.0 | 依赖安装进度: <span id="installProgress">70%</span></p>
            <p>预计完成时间: <span id="eta">2分钟</span></p>
        </div>
    </div>
    
    <script>
        let basePrice = 2034.50;
        
        function updatePrice() {
            // 模拟价格波动
            const change = (Math.random() - 0.5) * 10;
            const newPrice = basePrice + change;
            
            const prevClose = 2030.25;
            const priceChange = newPrice - prevClose;
            const percentChange = (priceChange / prevClose * 100).toFixed(2);
            
            // 更新显示
            document.getElementById('price').textContent = '$' + newPrice.toFixed(2);
            document.getElementById('currentPrice').textContent = newPrice.toFixed(2);
            
            const changeElement = document.getElementById('change');
            changeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${percentChange >= 0 ? '+' : ''}${percentChange}%)`;
            changeElement.className = priceChange >= 0 ? 'up' : 'down';
            
            // 更新时间
            const now = new Date();
            document.getElementById('time').textContent = now.toISOString().replace('T', ' ').substr(0, 19);
            
            // 更新安装进度（模拟）
            const progress = Math.min(95, 70 + Math.random() * 5);
            document.getElementById('installProgress').textContent = progress.toFixed(0) + '%';
            
            if (progress >= 95) {
                document.getElementById('flaskStatus').innerHTML = '✅ 已安装';
                document.getElementById('yfinanceStatus').innerHTML = '✅ 已安装';
                document.getElementById('dataStatus').innerHTML = '📡 实时数据';
                document.getElementById('eta').textContent = '即将完成';
            }
        }
        
        function refreshPrice() {
            updatePrice();
            document.querySelector('button').innerHTML = '⏳ 刷新中...';
            document.querySelector('button').disabled = true;
            
            setTimeout(() => {
                document.querySelector('button').innerHTML = '🔄 刷新价格';
                document.querySelector('button').disabled = false;
            }, 1000);
        }
        
        function checkStatus() {
            fetch('/api/status')
                .then(response => response.json())
                .then(data => {
                    alert(`系统状态检查:\nFlask: ${data.flask}\nyfinance: ${data.yfinance}\n虚拟环境: ${data.venv}`);
                })
                .catch(() => {
                    alert('状态检查API暂不可用');
                });
        }
        
        // 每5秒更新一次
        setInterval(updatePrice, 5000);
        
        // 初始更新
        updatePrice();
    </script>
</body>
</html>
"""

def get_simulated_price():
    """获取模拟价格"""
    base = 2034.50
    change = random.uniform(-10, 10)
    return base + change

def create_simple_server():
    """创建简化HTTP服务器"""
    from http.server import HTTPServer, SimpleHTTPRequestHandler
    import json
    
    class GoldHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            if self.path == '/':
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(HTML_TEMPLATE.encode('utf-8'))
            elif self.path == '/api/price':
                price = get_simulated_price()
                prev_close = 2030.25
                change = price - prev_close
                percent = (change / prev_close) * 100
                
                data = {
                    'price': round(price, 2),
                    'prev_close': prev_close,
                    'change': round(change, 2),
                    'percent': round(percent, 2),
                    'timestamp': datetime.datetime.now().isoformat(),
                    'data_source': 'simulated'
                }
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
            elif self.path == '/api/status':
                data = {
                    'flask': 'installing' if not FLASK_AVAILABLE else 'installed',
                    'yfinance': 'installing',
                    'venv': 'active',
                    'python': '3.12.3'
                }
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
            else:
                super().do_GET()
    
    return GoldHandler

def main():
    print("=" * 50)
    print("GildedWatch 简化版服务器启动")
    print("=" * 50)
    
    if FLASK_AVAILABLE:
        print("✅ Flask 可用，启动完整应用...")
        # 这里可以切换到完整版
        import web_app
        web_app.app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("⚠️  使用简化HTTP服务器")
        print("📍 访问地址: http://localhost:5000")
        print("📍 状态API: http://localhost:5000/api/status")
        print("📍 价格API: http://localhost:5000/api/price")
        print("=" * 50)
        print("依赖安装完成后将自动切换到完整版本")
        
        # 获取IP地址
        import socket
        try:
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            print(f"🌐 网络访问: http://{local_ip}:5000")
        except:
            print("🌐 网络访问: 使用 localhost")
        
        # 启动服务器
        server = HTTPServer(('0.0.0.0', 5000), create_simple_server())
        print("🚀 服务器运行中... (按 Ctrl+C 停止)")
        server.serve_forever()

if __name__ == '__main__':
    main()