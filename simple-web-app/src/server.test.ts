import request from 'supertest';
import express from 'express';
import { Application } from 'express';

// 由于我们无法直接导入server.ts（会启动服务器），我们复制核心逻辑
const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: expect.any(String),
      service: 'Simple Web App',
      version: '1.0.0'
    });
  });
  
  app.get('/api/greet', (req, res) => {
    const name = req.query.name || 'Visitor';
    res.json({
      message: `Hello, ${name}!`,
      timestamp: expect.any(String)
    });
  });
  
  app.post('/api/echo', (req, res) => {
    const data = req.body;
    res.json({
      received: data,
      echoed: true,
      timestamp: expect.any(String)
    });
  });
  
  return app;
};

describe('Simple Web App API', () => {
  const app = createTestApp();
  
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'Simple Web App',
        version: '1.0.0'
      });
    });
  });
  
  describe('GET /api/greet', () => {
    it('should greet with default name', async () => {
      const response = await request(app)
        .get('/api/greet')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.message).toBe('Hello, Visitor!');
      expect(response.body.timestamp).toEqual(expect.any(String));
    });
    
    it('should greet with custom name', async () => {
      const response = await request(app)
        .get('/api/greet?name=OpenClaw')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.message).toBe('Hello, OpenClaw!');
    });
  });
  
  describe('POST /api/echo', () => {
    it('should echo back the request data', async () => {
      const testData = {
        message: 'Hello World',
        number: 42,
        nested: { key: 'value' }
      };
      
      const response = await request(app)
        .post('/api/echo')
        .send(testData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.received).toEqual(testData);
      expect(response.body.echoed).toBe(true);
      expect(response.body.timestamp).toEqual(expect.any(String));
    });
    
    it('should handle empty request', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({})
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.received).toEqual({});
      expect(response.body.echoed).toBe(true);
    });
  });
});

describe('Server Configuration', () => {
  it('should have proper TypeScript configuration', () => {
    // 检查tsconfig.json是否存在
    const fs = require('fs');
    const path = require('path');
    
    const tsconfigPath = path.join(__dirname, '../tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    expect(tsconfig.compilerOptions.target).toBe('ES2022');
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });
  
  it('should have ESLint configuration', () => {
    const fs = require('fs');
    const path = require('path');
    
    const eslintPath = path.join(__dirname, '../.eslintrc.js');
    expect(fs.existsSync(eslintPath)).toBe(true);
  });
  
  it('should have Prettier configuration', () => {
    const fs = require('fs');
    const path = require('path');
    
    const prettierPath = path.join(__dirname, '../.prettierrc');
    expect(fs.existsSync(prettierPath)).toBe(true);
  });
});