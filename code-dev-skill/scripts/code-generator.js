#!/usr/bin/env node

/**
 * OpenClaw Code Generator
 * Automatically generates code based on specifications
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CodeGenerator {
  constructor(options = {}) {
    this.options = {
      language: 'typescript',
      framework: 'node',
      style: 'functional',
      ...options
    };
  }

  /**
   * Generate a component
   */
  generateComponent(name, type = 'functional', props = []) {
    const componentName = this.capitalizeFirst(name);
    let componentCode = '';

    switch (this.options.language) {
      case 'typescript':
        componentCode = this.generateTSComponent(componentName, type, props);
        break;
      case 'javascript':
        componentCode = this.generateJSComponent(componentName, type, props);
        break;
      case 'python':
        componentCode = this.generatePythonComponent(componentName, type, props);
        break;
      default:
        throw new Error(`Unsupported language: ${this.options.language}`);
    }

    // Generate test file
    const testCode = this.generateTest(componentName, props);

    // Generate documentation
    const docs = this.generateDocs(componentName, type, props);

    return {
      component: componentCode,
      test: testCode,
      docs: docs,
      files: [
        { name: `${componentName}.${this.getExtension()}`, content: componentCode },
        { name: `${componentName}.test.${this.getExtension()}`, content: testCode },
        { name: `${componentName}.md`, content: docs }
      ]
    };
  }

  /**
   * Generate TypeScript component
   */
  generateTSComponent(name, type, props) {
    const propsInterface = props.length > 0 
      ? `interface ${name}Props {\n${props.map(p => `  ${p}: any;`).join('\n')}\n}`
      : '';

    const propsDeclaration = props.length > 0 
      ? `{ ${props.join(', ')} }: ${name}Props`
      : '';

    if (type === 'functional') {
      return `import React from 'react';
${propsInterface}

/**
 * ${name} component
 * 
${props.map(p => ` * @param ${p} - ${p} description`).join('\n')}
 */
export const ${name}: React.FC<${props.length > 0 ? `${name}Props` : '{}'}> = (${propsDeclaration}) => {
  return (
    <div className="${name.toLowerCase()}">
      {/* ${name} component content */}
    </div>
  );
};

${name}.displayName = '${name}';
${name}.defaultProps = {};
`;
    } else {
      return `import React, { Component } from 'react';
${propsInterface}

/**
 * ${name} component
 */
export class ${name} extends Component<${props.length > 0 ? `${name}Props` : '{}'}> {
  constructor(props${props.length > 0 ? `: ${name}Props` : ''}) {
    super(props);
    this.state = {};
  }

  render() {
    ${props.length > 0 ? `const { ${props.join(', ')} } = this.props;` : ''}
    return (
      <div className="${name.toLowerCase()}">
        {/* ${name} component content */}
      </div>
    );
  }
}

${name}.defaultProps = {};
`;
    }
  }

  /**
   * Generate JavaScript component
   */
  generateJSComponent(name, type, props) {
    // Similar to TS but without types
    return `import React from 'react';

/**
 * ${name} component
 */
export const ${name} = (${props.length > 0 ? `{ ${props.join(', ')} }` : ''}) => {
  return (
    <div className="${name.toLowerCase()}">
      {/* ${name} component content */}
    </div>
  );
};

${name}.defaultProps = {};
`;
  }

  /**
   * Generate Python component
   */
  generatePythonComponent(name, type, props) {
    return `"""
${name} Module
"""

class ${name}:
    """
    ${name} class
    
    ${props.map(p => `:param ${p}: ${p} description`).join('\n    ')}
    """
    
    def __init__(self${props.length > 0 ? `, ${props.map(p => `${p}=None`).join(', ')}` : ''}):
        ${props.map(p => `self.${p} = ${p}`).join('\n        ')}
    
    def execute(self):
        """
        Execute ${name} functionality
        """
        # Implementation here
        pass
    
    def __str__(self):
        return f"${name}()"
`;
  }

  /**
   * Generate test file
   */
  generateTest(name, props) {
    const ext = this.getExtension();
    
    if (this.options.language === 'typescript' || this.options.language === 'javascript') {
      return `import { ${name} } from './${name}';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  ${props.map(p => `it('handles ${p} prop correctly', () => {
    render(<${name} ${p}="test" />);
    // Add assertions for ${p}
  });`).join('\n\n  ')}
});
`;
    } else if (this.options.language === 'python') {
      return `import pytest
from ${name.toLowerCase()} import ${name}

class Test${name}:
    def test_initialization(self):
        """Test ${name} initialization"""
        instance = ${name}()
        assert instance is not None
    
    def test_execute(self):
        """Test execute method"""
        instance = ${name}()
        result = instance.execute()
        # Add assertions
    
    ${props.map(p => `def test_${p}_prop(self):
        """Test ${p} property"""
        instance = ${name}(${p}="test")
        assert instance.${p} == "test"`).join('\n\n    ')}
`;
    }
    
    return '';
  }

  /**
   * Generate documentation
   */
  generateDocs(name, type, props) {
    return `# ${name}

## Overview

${name} is a ${type} ${this.options.language} ${this.options.framework === 'react' ? 'component' : 'class'}.

## Props/Parameters

${props.map(p => `### ${p}
- **Type**: any
- **Required**: false
- **Description**: ${p} description
`).join('\n')}

## Usage

\`\`\`${this.options.language}
import { ${name} } from './${name}';

// Example usage
<${name} ${props.map(p => `${p}={value}`).join(' ')} />
\`\`\`

## Examples

### Basic Usage
\`\`\`${this.options.language}
<${name} />
\`\`\`

### With Props
\`\`\`${this.options.language}
<${name}
  ${props.map(p => `${p}="value"`).join('\n  ')}
/>
\`\`\`

## API Reference

### Methods
- **render()** - Renders the component
${props.map(p => `- **${p}** - ${p} property`).join('\n')}

## Testing

Run tests with:
\`\`\`bash
npm test -- ${name}.test.${this.getExtension()}
\`\`\`

## Development

This component was automatically generated by OpenClaw Code Generator.
`;
  }

  /**
   * Run code review
   */
  async runCodeReview(filePath) {
    try {
      // Run ESLint
      const eslintResult = execSync(`npx eslint ${filePath} --format json`, {
        encoding: 'utf8'
      }).toString();
      
      // Run TypeScript compiler check
      let tsResult = '';
      if (this.options.language === 'typescript') {
        tsResult = execSync(`npx tsc --noEmit ${filePath}`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe']
        }).toString();
      }

      // Run security scan
      const securityResult = execSync(`npx snyk test ${path.dirname(filePath)}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();

      return {
        eslint: JSON.parse(eslintResult || '[]'),
        typescript: tsResult,
        security: securityResult,
        summary: this.generateReviewSummary(filePath)
      };
    } catch (error) {
      return {
        error: error.message,
        stdout: error.stdout?.toString(),
        stderr: error.stderr?.toString()
      };
    }
  }

  /**
   * Generate review summary
   */
  generateReviewSummary(filePath) {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n').length;
    const size = stats.size;
    const complexity = this.calculateComplexity(content);
    
    return {
      file: filePath,
      lines: lines,
      size: `${(size / 1024).toFixed(2)} KB`,
      complexity: complexity,
      suggestions: this.generateSuggestions(content)
    };
  }

  /**
   * Calculate code complexity
   */
  calculateComplexity(content) {
    // Simple complexity calculation
    const cyclomatic = (content.match(/if|else|for|while|case|catch/g) || []).length;
    const functions = (content.match(/function|=>|def|class/g) || []).length;
    
    return {
      cyclomatic: cyclomatic,
      functions: functions,
      score: cyclomatic + functions
    };
  }

  /**
   * Generate suggestions
   */
  generateSuggestions(content) {
    const suggestions = [];
    
    // Check for long functions
    const functions = content.split(/\n\s*(function|const|let|var|def)\s+/);
    functions.forEach((func, index) => {
      const lines = func.split('\n').length;
      if (lines > 50) {
        suggestions.push(`Function ${index + 1} is too long (${lines} lines). Consider refactoring.`);
      }
    });
    
    // Check for nested loops
    const nestedLoops = (content.match(/for.*{[\s\S]*?for|while.*{[\s\S]*?while/g) || []).length;
    if (nestedLoops > 0) {
      suggestions.push(`Found ${nestedLoops} nested loops. Consider optimizing.`);
    }
    
    // Check for magic numbers
    const magicNumbers = (content.match(/\b\d{3,}\b/g) || []).length;
    if (magicNumbers > 0) {
      suggestions.push(`Found ${magicNumbers} magic numbers. Consider using named constants.`);
    }
    
    return suggestions;
  }

  /**
   * Helper methods
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getExtension() {
    switch (this.options.language) {
      case 'typescript': return 'tsx';
      case 'javascript': return 'jsx';
      case 'python': return 'py';
      default: return 'js';
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const generator = new CodeGenerator({
    language: args.includes('--ts') ? 'typescript' : 
              args.includes('--py') ? 'python' : 'javascript'
  });
  
  switch (command) {
    case 'generate':
      const name = args[1];
      const type = args.includes('--class') ? 'class' : 'functional';
      const props = args.filter(arg => arg.startsWith('--prop='))
                       .map(arg => arg.replace('--prop=', ''));
      
      const result = generator.generateComponent(name, type, props);
      
      // Write files
      result.files.forEach(file => {
        fs.writeFileSync(file.name, file.content);
        console.log(`✅ Created ${file.name}`);
      });
      
      console.log(`\n🎉 Generated ${name} component with:`);
      console.log(`  - ${result.files.length} files`);
      console.log(`  - ${props.length} props`);
      console.log(`  - ${type} style`);
      break;
      
    case 'review':
      const filePath = args[1] || '.';
      generator.runCodeReview(filePath).then(review => {
        console.log(JSON.stringify(review, null, 2));
      });
      break;
      
    default:
      console.log('OpenClaw Code Generator');
      console.log('Usage:');
      console.log('  node code-generator.js generate <name> [--ts|--py] [--class] [--prop=name...]');
      console.log('  node code-generator.js review [file]');
      console.log('');
      console.log('Examples:');
      console.log('  node code-generator.js generate Button --ts --prop=onClick --prop=children');
      console.log('  node code-generator.js review ./src/Button.tsx');
  }
}

module.exports = CodeGenerator;