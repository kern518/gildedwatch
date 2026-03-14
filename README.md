# GildedWatch - 黄金价格监控系统

![Python](https://img.shields.io/badge/python-3.12-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![CI/CD](https://github.com/yourusername/gildedwatch/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/yourusername/gildedwatch/actions/workflows/codeql.yml/badge.svg)

一个简单的现货黄金价格监控工具，使用 yfinance 库获取黄金现货价格。

## 功能特性

- 📊 获取现货黄金（代码：GC=F）的最新价格
- 🌐 Web 界面展示（可选）
- 🔍 代码质量自动扫描
- 🐛 自动 Issue 跟踪和修复
- 🚀 自动化部署

## 快速开始

### 安装

```bash
git clone https://github.com/yourusername/gildedwatch.git
cd gildedwatch
pip install -r requirements.txt
```

### 使用

#### 命令行版本
```bash
python main.py
```

#### Web 版本
```bash
python web_app.py
# 访问 http://localhost:5000
```

## 项目结构

```
gildedwatch/
├── main.py              # 命令行版本
├── web_app.py           # Web 应用版本
├── requirements.txt     # 项目依赖
├── tests/               # 测试文件
├── .github/workflows/   # GitHub Actions 工作流
├── sonar-project.properties # SonarCloud 配置
└── README.md           # 项目文档
```

## CI/CD 流水线

本项目配置了完整的自动化流水线：

### 1. 代码质量扫描
- **SonarCloud**: 静态代码分析
- **CodeQL**: 安全漏洞扫描
- **Pylint**: Python 代码规范检查

### 2. 自动化测试
- **Pytest**: 单元测试
- **Coverage**: 代码覆盖率报告

### 3. Issue 自动化
- 自动扫描代码问题并创建 Issue
- Issue 分类和优先级标记
- 自动修复建议

### 4. 自动部署
- 测试通过后自动部署到服务器
- 版本标签管理
- 回滚机制

## 开发指南

### 运行测试
```bash
pytest tests/ --cov=.
```

### 代码规范检查
```bash
pylint main.py web_app.py
```

### 安全扫描
```bash
bandit -r .
```

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 支持

- 报告问题: [GitHub Issues](https://github.com/yourusername/gildedwatch/issues)
- 讨论: [GitHub Discussions](https://github.com/yourusername/gildedwatch/discussions)