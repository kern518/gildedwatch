#!/usr/bin/env node

/**
 * OpenClaw GitHub Automation
 * Automates GitHub operations: issues, PRs, releases
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

class GitHubAutomation {
  constructor(token, repo) {
    this.token = token || process.env.GITHUB_TOKEN;
    this.repo = repo || this.getCurrentRepo();
    this.headers = {
      'Authorization': `token ${this.token}`,
      'User-Agent': 'OpenClaw-GitHub-Automation',
      'Accept': 'application/vnd.github.v3+json'
    };
  }

  /**
   * Get current repository from git config
   */
  getCurrentRepo() {
    try {
      const remoteUrl = execSync('git config --get remote.origin.url', {
        encoding: 'utf8'
      }).trim();
      
      // Convert git URL to owner/repo format
      if (remoteUrl.startsWith('https://github.com/')) {
        return remoteUrl.replace('https://github.com/', '').replace('.git', '');
      } else if (remoteUrl.startsWith('git@github.com:')) {
        return remoteUrl.replace('git@github.com:', '').replace('.git', '');
      }
      
      return null;
    } catch (error) {
      console.error('❌ Not in a git repository or no remote origin');
      return null;
    }
  }

  /**
   * Make GitHub API request
   */
  async githubRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: endpoint,
        method: method,
        headers: this.headers
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`GitHub API error: ${res.statusCode} - ${parsed.message || body}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Create an issue
   */
  async createIssue(title, body, labels = [], assignees = []) {
    console.log(`📝 Creating issue: ${title}`);
    
    const issueData = {
      title,
      body: this.formatIssueBody(body),
      labels,
      assignees
    };

    try {
      const result = await this.githubRequest(
        'POST',
        `/repos/${this.repo}/issues`,
        issueData
      );
      
      console.log(`✅ Issue created: ${result.html_url}`);
      console.log(`   Issue #${result.number}: ${result.title}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to create issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(title, body, head, base = 'main', draft = false) {
    console.log(`🔀 Creating PR: ${title}`);
    
    const prData = {
      title,
      body: this.formatPRBody(body),
      head,
      base,
      draft
    };

    try {
      const result = await this.githubRequest(
        'POST',
        `/repos/${this.repo}/pulls`,
        prData
      );
      
      console.log(`✅ PR created: ${result.html_url}`);
      console.log(`   PR #${result.number}: ${result.title}`);
      console.log(`   Branch: ${head} → ${base}`);
      
      // Add labels if it's a bug fix or feature
      if (title.toLowerCase().includes('fix') || title.toLowerCase().includes('bug')) {
        await this.addLabelsToPR(result.number, ['bug', 'fix']);
      } else if (title.toLowerCase().includes('feat') || title.toLowerCase().includes('feature')) {
        await this.addLabelsToPR(result.number, ['enhancement', 'feature']);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to create PR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add labels to PR
   */
  async addLabelsToPR(prNumber, labels) {
    try {
      await this.githubRequest(
        'POST',
        `/repos/${this.repo}/issues/${prNumber}/labels`,
        { labels }
      );
      console.log(`🏷️  Added labels to PR #${prNumber}: ${labels.join(', ')}`);
    } catch (error) {
      console.warn(`⚠️  Could not add labels: ${error.message}`);
    }
  }

  /**
   * Create a release
   */
  async createRelease(tag, name, body, prerelease = false) {
    console.log(`🚀 Creating release: ${tag}`);
    
    const releaseData = {
      tag_name: tag,
      name,
      body: this.formatReleaseBody(body),
      prerelease,
      generate_release_notes: true
    };

    try {
      const result = await this.githubRequest(
        'POST',
        `/repos/${this.repo}/releases`,
        releaseData
      );
      
      console.log(`✅ Release created: ${result.html_url}`);
      console.log(`   Release ${tag}: ${name}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to create release: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run automated code review and create issue for bugs
   */
  async automatedCodeReview() {
    console.log('🔍 Running automated code review...');
    
    try {
      // Run ESLint
      const eslintOutput = execSync('npx eslint . --format json --quiet', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      
      const eslintIssues = JSON.parse(eslintOutput || '[]');
      
      // Run tests
      const testOutput = execSync('npm test 2>&1', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      
      // Run security scan
      const securityOutput = execSync('npm audit --json 2>/dev/null || echo "{}"', {
        encoding: 'utf8'
      }).toString();
      
      const securityIssues = JSON.parse(securityOutput || '{}');
      
      // Analyze results
      const issues = this.analyzeReviewResults(eslintIssues, testOutput, securityIssues);
      
      // Create issues for critical problems
      for (const issue of issues.critical) {
        await this.createIssue(
          `[Automated Review] ${issue.title}`,
          issue.body,
          ['automated-review', 'bug', 'critical'],
          []
        );
      }
      
      // Create summary issue
      if (issues.total > 0) {
        await this.createIssue(
          `[Automated Review Summary] ${issues.total} issues found`,
          this.formatReviewSummary(issues),
          ['automated-review', 'summary'],
          []
        );
      }
      
      console.log(`📊 Review complete: ${issues.total} total issues, ${issues.critical.length} critical`);
      
      return issues;
    } catch (error) {
      console.error(`❌ Automated review failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze review results
   */
  analyzeReviewResults(eslintIssues, testOutput, securityIssues) {
    const issues = {
      eslint: [],
      tests: [],
      security: [],
      critical: [],
      total: 0
    };
    
    // Analyze ESLint issues
    eslintIssues.forEach(file => {
      file.messages.forEach(message => {
        const issue = {
          type: 'eslint',
          severity: message.severity === 2 ? 'error' : 'warning',
          file: file.filePath,
          line: message.line,
          message: message.message,
          rule: message.ruleId
        };
        
        issues.eslint.push(issue);
        
        if (message.severity === 2) {
          issues.critical.push({
            title: `ESLint Error in ${path.basename(file.filePath)}: ${message.ruleId}`,
            body: `**File**: ${file.filePath}:${message.line}\n**Error**: ${message.message}\n**Rule**: ${message.ruleId}`
          });
        }
      });
    });
    
    // Analyze test failures
    const testFailures = testOutput.match(/FAIL.*\n.*\n.*/g) || [];
    testFailures.forEach(failure => {
      issues.tests.push({
        type: 'test',
        severity: 'error',
        message: failure
      });
      
      issues.critical.push({
        title: 'Test Failure Detected',
        body: `**Test Failure**:\n\`\`\`\n${failure}\n\`\`\``
      });
    });
    
    // Analyze security issues
    if (securityIssues.vulnerabilities) {
      Object.values(securityIssues.vulnerabilities).forEach(vuln => {
        if (vuln.severity === 'critical' || vuln.severity === 'high') {
          issues.security.push({
            type: 'security',
            severity: vuln.severity,
            package: vuln.name,
            version: vuln.range,
            advisory: vuln.advisory
          });
          
          issues.critical.push({
            title: `Security Vulnerability: ${vuln.name} (${vuln.severity})`,
            body: `**Package**: ${vuln.name}@${vuln.range}\n**Severity**: ${vuln.severity}\n**Advisory**: ${vuln.advisory}\n**Fix**: ${vuln.fixAvailable ? 'Available' : 'Not available'}`
          });
        }
      });
    }
    
    issues.total = issues.eslint.length + issues.tests.length + issues.security.length;
    
    return issues;
  }

  /**
   * Format review summary
   */
  formatReviewSummary(issues) {
    return `# Automated Code Review Summary

## 📊 Overview
- **Total Issues**: ${issues.total}
- **Critical Issues**: ${issues.critical.length}
- **ESLint Issues**: ${issues.eslint.length}
- **Test Failures**: ${issues.tests.length}
- **Security Vulnerabilities**: ${issues.security.length}

## 🔍 ESLint Issues (${issues.eslint.length})
${issues.eslint.slice(0, 10).map(issue => 
  `- **${issue.severity.toUpperCase()}** in ${issue.file}:${issue.line} - ${issue.message} (${issue.rule})`
).join('\n')}
${issues.eslint.length > 10 ? `\n... and ${issues.eslint.length - 10} more issues` : ''}

## 🧪 Test Failures (${issues.tests.length})
${issues.tests.length > 0 ? issues.tests.map(issue => `- ${issue.message}`).join('\n') : 'No test failures'}

## 🔒 Security Issues (${issues.security.length})
${issues.security.slice(0, 5).map(issue => 
  `- **${issue.severity.toUpperCase()}**: ${issue.package}@${issue.version}`
).join('\n')}
${issues.security.length > 5 ? `\n... and ${issues.security.length - 5} more vulnerabilities` : ''}

## 🚨 Critical Issues
${issues.critical.map((issue, i) => 
  `${i + 1}. **${issue.title}**\n   ${issue.body.replace(/\n/g, '\n   ')}`
).join('\n\n')}

## 📋 Recommendations
1. Fix critical issues immediately
2. Review ESLint warnings
3. Update vulnerable dependencies
4. Ensure all tests pass

---
*This report was automatically generated by OpenClaw GitHub Automation*`;
  }

  /**
   * Format issue body
   */
  formatIssueBody(body) {
    return `## Description
${body}

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior


## Actual Behavior


## Environment
- **OS**: ${process.platform}
- **Node Version**: ${process.version}
- **Package Manager**: npm

## Additional Context


---
*Issue created by OpenClaw GitHub Automation*`;
  }

  /**
   * Format PR body
   */
  formatPRBody(body) {
    return `## Description
${body}

## Changes Made
- 

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings

## Related Issues
Closes #

---
*PR created by OpenClaw GitHub Automation*`;
  }

  /**
   * Format release body
   */
  formatReleaseBody(body) {
    return `## What's Changed
${body}

## 🚀 New Features


## 🐛 Bug Fixes


## 📚 Documentation


## 🔧 Maintenance


## 📦 Dependencies


## 🧪 Testing


## 🙌 Contributors

---
*Release created by OpenClaw GitHub Automation*`;
  }

  /**
   * Run CI/CD pipeline
   */
  async runCICDPipeline() {
    console.log('⚙️ Running CI/CD pipeline...');
    
    const steps = [
      { name: 'Install dependencies', command: 'npm ci' },
      { name: 'Lint code', command: 'npm run lint' },
      { name: 'Run tests', command: 'npm test' },
      { name: 'Build project', command: 'npm run build' },
      { name: 'Security audit', command: 'npm audit --audit-level=high' }
    ];
    
    const results = [];
    let failed = false;
    
    for (const step of steps) {
      console.log(`  ▶️ ${step.name}...`);
      
      try {
        const output = execSync(step.command, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        results.push({
          step: step.name,
          status: 'success',
          output: output.substring(0, 500) // Truncate output
        });
        
        console.log(`    ✅ Success`);
      } catch (error) {
        results.push({
          step: step.name,
          status: 'failed',
          output: error.message
        });
        
        console.log(`    ❌ Failed: ${error.message}`);
        failed = true;
      }
    }
    
    // Create issue if pipeline failed
    if (failed) {
      await this.createIssue(
        '[CI/CD] Pipeline Failed',
        this.formatPipelineResults(results),
        ['ci-cd', 'failed', 'automated'],
        []
      );
    }
    
    return {
      success: !failed,
      results: results
    };
  }

  /**
   * Format pipeline results
   */
  formatPipelineResults(results) {
    return `# CI/CD Pipeline Results

## 📊 Summary
- **Total Steps**: ${results.length}
- **Successful**: ${results.filter(r => r.status === 'success').length}
- **Failed**: ${results.filter(r => r.status === 'failed').length}

## 🔍 Step Details
${results.map((result, i) => `
### ${i + 1}. ${result.step}
**Status**: ${result.status === 'success' ? '✅ Success' : '❌ Failed'}
${result.status === 'failed' ? `**Error**: \`\`\`\n${result.output}\n\`\`\`` : ''}
`).join('\n')}

## 📋 Next Steps
${results.some(r => r.status === 'failed') ? 
  '1. Investigate failed steps\n2. Fix issues\n3. Re-run pipeline' :
  '✅ All steps passed successfully!'}

---
*Generated by OpenClaw GitHub Automation*`;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Check for GitHub token
  if (!process.env.GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required');
    console.error('   export GITHUB_TOKEN=your_github_token');
    process.exit(1);
  }
  
  const automation = new GitHubAutomation();
  
  if (!automation.repo) {
    console.error('❌ Not in a GitHub repository or no remote origin configured');
    process.exit(1);
  }
  
  switch (command) {
    case 'issue':
      const title = args[1];
      const body = args.slice(2).join(' ') || 'No description provided';
      
      automation.createIssue(title, body, ['automated'])
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error.message);
          process.exit(1);
        });
      break;
      
    case 'pr':
      const prTitle = args[1];
      const prBody = args[2] || 'Automated PR';
      const branch = args[3] || 'main';
      
      // Get current branch
      let currentBranch;
      try {
        currentBranch = execSync('git branch --show-current', {
          encoding: 'utf8'
        }).trim();
      } catch (error) {
        currentBranch = 'feature/automated';
      }
      
      automation.createPullRequest(prTitle, prBody, currentBranch, branch)
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error.message);
          process.exit(1);
        });
      break;
      
    case 'review':
      automation.automatedCodeReview()
        .then(() => process.exit(0))
        .