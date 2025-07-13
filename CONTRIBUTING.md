# 🤝 Contributing to El Hornito

Thank you for your interest in contributing to El Hornito! This guide will help you understand our development workflow and quality standards.

## 🚀 Quick Start for Contributors

### Prerequisites

- **Node.js** ≥22.0.0
- **npm** ≥10.0.0
- **Git** for version control

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/bbaaxx/elhornito.git
cd elhornito

# 2. Install dependencies
npm ci

# 3. Run tests to ensure everything works
npm test

# 4. Start development server
npm run dev
```

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
# Create and switch to a new feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 2. Development & Testing

```bash
# Run tests while developing
npm run test:watch

# Check code quality
npm run lint
npm run type-check

# Build to ensure no build errors
npm run build
```

### 3. Pre-commit Checks

Before committing, ensure your code passes all quality gates:

```bash
# Run the full CI pipeline locally
npm run ci:all

# This includes:
# - ESLint checks
# - TypeScript compilation
# - Build verification
# - Full test suite with coverage
```

### 4. Commit Guidelines

Use conventional commit messages:

```bash
# Features
git commit -m "feat: add Spanish recipe generation support"

# Bug fixes
git commit -m "fix: resolve difficulty validation in Spanish responses"

# Tests
git commit -m "test: add comprehensive API validation tests"

# Documentation
git commit -m "docs: update contributing guidelines"

# CI/Build
git commit -m "ci: optimize GitHub Actions pipeline caching"
```

### 5. Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request through GitHub UI
```

## 🤖 Automated CI/CD Pipeline

Our GitHub Actions pipeline automatically runs on every pull request:

### 🔍 **Pre-flight Checks** (< 1 min)

- Detects changed files
- Checks for `[skip ci]` in commit messages
- Sets up pipeline optimization

### 🏗️ **Build & Dependencies** (< 3 min)

- Installs dependencies with aggressive caching
- Builds Next.js application
- Caches build artifacts for other jobs

### 🧹 **Code Quality & Linting** (< 2 min)

- ESLint analysis with detailed reporting
- TypeScript type checking
- Code quality metrics

### 🧪 **Test Suite** (< 3 min)

- Runs all 45+ unit tests
- Generates coverage report
- Uploads artifacts for review
- **Auto-comments coverage on PRs** 📊

### 🔒 **Security & Dependencies** (< 1 min)

- npm audit for vulnerabilities
- Production dependency scanning

### ✅ **Final Status Report**

- Pipeline summary with all job results
- Success celebration or failure guidance

## 📊 Quality Standards

### Test Coverage Requirements

Our pipeline enforces these coverage targets:

| Metric         | Target | Status Check |
| -------------- | ------ | ------------ |
| **Lines**      | ≥90%   | ✅ Enforced  |
| **Functions**  | ≥95%   | ✅ Enforced  |
| **Branches**   | ≥85%   | ✅ Enforced  |
| **Statements** | ≥90%   | ✅ Enforced  |

### Code Quality Standards

- ✅ **ESLint**: Zero errors, minimal warnings
- ✅ **TypeScript**: Strict mode, no `any` types
- ✅ **Testing**: Unit tests for all new features
- ✅ **Performance**: Build time <2 minutes
- ✅ **Security**: Clean dependency audit

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// __tests__/your-feature.test.ts
describe('YourFeature', () => {
  test('should handle valid input', () => {
    // Arrange
    const input = createMockInput();

    // Act
    const result = yourFunction(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });

  test('should handle error cases', () => {
    expect(() => yourFunction(invalidInput)).toThrow('Expected error message');
  });
});
```

### Test Categories

1. **Unit Tests** - Individual functions and components
2. **API Tests** - Endpoint behavior and error handling
3. **Integration Tests** - Cross-component workflows
4. **Schema Tests** - Data validation (Zod schemas)

### Running Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Verbose output for debugging
npm run test:verbose

# CI mode (same as pipeline)
npm run test:ci
```

## 🚫 Common Issues & Solutions

### Pipeline Failures

**Build Fails:**

```bash
# Check for TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

**Tests Fail:**

```bash
# Run tests locally to debug
npm run test:verbose

# Check for missing mocks or setup
# Ensure test data is realistic
```

**Coverage Too Low:**

```bash
# Generate coverage report
npm run test:coverage

# Check uncovered lines in coverage/lcov-report/index.html
# Add tests for missing coverage
```

### Cost Optimization Features

Our pipeline includes several cost-saving optimizations:

- ⚡ **Concurrency control** - Cancels old runs on new commits
- 💾 **Aggressive caching** - Node modules and build artifacts
- ⏱️ **Timeout limits** - Prevents runaway jobs
- 🎯 **Conditional execution** - Skips CI with `[skip ci]`
- 🔄 **Parallel jobs** - Lint, test, and security run simultaneously

## 🎯 Branch Strategy

- **`main`** - Production-ready code only
- **`feature/*`** - New features and enhancements
- **`fix/*`** - Bug fixes
- **`docs/*`** - Documentation updates
- **`ci/*`** - CI/CD pipeline improvements

## 📝 Pull Request Guidelines

### PR Title Format

```
feat: add user authentication system
fix: resolve API key validation bug
test: add comprehensive error handling tests
docs: update installation instructions
ci: optimize pipeline caching strategy
```

### PR Description Template

```markdown
## 🎯 Purpose

Brief description of what this PR accomplishes.

## 🔧 Changes Made

- List of specific changes
- New features added
- Bug fixes implemented

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Coverage requirements met

## 📋 Checklist

- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or noted)
```

## 🏆 Recognition

Contributors who help improve El Hornito will be recognized in:

- Project README contributors section
- Release notes for significant contributions
- GitHub contributor statistics

## 📞 Getting Help

- **Issues**: Create GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **CI/CD Issues**: Check Actions tab for pipeline failures

## 🎉 Thank You!

Every contribution makes El Hornito better! Whether it's:

- 🐛 Fixing bugs
- ✨ Adding features
- 📝 Improving documentation
- 🧪 Writing tests
- 🚀 Optimizing performance

Your work is appreciated! 🙏

---

**Happy Coding!** 🍯⚡
