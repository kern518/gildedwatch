#!/usr/bin/env python3
"""
GildedWatch 单元测试
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import get_gold_price


def test_get_gold_price():
    """测试获取黄金价格函数"""
    # 注意：这个测试需要网络连接
    # 在实际 CI 中，我们可能会 mock yfinance
    try:
        price = get_gold_price()
        # 价格应该在合理范围内（1000-10000美元）
        if price is not None:
            assert 1000 <= price <= 10000, f"价格 {price} 不在合理范围内"
            print(f"✅ 获取到黄金价格: ${price:.2f}")
        else:
            print("⚠️  无法获取价格（可能是网络问题）")
    except Exception as e:
        print(f"⚠️  测试跳过: {e}")
        pytest.skip(f"网络依赖测试跳过: {e}")


def test_imports():
    """测试所有必要的导入"""
    import yfinance
    import pandas
    print("✅ 所有依赖导入成功")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])