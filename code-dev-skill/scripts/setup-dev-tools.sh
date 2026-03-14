#!/bin/bash

# Setup Development Tools for OpenClaw Code Assistant

echo "🚀 Setting up development tools for OpenClaw..."

# Install Node.js development tools
echo "📦 Installing Node.js development tools..."
npm install -g \
  eslint \
  prettier \
  typescript \
  ts-node \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  jest \
  mocha \
  chai \
  nyc \
  nodemon \
  webpack \
  webpack-cli \
  babel-cli \
  rollup

# Install security and quality tools
echo "🔒 Installing security and quality tools..."
npm install -g \
  snyk \
  npm-audit \
  depcheck \
  license-checker \
  bundlewatch \
  lighthouse \
  pa11y

# Install Git utilities
echo "📚 Installing Git utilities..."
npm install -g \
  conventional-changelog \
  commitizen \
  cz-conventional-changelog \
  @commitlint/cli \
  @commitlint/config-conventional \
  standard-version \
  semantic-release

# Install code formatting and linting
echo "✨ Installing code formatting tools..."
npm install -g \
  stylelint \
  markdownlint-cli \
  yamllint \
  jsonlint \
  htmlhint \
  csslint

# Create configuration files
echo "⚙️ Creating configuration files..."

# ESLint config
cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
EOF

# TypeScript config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

# Jest config
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
EOF

# Git hooks setup
echo "🔧 Setting up Git hooks..."
npx husky-init && npm install husky --save-dev

# Create commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install commitlint --edit "$1"
EOF

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run linter
npm run lint --if-present || exit 1

# Run tests
npm test --if-present || exit 1

# Check for security issues
npm audit --audit-level=high || echo "⚠️  Security audit found issues"

echo "✅ Pre-commit checks passed!"
EOF

chmod +x .husky/*

# Create package.json scripts
echo "📝 Adding scripts to package.json..."
if [ -f package.json ]; then
  npm pkg set scripts.lint="eslint src --ext .ts,.js"
  npm pkg set scripts.format="prettier --write src"
  npm pkg set scripts.test="jest"
  npm pkg set scripts.test:watch="jest --watch"
  npm pkg set scripts.test:coverage="jest --coverage"
  npm pkg set scripts.build="tsc"
  npm pkg set scripts.build:watch="tsc --watch"
  npm pkg set scripts.audit:fix="npm audit fix"
  npm pkg set scripts.security="snyk test"
  npm pkg set scripts.prepare="husky install"
else
  echo "⚠️  No package.json found, creating one..."
  cat > package.json << 'EOF'
{
  "name": "openclaw-dev-project",
  "version": "1.0.0",
  "scripts": {
    "lint": "eslint src --ext .ts,.js",
    "format": "prettier --write src",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build": "tsc",
    "build:watch": "tsc --watch",
    "audit:fix": "npm audit fix",
    "security": "snyk test",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "husky": "^8.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.0.0"
  }
}
EOF
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

echo "🎉 Development tools setup complete!"
echo ""
echo "Available commands:"
echo "  npm run lint      - Run ESLint"
echo "  npm run format    - Format code with Prettier"
echo "  npm test          - Run tests"
echo "  npm run build     - Build TypeScript"
echo "  npm run security  - Run security scan"
echo ""
echo "Git hooks are configured to:"
echo "  - Run linter and tests on commit"
echo "  - Validate commit messages"
echo ""
echo "Happy coding! 🚀"