#!/usr/bin/env python3
"""
简单的测试服务器
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return '''
    <!DOCTYPE html>
    <html>
    <head><title>GildedWatch Test</title></head>
    <body>
        <h1>✅ GildedWatch 测试页面</h1>
        <p>服务器运行正常！</p>
        <p>访问地址: http://192.168.0.203:5000</p>
        <p><a href="/api/health">健康检查</a></p>
        <p><a href="/api/price">价格API</a></p>
    </body>
    </html>
    '''

@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'GildedWatch',
        'version': '1.0.0'
    })

@app.route('/api/price')
def price():
    return jsonify({
        'price': 2034.50,
        'symbol': 'GC=F',
        'currency': 'USD'
    })

if __name__ == '__main__':
    print("🚀 启动测试服务器...")
    print("📍 访问地址: http://192.168.0.203:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)