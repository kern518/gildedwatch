# GitHub 仓库设置指南

## ✅ 仓库创建成功！

**仓库地址:** https://github.com/kern518/gildedwatch

## 📦 已推送的内容

### 核心代码
- ✅ `main.py` - 命令行黄金价格获取
- ✅ `web_app.py` - Web 应用版本
- ✅ `requirements.txt` - 依赖文件

### CI/CD 配置（需要 workflow 权限）
- ⚠️ `.github/workflows/ci.yml` - 主流水线
- ⚠️ `.github/workflows/auto-fix.yml` - 自动修复

### 项目文档
- ✅ `README.md` - 项目说明
- ✅ `LICENSE` - MIT 许可证
- ✅ `CHANGELOG.md` - 更新日志

### 部署配置
- ✅ `Dockerfile` - 容器化配置
- ✅ `docker-compose.yml` - Docker Compose
- ✅ `deploy.sh` - 一键部署脚本

## 🔧 下一步操作

### 1. 更新 GitHub Token 权限
当前 token 缺少 `workflow` 权限，需要：

1. 访问 https://github.com/settings/tokens
2. 编辑现有 token 或创建新 token
3. 勾选 `workflow` 权限
4. 更新本地认证

### 2. 推送 CI/CD 工作流
更新 token 后运行：
```bash
git push origin main
```

### 3. 配置 GitHub Secrets
在仓库 Settings → Secrets and variables → Actions 中添加：

1. **SONAR_TOKEN** - SonarCloud 分析 token
2. **DEPLOY_KEY** - 服务器部署 SSH 密钥（可选）
3. **SERVER_HOST** - 部署服务器地址（可选）
4. **SERVER_USER** - 部署服务器用户（可选）

### 4. 启用 GitHub Actions
推送 workflow 文件后，Actions 将自动启用。

## 🚀 快速开始

### 访问仓库
```bash
git clone https://github.com/kern518/gildedwatch.git
cd gildedwatch
```

### 本地运行
```bash
# 安装依赖
pip install -r requirements.txt

# 命令行版本
python main.py

# Web 版本
python web_app.py
# 访问 http://localhost:5000
```

### Docker 运行
```bash
docker-compose up -d
# 访问 http://localhost:5000
```

## 📊 监控和访问

- **Web 界面:** http://localhost:5000
- **健康检查:** http://localhost:5000/api/health
- **价格 API:** http://localhost:5000/api/price
- **API 文档:** http://localhost:5000/api/docs

## 🔍 验证推送

已成功推送的文件：
```bash
git log --oneline -3
# 输出：
# 18537df feat: 添加CI/CD工作流配置
# 88fa46b feat: 初始提交（不含workflow）
```

## ⚠️ 注意事项

1. **Token 安全:** 建议定期更新 token
2. **权限:** 确保 token 有 `repo` 和 `workflow` 权限
3. **CI/CD:** workflow 文件需要相应权限才能推送
4. **监控:** 仓库设置中启用 Issues 和 Projects

## 📞 支持

如有问题，请：
1. 检查 GitHub Actions 权限
2. 验证 token 权限范围
3. 查看仓库 Settings → Actions 配置

---

**仓库已成功创建并初始化！** 🎉

接下来请更新 token 权限以启用完整的 CI/CD 功能。