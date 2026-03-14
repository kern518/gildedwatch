# 🏠 GildedWatch 本地部署指南

## 📋 部署选项概览

| 部署方式 | 难度 | 适合场景 | 特点 |
|----------|------|----------|------|
| **直接运行** | ⭐☆☆☆☆ | 快速测试 | 最简单，无需额外配置 |
| **Docker** | ⭐⭐☆☆☆ | 开发/测试 | 环境隔离，一致性 |
| **系统服务** | ⭐⭐⭐☆☆ | 生产环境 | 开机自启，服务管理 |
| **自动化CI/CD** | ⭐⭐⭐⭐☆ | 团队协作 | 自动测试和部署 |

## 🚀 方式1：直接运行（最简单）

### 步骤：
```bash
# 1. 获取代码
git clone https://github.com/kern518/gildedwatch.git
cd gildedwatch

# 2. 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 3. 安装依赖
pip install -r requirements.txt

# 4. 运行应用
python web_app.py

# 5. 访问应用
# 打开浏览器访问: http://localhost:5000
```

### 验证部署：
```bash
# 检查服务是否运行
curl http://localhost:5000/api/health
# 应该返回: {"status": "healthy", "service": "GildedWatch"}

# 获取黄金价格
curl http://localhost:5000/api/price
# 返回JSON格式的价格数据
```

## 🐳 方式2：Docker 部署

### 前提条件：
- 安装 Docker: https://docs.docker.com/get-docker/
- 安装 Docker Compose: https://docs.docker.com/compose/install/

### 步骤：
```bash
# 1. 使用预构建镜像（如果有）
docker pull yourusername/gildedwatch:latest

# 2. 或从源码构建
docker build -t gildedwatch .

# 3. 运行单个容器
docker run -d \
  -p 5000:5000 \
  --name gildedwatch \
  --restart unless-stopped \
  gildedwatch

# 4. 或使用docker-compose（推荐）
docker-compose up -d

# 5. 查看容器状态
docker ps
docker logs gildedwatch -f
```

### Docker Compose 配置说明：
```yaml
# docker-compose.yml 主要内容：
services:
  gildedwatch:
    build: .  # 从当前目录构建
    ports:
      - "5000:5000"  # 主机端口:容器端口
    restart: unless-stopped  # 自动重启
    environment:
      - FLASK_ENV=production
    healthcheck:  # 健康检查
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
```

## ⚙️ 方式3：系统服务部署（Linux）

### 使用提供的部署脚本：
```bash
# 1. 下载代码
git clone https://github.com/kern518/gildedwatch.git
cd gildedwatch

# 2. 运行部署脚本（需要sudo权限）
chmod +x deploy.sh
sudo ./deploy.sh

# 3. 脚本会自动：
#    - 安装系统依赖
#    - 创建虚拟环境
#    - 安装Python依赖
#    - 创建systemd服务
#    - 配置Nginx（如果安装）
#    - 启动服务
```

### 手动配置系统服务：
```bash
# 1. 创建服务文件
sudo tee /etc/systemd/system/gildedwatch.service << EOF
[Unit]
Description=GildedWatch Gold Price Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/gildedwatch
Environment="PATH=/opt/gildedwatch/venv/bin"
ExecStart=/opt/gildedwatch/venv/bin/python web_app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 2. 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable gildedwatch
sudo systemctl start gildedwatch

# 3. 查看状态
sudo systemctl status gildedwatch
sudo journalctl -u gildedwatch -f
```

## 🔧 方式4：配置自动化部署到你的服务器

### 步骤1：准备服务器
```bash
# 在目标服务器上执行：
# 1. 安装基础软件
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nginx

# 2. 创建应用目录
sudo mkdir -p /opt/gildedwatch
sudo chown -R $USER:$USER /opt/gildedwatch

# 3. 生成SSH密钥（用于GitHub访问）
ssh-keygen -t rsa -b 4096 -C "deploy@gildedwatch"
cat ~/.ssh/id_rsa.pub
# 将公钥添加到GitHub仓库的Deploy Keys
```

### 步骤2：配置 GitHub Secrets
在仓库页面：Settings → Secrets and variables → Actions

添加以下Secrets：
1. **DEPLOY_KEY** - 服务器的SSH私钥（`~/.ssh/id_rsa`的内容）
2. **SERVER_HOST** - 服务器IP地址，如 `123.45.67.89`
3. **SERVER_USER** - 服务器用户名，如 `ubuntu` 或 `root`

### 步骤3：修改部署脚本
编辑 `.github/workflows/ci.yml`，取消注释部署部分：
```yaml
- name: Deploy to Server
  env:
    DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
    SERVER_HOST: ${{ secrets.SERVER_HOST }}
    SERVER_USER: ${{ secrets.SERVER_USER }}
  run: |
    mkdir -p ~/.ssh
    echo "$DEPLOY_KEY" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    
    # 实际的部署命令
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_HOST "
      cd /opt/gildedwatch
      git pull origin main
      source venv/bin/activate
      pip install -r requirements.txt
      sudo systemctl restart gildedwatch
    "
```

## 🎯 部署验证清单

### 基础验证：
```bash
# 1. 服务是否运行？
curl -f http://localhost:5000/api/health

# 2. 能否获取价格？
curl http://localhost:5000/api/price | jq .

# 3. Web界面是否可访问？
# 浏览器打开: http://localhost:5000

# 4. 日志是否正常？
# Docker: docker logs gildedwatch
# 系统服务: journalctl -u gildedwatch -n 20
```

### 高级验证：
```bash
# 1. 压力测试（简单）
for i in {1..10}; do
  curl -s http://localhost:5000/api/health > /dev/null && echo "请求 $i: OK"
done

# 2. 检查资源使用
# Docker: docker stats gildedwatch
# 系统: top -p $(pgrep -f "python web_app")

# 3. 检查端口监听
netstat -tlnp | grep :5000
```

## ⚠️ 常见问题解决

### 问题1：端口5000被占用
```bash
# 查看占用进程
sudo lsof -i :5000

# 停止占用进程或修改端口
# 修改 web_app.py 中的端口：
# app.run(host='0.0.0.0', port=5000) → port=5001
```

### 问题2：依赖安装失败
```bash
# 使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 或使用阿里云镜像
pip install -i https://mirrors.aliyun.com/pypi/simple -r requirements.txt
```

### 问题3：权限问题
```bash
# 如果是权限错误
sudo chmod -R 755 /opt/gildedwatch
sudo chown -R www-data:www-data /opt/gildedwatch
```

### 问题4：服务无法启动
```bash
# 查看详细错误
sudo systemctl status gildedwatch --no-pager
sudo journalctl -u gildedwatch -n 50 --no-pager

# 测试手动运行
cd /opt/gildedwatch
source venv/bin/activate
python web_app.py
```

## 📊 监控和维护

### 日常监控：
```bash
# 1. 查看服务状态
systemctl status gildedwatch

# 2. 查看实时日志
journalctl -u gildedwatch -f

# 3. 检查资源使用
htop  # 或 top

# 4. 检查网络连接
netstat -tlnp | grep gildedwatch
```

### 日志管理：
```bash
# 配置日志轮转
sudo tee /etc/logrotate.d/gildedwatch << EOF
/var/log/gildedwatch/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 www-data adm
    sharedscripts
    postrotate
        systemctl reload gildedwatch > /dev/null 2>/dev/null || true
    endscript
}
EOF
```

## 🎯 推荐部署方案

### 开发环境：
- **方式1：直接运行** - 最快速，便于调试

### 测试环境：
- **方式2：Docker** - 环境一致，易于重置

### 生产环境：
- **方式3：系统服务 + Nginx** - 稳定可靠，性能好
- 或 **方式4：自动化CI/CD** - 团队协作，持续交付

### 个人使用：
- **方式2：Docker Compose** - 简单易管理，包含监控

---

**建议从方式1（直接运行）开始**，熟悉后再选择适合的部署方式。每种方式都提供了完整的配置和验证步骤。