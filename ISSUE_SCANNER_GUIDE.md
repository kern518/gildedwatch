# 🕵️ Issue 扫描器使用指南

## 📋 已配置的工作流

我为你配置了三个 Issue 扫描工作流：

### 1. **Issue Monitor & Reporter** (`issue-monitor.yml`)
- **功能:** 完整的每日报告系统
- **触发:** 每天上午10点 (UTC) 自动运行
- **输出:** 自动创建 Issue 报告
- **标签:** `automated-report`, `issues`, `monitoring`

### 2. **Simple Issue Scanner** (`simple-issue-scanner.yml`)
- **功能:** 基础扫描和警报
- **触发:** 每天上午9点 (UTC) 自动运行
- **输出:** Artifact 报告，必要时创建警报 Issue
- **标签:** `alert`, `scan-report`, `automated`

### 3. **Issue Scanner & Reporter** (`issue-scanner.yml`)
- **功能:** 详细扫描和分析
- **触发:** 每小时运行一次
- **输出:** 详细的 Markdown 报告
- **特点:** 支持手动触发和自定义参数

## 🚀 立即使用

### 自动运行：
- **每日报告:** 每天上午10点自动创建 Issue 报告
- **基础扫描:** 每天上午9点自动运行
- **详细扫描:** 每小时运行一次

### 手动触发：
1. 访问 https://github.com/kern518/gildedwatch/actions
2. 选择相应的工作流
3. 点击 "Run workflow"
4. 选择参数（如果需要）

## 📊 报告内容

### 每日报告包含：
1. **总体统计**
   - 总 Issues 数、Open/Closed 数量
   - 解决率、今日/本周新增
   - 今日更新数量

2. **需要关注的问题**
   - 紧急问题（urgent/critical/bug 标签）
   - 陈旧问题（7天/30天无更新）
   - 无标签问题

3. **标签分布**
   - 最常用的10个标签
   - 各类别统计（Bug、功能请求等）

4. **最近活动**
   - 最近7天更新的 Issues

5. **建议**
   - 基于分析结果的 actionable 建议

## 🔧 配置说明

### 定时任务配置：
```yaml
# 在 issue-monitor.yml 中
schedule:
  - cron: '0 10 * * *'  # 每天上午10点 (UTC)
  
# 在 simple-issue-scanner.yml 中  
schedule:
  - cron: '0 9 * * *'    # 每天上午9点 (UTC)
  
# 在 issue-scanner.yml 中
schedule:
  - cron: '0 * * * *'    # 每小时运行
```

### 权限配置：
```yaml
permissions:
  issues: write  # 需要写权限来创建Issue
  contents: read # 需要读权限来访问仓库
```

## 🎯 使用场景

### 场景1：每日站会
- **使用:** `Issue Monitor & Reporter`
- **时间:** 每天上午10点
- **输出:** 创建包含统计数据的 Issue
- **用途:** 团队站会时讨论 Issue 状态

### 场景2：问题警报
- **使用:** `Simple Issue Scanner`
- **触发:** 发现紧急或陈旧问题时
- **输出:** 创建警报 Issue
- **用途:** 及时通知需要处理的问题

### 场景3：详细分析
- **使用:** `Issue Scanner & Reporter`
- **触发:** 手动或每小时自动
- **输出:** 详细的 Markdown 报告
- **用途:** 深度分析 Issue 趋势

## ⚙️ 自定义配置

### 修改扫描频率：
编辑 `.github/workflows/issue-monitor.yml`：
```yaml
schedule:
  # 改为每周一上午9点
  - cron: '0 9 * * 1'
```

### 修改报告内容：
编辑分析脚本部分，添加或修改：
- 关注的标签类型
- 陈旧时间的定义
- 统计指标的计算

### 添加通知：
在 workflow 中添加通知步骤：
```yaml
- name: Send Slack Notification
  if: always()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    # 发送到Slack的代码
```

## 📈 预期效果

### 短期效果（1周内）：
1. ✅ 每天自动生成 Issue 报告
2. ✅ 及时发现陈旧和紧急问题
3. ✅ 清晰的 Issue 统计视图

### 中期效果（1月内）：
1. 📊 建立 Issue 管理习惯
2. 🔄 提高 Issue 处理效率
3. 🏷️ 规范的标签使用

### 长期效果（3月内）：
1. 📈 可量化的 Issue 管理指标
2. 🔍 问题趋势分析和预测
3. 🤖 自动化 Issue 分类和处理

## 🔍 监控和调试

### 查看运行状态：
```bash
# 查看最近的工作流运行
# 访问: https://github.com/kern518/gildedwatch/actions

# 查看生成的报告
# 在 Actions 页面点击运行 → Artifacts
```

### 调试问题：
1. **工作流不运行**
   - 检查 `.github/workflows/` 文件权限
   - 确认仓库已启用 Actions
   - 检查 cron 语法

2. **报告不生成**
   - 检查 GitHub Token 权限
   - 查看工作流运行日志
   - 确认有 Issues 可分析

3. **数据不准确**
   - 检查 API 调用限制
   - 确认过滤逻辑正确
   - 验证时间计算

## 🎨 报告示例

### 每日报告 Issue 示例：
```
📊 Issue日报 2026-03-14

📈 总体统计
- 总Issues数: 15
- Open Issues: 8
- Closed Issues: 7
- 解决率: 46.7%
- 今日新增: 2
- 本周新增: 5
- 今日更新: 3

⚠️ 需要关注的问题
🔴 紧急问题 (2个)
- #12 修复安全漏洞
- #15 生产环境bug

🕰️ 非常陈旧 (>30天无更新, 1个)
- #3 文档更新

🏷️ 标签分布
- `bug`: 5
- `enhancement`: 3
- `question`: 2

🔄 最近7天活动
- 🟢 #14 添加新功能
- 🔴 #13 修复问题

💡 建议
1. 立即处理2个紧急问题
2. 审查1个非常陈旧的问题
```

## 🚀 快速开始

### 第一步：等待首次运行
- 工作流会在配置的时间自动运行
- 或手动触发测试

### 第二步：查看报告
1. 访问 Issues 页面
2. 查找标签为 `automated-report` 的 Issue
3. 查看详细报告

### 第三步：优化配置
根据团队需求调整：
- 扫描频率
- 关注的问题类型
- 报告格式

## 📞 支持

### 常见问题：
1. **Q: 工作流没有运行？**
   A: 检查仓库 Settings → Actions 权限

2. **Q: 报告没有创建？**
   A: 检查 GitHub Token 是否有 issues:write 权限

3. **Q: 数据不准确？**
   A: 检查 API 分页和过滤逻辑

### 获取帮助：
1. 查看工作流运行日志
2. 检查 GitHub Actions 文档
3. 查看本指南的故障排除部分

---

**🎉 Issue 扫描器已配置完成！**

现在你的仓库将：
1. 每天自动生成 Issue 报告
2. 及时发现需要关注的问题
3. 提供数据驱动的 Issue 管理建议

享受自动化的 Issue 管理体验！ 🚀