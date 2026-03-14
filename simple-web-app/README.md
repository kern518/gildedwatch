# 🚀 Simple Web App

一个由OpenClaw AI助手自动生成的TypeScript + Express Web应用演示项目。

## ✨ 特性

- ✅ **TypeScript** - 完整的类型安全
- ✅ **Express** - 快速、极简的Web框架
- ✅ **ESLint + Prettier** - 代码质量和格式化
- ✅ **Jest** - 单元测试
- ✅ **现代化前端** - 响应式界面，实时演示
- ✅ **完整API** - RESTful API接口
- ✅ **健康检查** - 服务监控端点
- ✅ **安全中间件** - Helmet, CORS保护

## 📁 项目结构

```
simple-web-app/
├── src/
│   ├── server.ts          # 主服务器文件
│   └── server.test.ts     # 单元测试
├── public/                # 静态文件
├── views/                 # 视图文件
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── .eslintrc.js           # ESLint配置
├── .prettierrc            # Prettier配置
├── jest.config.js         # Jest配置
└── README.md              # 项目文档
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

### 代码检查
```bash
npm run lint      # ESLint检查
npm run format    # Prettier格式化
npm test          # 运行测试
```

## 🌐 API接口

### 健康检查
```http
GET /api/health
```
响应：
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Simple Web App",
  "version": "1.0.0"
}
```

### 问候接口
```http
GET /api/greet?name=YourName
```
响应：
```json
{
  "message": "Hello, YourName!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 回显接口
```http
POST /api/echo
Content-Type: application/json

{
  "message": "Hello World"
}
```
响应：
```json
{
  "received": {
    "message": "Hello World"
  },
  "echoed": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 前端界面

项目包含一个完整的前端界面，提供：
- ✅ 实时API测试
- ✅ 响应式设计
- ✅ 美观的UI组件
- ✅ 交互式演示

## 🔧 技术栈

- **运行时**: Node.js
- **语言**: TypeScript
- **框架**: Express
- **测试**: Jest + Supertest
- **代码质量**: ESLint + Prettier
- **安全**: Helmet + CORS
- **日志**: Morgan

## 📊 开发工作流

1. **代码编写** → 使用TypeScript
2. **代码检查** → ESLint自动检查
3. **代码格式化** → Prettier自动格式化
4. **测试** → Jest单元测试
5. **构建** → TypeScript编译
6. **部署** → 启动服务器

## 🐛 故障排除

### 端口占用
```bash
# 检查端口占用
lsof -i :3000

# 杀死占用进程
kill -9 <PID>
```

### TypeScript错误
```bash
# 清理并重新构建
rm -rf dist node_modules
npm install
npm run build
```

### 测试失败
```bash
# 运行特定测试
npm test -- server.test.ts

# 查看详细输出
npm test -- --verbose
```

## 🤖 自动化功能

这个项目展示了OpenClaw的自动化能力：

1. **自动生成** - 整个项目由AI自动创建
2. **自动配置** - 所有配置文件自动生成
3. **自动测试** - 包含完整的测试套件
4. **自动文档** - 生成详细的API文档
5. **自动部署** - 一键启动服务

## 📝 许可证

MIT License

## 🙏 致谢

由 [OpenClaw](https://openclaw.ai) AI助手自动生成。

---

**生成时间**: 2024-01-01  
**生成工具**: OpenClaw Code Generator  
**状态**: ✅ 生产就绪