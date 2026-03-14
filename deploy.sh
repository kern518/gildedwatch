#!/bin/bash
# GildedWatch 部署脚本

set -e  # 遇到错误时退出

echo "🚀 开始部署 GildedWatch..."

# 配置变量
APP_NAME="gildedwatch"
APP_DIR="/opt/$APP_NAME"
VENV_DIR="$APP_DIR/venv"
LOG_DIR="/var/log/$APP_NAME"
USER="www-data"

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then 
  echo "请以root用户运行此脚本"
  exit 1
fi

# 创建目录
echo "📁 创建目录..."
mkdir -p $APP_DIR $LOG_DIR
chown -R $USER:$USER $APP_DIR $LOG_DIR

# 克隆或更新代码
echo "📦 获取代码..."
if [ -d "$APP_DIR/.git" ]; then
  cd $APP_DIR
  git pull origin main
else
  git clone https://github.com/yourusername/gildedwatch.git $APP_DIR
  cd $APP_DIR
fi

# 设置虚拟环境
echo "🐍 设置Python环境..."
if [ ! -d "$VENV_DIR" ]; then
  python3 -m venv $VENV_DIR
fi

# 激活虚拟环境并安装依赖
source $VENV_DIR/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 创建系统服务
echo "⚙️ 创建系统服务..."
cat > /etc/systemd/system/$APP_NAME.service << EOF
[Unit]
Description=GildedWatch Gold Price Monitor
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/python web_app.py
Restart=always
RestartSec=10
StandardOutput=append:$LOG_DIR/app.log
StandardError=append:$LOG_DIR/error.log

[Install]
WantedBy=multi-user.target
EOF

# 创建Nginx配置（如果需要）
if command -v nginx &> /dev/null; then
  echo "🌐 配置Nginx..."
  cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    access_log /var/log/nginx/$APP_NAME.access.log;
    error_log /var/log/nginx/$APP_NAME.error.log;
}
EOF
  
  ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
  nginx -t && systemctl reload nginx
fi

# 启用并启动服务
echo "🔧 启动服务..."
systemctl daemon-reload
systemctl enable $APP_NAME
systemctl restart $APP_NAME

# 检查服务状态
echo "📊 检查服务状态..."
sleep 3
if systemctl is-active --quiet $APP_NAME; then
  echo "✅ $APP_NAME 服务运行正常"
  echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):5000"
else
  echo "❌ $APP_NAME 服务启动失败"
  journalctl -u $APP_NAME -n 20 --no-pager
  exit 1
fi

# 健康检查
echo "❤️ 执行健康检查..."
sleep 2
if curl -s http://localhost:5000/api/health > /dev/null; then
  echo "✅ 健康检查通过"
else
  echo "❌ 健康检查失败"
  exit 1
fi

echo "🎉 部署完成！"
echo ""
echo "📋 部署信息:"
echo "   应用目录: $APP_DIR"
echo "   日志目录: $LOG_DIR"
echo "   服务状态: systemctl status $APP_NAME"
echo "   查看日志: journalctl -u $APP_NAME -f"
echo "   停止服务: systemctl stop $APP_NAME"
echo "   重启服务: systemctl restart $APP_NAME"