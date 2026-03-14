#!/usr/bin/env python3
"""
GildedWatch Web 版本 - 通过浏览器访问黄金价格
"""

from flask import Flask, render_template_string, jsonify
import datetime
import sys
import os

app = Flask(__name__)

# HTML 模板
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GildedWatch - 黄金价格监控</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
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
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 800px;
            width: 100%;
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 20px;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .gold-icon {
            font-size: 1.5em;
        }
        
        .subtitle {
            color: #7f8c8d;
            font-size: 1.1em;
        }
        
        .price-card {
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(253, 160, 133, 0.3);
        }
        
        .price-label {
            color: #fff;
            font-size: 1.2em;
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .price-value {
            color: #fff;
            font-size: 3.5em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            margin: 10px 0;
        }
        
        .price-change {
            font-size: 1.3em;
            font-weight: bold;
            padding: 8px 20px;
            border-radius: 50px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .positive {
            background: rgba(46, 204, 113, 0.2);
            color: #27ae60;
        }
        
        .negative {
            background: rgba(231, 76, 60, 0.2);
            color: #c0392b;
        }
        
        .neutral {
            background: rgba(149, 165, 166, 0.2);
            color: #7f8c8d;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #3498db;
        }
        
        .info-card h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .info-card p {
            color: #34495e;
            font-size: 1.3em;
            font-weight: bold;
        }
        
        .timestamp {
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .controls {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
        }
        
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1em;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        button:hover {
            background: #2980b9;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
        }
        
        .refresh-btn {
            background: #2ecc71;
        }
        
        .refresh-btn:hover {
            background: #27ae60;
            box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }
        
        .api-btn {
            background: #9b59b6;
        }
        
        .api-btn:hover {
            background: #8e44ad;
            box-shadow: 0 5px 15px rgba(155, 89, 182, 0.4);
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #95a5a6;
            font-size: 0.9em;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 20px;
            }
            
            h1 {
                font-size: 2em;
                flex-direction: column;
                gap: 10px;
            }
            
            .price-value {
                font-size: 2.5em;
            }
            
            .controls {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>
                <span class="gold-icon">💰</span>
                GildedWatch
                <span class="gold-icon">📈</span>
            </h1>
            <p class="subtitle">实时现货黄金价格监控系统</p>
        </div>
        
        <div class="price-card">
            <div class="price-label">现货黄金价格 (GC=F)</div>
            <div class="price-value" id="goldPrice">${{ price }}</div>
            <div class="price-change {{ change_class }}" id="priceChange">
                {{ change_amount }} ({{ change_percent }}%)
            </div>
        </div>
        
        <div class="info-grid">
            <div class="info-card">
                <h3>🕒 更新时间</h3>
                <p id="updateTime">{{ timestamp }}</p>
            </div>
            <div class="info-card">
                <h3>📊 交易代码</h3>
                <p>GC=F</p>
            </div>
            <div class="info-card">
                <h3>💵 货币单位</h3>
                <p>美元/盎司</p>
            </div>
            <div class="info-card">
                <h3>📈 前收盘价</h3>
                <p id="prevClose">${{ prev_close }}</p>
            </div>
        </div>
        
        <div class="controls">
            <button class="refresh-btn" onclick="refreshPrice()">
                <span>🔄</span> 刷新价格
            </button>
            <button class="api-btn" onclick="window.location.href='/api/price'">
                <span>🔗</span> API 数据
            </button>
            <button onclick="window.location.href='/'">
                <span>🏠</span> 返回首页
            </button>
        </div>
        
        <div class="timestamp">
            最后更新: <span id="lastUpdate">{{ timestamp }}</span>
            | 数据来源: Yahoo Finance
        </div>
        
        <div class="footer">
            <p>GildedWatch v1.0 | 仅供演示使用 | 不构成投资建议</p>
        </div>
    </div>
    
    <script>
        function refreshPrice() {
            const refreshBtn = document.querySelector('.refresh-btn');
            const originalText = refreshBtn.innerHTML;
            
            // 显示加载状态
            refreshBtn.innerHTML = '<span>⏳</span> 获取中...';
            refreshBtn.disabled = true;
            
            // 获取新价格
            fetch('/api/price')
                .then(response => response.json())
                .then(data => {
                    // 更新价格显示
                    document.getElementById('goldPrice').textContent = '$' + data.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    
                    // 更新涨跌幅
                    const changeElement = document.getElementById('priceChange');
                    const changeAmount = data.change_amount;
                    const changePercent = data.change_percent;
                    
                    changeElement.textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
                    
                    // 更新样式
                    changeElement.className = 'price-change ';
                    if (changeAmount > 0) {
                        changeElement.className += 'positive';
                    } else if (changeAmount < 0) {
                        changeElement.className += 'negative';
                    } else {
                        changeElement.className += 'neutral';
                    }
                    
                    // 更新时间
                    const now = new Date();
                    const timeStr = now.toLocaleString('zh-CN');
                    document.getElementById('updateTime').textContent = timeStr;
                    document.getElementById('lastUpdate').textContent = timeStr;
                    
                    // 恢复按钮
                    setTimeout(() => {
                        refreshBtn.innerHTML = originalText;
                        refreshBtn.disabled = false;
                    }, 1000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('获取价格失败，请稍后重试');
                    refreshBtn.innerHTML = originalText;
                    refreshBtn.disabled = false;
                });
        }
        
        // 自动刷新（每30秒）
        setInterval(refreshPrice, 30000);
        
        // 页面加载时显示当前时间
        document.addEventListener('DOMContentLoaded', function() {
            const now = new Date();
            document.getElementById('updateTime').textContent = now.toLocaleString('zh-CN');
        });
    </script>
</body>
</html>
"""

def get_simulated_gold_price():
    """模拟获取黄金价格"""
    import random
    import time
    
    # 基础价格
    base_price = 2034.50
    
    # 模拟价格波动（±1%）
    variation = random.uniform(-0.01, 0.01)
    current_price = base_price * (1 + variation)
    
    # 前收盘价
    prev_close = 2030.25
    
    # 计算涨跌幅
    change_amount = current_price - prev_close
    change_percent = (change_amount / prev_close) * 100
    
    return {
        'price': round(current_price, 2),
        'prev_close': prev_close,
        'change_amount': round(change_amount, 2),
        'change_percent': round(change_percent, 2)
    }

@app.route('/')
def index():
    """首页 - 显示黄金价格"""
    data = get_simulated_gold_price()
    
    # 确定涨跌幅样式类
    if data['change_amount'] > 0:
        change_class = 'positive'
    elif data['change_amount'] < 0:
        change_class = 'negative'
    else:
        change_class = 'neutral'
    
    # 格式化价格
    formatted_price = f"{data['price']:,.2f}"
    formatted_prev_close = f"{data['prev_close']:,.2f}"
    
    # 格式化涨跌幅
    change_sign = '+' if data['change_amount'] >= 0 else ''
    change_amount_str = f"{change_sign}{data['change_amount']:,.2f}"
    change_percent_str = f"{change_sign}{data['change_percent']:.2f}"
    
    # 当前时间
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template_string(
        HTML_TEMPLATE,
        price=formatted_price,
        prev_close=formatted_prev_close,
        change_amount=change_amount_str,
        change_percent=change_percent_str,
        change_class=change_class,
        timestamp=timestamp
    )

@app.route('/api/price')
def api_price():
    """API 接口 - 返回 JSON 格式的价格数据"""
    data = get_simulated_gold_price()
    data['timestamp'] = datetime.datetime.now().isoformat()
    data['symbol'] = 'GC=F'
    data['currency'] = 'USD'
    data['unit'] = 'per ounce'
    return jsonify(data)

@app.route('/api/health')
def health():
    """健康检查端点"""
    return jsonify({
        'status': 'healthy',
        'service': 'GildedWatch',
        'version': '1.0.0',
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/api/docs')
def api_docs():
    """API 文档"""
    docs = {
        'endpoints': {
            '/': 'Web 界面 - 黄金价格展示',
            '/api/price': 'GET - 获取黄金价格数据 (JSON)',
            '/api/health': 'GET - 健康检查',
            '/api/docs': 'GET - API 文档'
        },
        'example_response': {
            'price': 2034.50,
            'prev_close': 2030.25,
            'change_amount': 4.25,
            'change_percent': 0.21,
            'symbol': 'GC=F',
            'currency': 'USD',
            'timestamp': '2024-01-15T14:30:00Z'
        }
    }
    return jsonify(docs)

if __name__ == '__main__':
    print("=" * 50)
    print("GildedWatch Web 服务器启动")
    print("=" * 50)
    print("📍 本地访问: http://localhost:5000")
    print("📍 健康检查: http://localhost:5000/api/health")
    print("📍 API 文档: http://localhost:5000/api/docs")
    print("📍 价格 API: http://localhost:5000/api/price")
    print("=" * 50)
    
    # 获取主机 IP（用于外部访问）
    import socket
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        print(f"🌐 网络访问: http://{local_ip}:5000")
    except:
        print("🌐 网络访问: 无法获取 IP 地址")
    
    print("\n🚀 服务器启动中...")
    app.run(host='0.0.0.0', port=5000, debug=True)