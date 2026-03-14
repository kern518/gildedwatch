#!/usr/bin/env python3
"""
GildedWatch 测试版本 - 在没有 yfinance 的情况下模拟运行
"""

import datetime
import sys


def get_gold_price():
    """
    模拟获取黄金价格（在没有网络或库的情况下）
    """
    # 模拟黄金价格
    simulated_price = 2034.50
    
    # 模拟一些随机波动
    import random
    variation = random.uniform(-10, 10)
    simulated_price += variation
    
    return simulated_price, None


def format_price(price):
    """格式化价格显示"""
    return f"${price:,.2f}"


def main():
    """主函数"""
    print("=" * 50)
    print("GildedWatch - 现货黄金价格监控 (测试版)")
    print("=" * 50)
    
    print(f"📅 当前时间: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("📊 正在获取现货黄金价格 (GC=F)...")
    
    # 模拟网络延迟
    import time
    time.sleep(1)
    
    price, error = get_gold_price()
    
    if error:
        print(f"❌ 错误: {error}")
        return 1
    
    print(f"✅ 获取成功!")
    print(f"💰 现货黄金价格: {format_price(price)} 美元/盎司")
    print("=" * 50)
    
    # 模拟市场信息
    print("\n📈 市场信息:")
    prev_close = 2030.25
    change = price - prev_close
    change_pct = (change / prev_close) * 100
    
    print(f"   前收盘价: ${prev_close:,.2f}")
    print(f"   涨跌额: ${change:+,.2f}")
    print(f"   涨跌幅: {change_pct:+.2f}%")
    
    if change > 0:
        print("   📈 今日上涨")
    elif change < 0:
        print("   📉 今日下跌")
    else:
        print("   ➖ 价格持平")
    
    print("\n✨ GildedWatch 监控完成")
    print("💡 注意: 这是测试版本，使用模拟数据")
    print("💡 安装 yfinance 后可以获取实时数据")
    return 0


if __name__ == "__main__":
    sys.exit(main())