#!/usr/bin/env python3
"""
测试 Flask 是否能在虚拟环境中运行
"""

import sys
import subprocess

def test_flask():
    """测试 Flask 安装"""
    print("🧪 测试 Flask 环境...")
    
    # 测试 Python 版本
    result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
    print(f"Python 版本: {result.stdout.strip()}")
    
    # 测试导入 Flask
    test_code = """
try:
    import flask
    print("✅ Flask 导入成功")
    print(f"Flask 版本: {flask.__version__}")
except ImportError as e:
    print(f"❌ Flask 导入失败: {e}")
    sys.exit(1)
"""
    
    result = subprocess.run([sys.executable, '-c', test_code], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"错误: {result.stderr}")
    
    return result.returncode == 0

def test_yfinance():
    """测试 yfinance 安装"""
    print("\n🧪 测试 yfinance 环境...")
    
    test_code = """
try:
    import yfinance as yf
    print("✅ yfinance 导入成功")
    
    # 测试获取黄金数据
    print("测试获取黄金价格...")
    gold = yf.Ticker("GC=F")
    data = gold.history(period="1d", interval="1m")
    
    if not data.empty:
        latest_price = data['Close'].iloc[-1]
        print(f"✅ 获取成功! 最新价格: ${latest_price:.2f}")
    else:
        print("⚠️  数据为空，可能是网络问题")
        
except ImportError as e:
    print(f"❌ yfinance 导入失败: {e}")
    sys.exit(1)
except Exception as e:
    print(f"⚠️  获取数据时出错: {e}")
    print("这可能是网络连接问题，但库已安装成功")
"""
    
    result = subprocess.run([sys.executable, '-c', test_code], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"错误: {result.stderr}")
    
    return "yfinance 导入成功" in result.stdout

if __name__ == "__main__":
    print("=" * 50)
    print("GildedWatch 环境测试")
    print("=" * 50)
    
    flask_ok = test_flask()
    yfinance_ok = test_yfinance()
    
    print("\n" + "=" * 50)
    print("测试结果:")
    print(f"Flask: {'✅ 通过' if flask_ok else '❌ 失败'}")
    print(f"yfinance: {'✅ 通过' if yfinance_ok else '❌ 失败'}")
    
    if flask_ok and yfinance_ok:
        print("\n🎉 所有测试通过! 可以启动完整 Web 应用")
        print("运行: python3 web_app.py")
    else:
        print("\n⚠️  部分测试失败，需要检查依赖安装")
    
    print("=" * 50)