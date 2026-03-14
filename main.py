#!/usr/bin/env python3
"""
GildedWatch - 获取现货黄金价格
使用 yfinance 库获取黄金现货价格（代码：GC=F）
"""

import yfinance as yf


def get_gold_price():
    """获取现货黄金最新价格"""
    try:
        # 黄金现货代码：GC=F
        gold = yf.Ticker("GC=F")
        
        # 获取最新数据
        data = gold.history(period="1d", interval="1m")
        
        if data.empty:
            print("无法获取黄金价格数据")
            return None
        
        # 获取最新价格
        latest_price = data['Close'].iloc[-1]
        return latest_price
        
    except Exception as e:
        print(f"获取价格时出错: {e}")
        return None


def main():
    """主函数"""
    print("正在获取现货黄金价格 (GC=F)...")
    
    price = get_gold_price()
    
    if price is not None:
        print(f"现货黄金价格: ${price:.2f} 美元/盎司")
    else:
        print("获取价格失败")


if __name__ == "__main__":
    main()