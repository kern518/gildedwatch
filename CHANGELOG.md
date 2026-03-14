# Changelog

所有对 GildedWatch 项目的显著更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-03-14

### 新增
- 初始版本发布
- 命令行黄金价格获取功能
- Web 界面展示
- 完整的 CI/CD 流水线
  - GitHub Actions 自动化测试
  - SonarCloud 代码质量扫描
  - CodeQL 安全扫描
  - 自动 Issue 创建和修复
  - 自动化部署
- Docker 容器化支持
- 监控和告警配置
- 完整的项目文档

### 技术栈
- Python 3.12
- Flask Web 框架
- yfinance 数据获取
- GitHub Actions CI/CD
- Docker 容器化
- Prometheus + Grafana 监控