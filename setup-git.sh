#!/bin/bash
# GildedWatch Git 仓库初始化脚本

echo "🚀 初始化 GildedWatch Git 仓库..."

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
  echo "📦 初始化 Git 仓库..."
  git init
fi

# 添加所有文件
echo "📁 添加文件到 Git..."
git add .

# 检查是否有更改
if git diff --cached --quiet; then
  echo "✅ 没有需要提交的更改"
  exit 0
fi

# 提交更改
echo "💾 提交更改..."
git commit -m "feat: 初始化 GildedWatch 项目

- 添加核心功能：黄金价格获取
- 添加 Web 界面
- 配置完整的 CI/CD 流水线
- 添加自动化测试和代码质量扫描
- 配置 Docker 容器化
- 添加监控和部署脚本"

# 显示 Git 状态
echo ""
echo "📊 Git 状态："
git status

echo ""
echo "✅ 初始化完成！"
echo ""
echo "📋 下一步："
echo "1. 在 GitHub 创建新仓库：https://github.com/new"
echo "2. 添加远程仓库：git remote add origin https://github.com/yourusername/gildedwatch.git"
echo "3. 推送代码：git push -u origin main"
echo "4. 配置 GitHub Secrets："
echo "   - SONAR_TOKEN (从 SonarCloud 获取)"
echo "   - DEPLOY_KEY (SSH 部署密钥)"
echo "   - SERVER_HOST, SERVER_USER (部署服务器信息)"
echo ""
echo "🎉 完成以上步骤后，CI/CD 流水线将自动运行！"