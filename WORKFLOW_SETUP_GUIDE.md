# GitHub Workflow 设置指南

## 📋 当前状态

✅ **仓库创建成功:** https://github.com/kern518/gildedwatch  
✅ **核心代码已推送:** 所有项目文件（除 workflow）  
⚠️ **CI/CD 待配置:** workflow 文件需要额外权限

## 🔧 问题原因

GitHub 要求 Personal Access Token 必须具有 `workflow` 权限才能创建或更新 workflow 文件。当前 token 只有 `repo` 权限。

## 🚀 解决方案（三选一）

### 方案一：更新现有 Token 权限（推荐）

1. **访问 Token 设置**
   - 打开 https://github.com/settings/tokens
   - 找到 token "GildedWatch Auto-Create"

2. **编辑 Token 权限**
   - 点击 token 名称进入编辑页面
   - 在 "Select scopes" 部分，勾选：
     - ✅ `repo` (已选中)
     - ✅ `workflow` (新增)
   - 点击 "Update token"

3. **更新本地认证**
   ```bash
   # 获取新 token（如果重新生成）
   # 更新远程 URL
   git remote set-url origin https://kern518:新token@github.com/kern518/gildedwatch.git
   
   # 推送 workflow 文件
   git add .github/
   git commit -m "feat: 添加CI/CD工作流"
   git push origin main
   ```

### 方案二：创建新 Token

1. **生成新 Token**
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 设置：
     - **Note:** `GildedWatch CI/CD`
     - **Expiration:** 90天
     - **Select scopes:** 勾选 `repo` 和 `workflow`
   - 生成并复制 token

2. **使用新 Token**
   ```bash
   # 更新远程 URL
   git remote set-url origin https://kern518:新token@github.com/kern518/gildedwatch.git
   
   # 推送所有文件
   git push origin main --force
   ```

### 方案三：手动上传 Workflow 文件

如果不想更新 token，可以在 GitHub 网页上手动创建：

1. **访问仓库 Actions 页面**
   - 打开 https://github.com/kern518/gildedwatch/actions

2. **手动创建 workflow**
   - 点击 "set up a workflow yourself"
   - 复制以下内容到编辑器：

   **文件 1:** `.github/workflows/ci.yml`
   ```yaml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v4
       - name: Set up Python
         uses: actions/setup-python@v5
         with:
           python-version: '3.12'
       - name: Install dependencies
         run: |
           pip install -r requirements.txt
           pip install pytest
       - name: Run tests
         run: pytest tests/ --cov=.
   ```

   **文件 2:** `.github/workflows/auto-fix.yml`
   ```yaml
   name: Auto Fix Issues
   
   on:
     issues:
       types: [opened]
   
   jobs:
     analyze:
       runs-on: ubuntu-latest
       steps:
       - name: Analyze Issue
         run: |
           echo "Issue #${{ github.event.issue.number }} opened: ${{ github.event.issue.title }}"
   ```

3. **提交 workflow 文件**
   - 点击 "Start commit"
   - 提交到 `main` 分支

## 📁 Workflow 文件内容

我已经为你准备好了完整的 workflow 文件。你可以在本地查看：

```bash
# 查看 CI/CD 配置
cat .github/workflows/ci.yml | head -50

# 查看自动修复配置
cat .github/workflows/auto-fix.yml | head -30
```

## ⚙️ 完整 CI/CD 功能

### 已配置的功能：
1. **自动化测试** - Python 3.10-3.12 多版本测试
2. **代码质量扫描** - Pylint, Bandit, Safety
3. **安全扫描** - CodeQL, 依赖安全检查
4. **自动修复** - Issue 自动分析和修复 PR
5. **自动化部署** - Docker 容器化部署
6. **监控告警** - 健康检查和状态报告

### 需要配置的 Secrets：
1. **SONAR_TOKEN** - SonarCloud 分析
2. **DEPLOY_KEY** - 服务器部署 SSH 密钥
3. **SERVER_HOST** - 部署服务器地址
4. **SERVER_USER** - 部署服务器用户

## 🔍 验证设置

### 检查当前仓库状态：
```bash
# 查看远程仓库
git remote -v

# 查看提交历史
git log --oneline -5

# 查看文件状态
git status
```

### 验证 GitHub 仓库：
1. 访问 https://github.com/kern518/gildedwatch
2. 确认所有文件已存在
3. 检查 Actions 标签页是否可用

## 🛠️ 快速命令参考

```bash
# 1. 更新 token 权限后推送
git add .github/
git commit -m "feat: 添加完整的CI/CD工作流"
git push origin main

# 2. 如果遇到权限错误，强制推送
git push origin main --force

# 3. 验证推送成功
curl -s https://api.github.com/repos/kern518/gildedwatch/contents | jq '.[].name'
```

## 📞 故障排除

### 常见问题：
1. **权限错误** - 确保 token 有 `workflow` 权限
2. **推送失败** - 尝试 `git push --force-with-lease`
3. **Actions 不运行** - 检查 workflow 文件语法
4. **Secrets 未生效** - 在仓库 Settings → Secrets 中配置

### 调试命令：
```bash
# 测试 GitHub API 访问
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/kern518/gildedwatch

# 检查 workflow 文件
yamllint .github/workflows/*.yml

# 验证 Git 配置
git config --list | grep -E "(user|remote)"
```

## 🎯 完成标志

成功配置后，你应该看到：
1. ✅ GitHub Actions 页面显示 workflow
2. ✅ 代码推送触发 CI/CD 运行
3. ✅ Issues 页面可以创建问题
4. ✅ 仓库有完整的 CI/CD 徽章

---

**建议使用方案一（更新现有 token 权限）**，这是最简单直接的方法。更新权限后，运行 `git push origin main` 即可完成所有配置。

需要我帮你执行任何具体步骤吗？