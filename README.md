# 🍯 El Hornito - AI-Powered Recipe Generator

[![CI Pipeline](https://github.com/bbaaxx/elhornito/workflows/🚀%20CI%20Pipeline%20-%20Build,%20Lint%20&%20Test/badge.svg)](https://github.com/bbaaxx/elhornito/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen.svg)](https://github.com/bbaaxx/elhornito/actions)
[![Code Quality](https://img.shields.io/badge/code%20quality-A-brightgreen.svg)](https://github.com/bbaaxx/elhornito/actions)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

Transform your fridge contents into delicious recipes with AI-powered analysis! El Hornito uses Claude AI to analyze your refrigerator photos and suggest personalized recipes based on available ingredients.

## ✨ Features

- 📸 **Smart Fridge Analysis** - Upload photos of your fridge for ingredient recognition
- 🤖 **AI Recipe Generation** - Claude AI creates personalized recipes from your ingredients
- 🌍 **Multi-language Support** - English and Spanish recipe generation
- ⚙️ **Personalized Settings** - Dietary restrictions, cooking preferences, kitchen equipment
- 🔒 **Secure API Keys** - Personal Anthropic API key validation and management
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## 🤖🧑‍� AI-Human Collaborative Development

> **This project showcases the power of human-AI collaboration in modern software development.**

El Hornito is being built as a **living experiment** in AI-assisted development, demonstrating how master developers and AI coding assistants can work together to create production-quality applications. Every feature, test, and optimization represents a collaborative effort between human expertise and AI capabilities.

**Development Philosophy:**

- 🧠 **Human Vision & Architecture** - Strategic decisions, user experience design, and system architecture
- 🤖 **AI Implementation & Optimization** - Code generation, testing patterns, and performance optimization
- 🔄 **Iterative Collaboration** - Continuous refinement through human feedback and AI adaptation
- 📈 **Quality-Driven** - Professional CI/CD, comprehensive testing, and production-ready standards

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/bbaaxx/elhornito.git
cd elhornito
npm install

# Set up your environment
cp .env.example .env.local
# Add your Anthropic API key to .env.local

# Start development
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and start transforming your fridge photos into delicious recipes!

## 📁 Repository Structure

```
elhornito/
├── 🎯 Core Application
│   ├── src/app/           # Next.js App Router pages & API routes
│   ├── src/components/    # Reusable UI components
│   ├── src/lib/          # Utility functions & configurations
│   └── src/types/        # TypeScript type definitions
│
├── 🌍 Internationalization
│   ├── src/locales/      # Translation files (en/es)
│   └── src/i18n/         # i18n configuration & routing
│
├── 🧪 Testing & Quality
│   ├── __tests__/        # Comprehensive test suite (45+ tests)
│   ├── jest.config.ts    # Jest configuration
│   └── .github/workflows/ # CI/CD pipeline
│
├── 📋 Documentation
│   ├── docs/             # Technical documentation
│   ├── plans/            # Development plans & progress
│   └── specs/            # Feature specifications
│
└── ⚙️ Configuration
    ├── next.config.ts    # Next.js configuration
    ├── tsconfig.json     # TypeScript configuration
    └── tailwind.config.js # Styling configuration
```

## 🛠️ Tech Stack

**Frontend:** Next.js 15 + TypeScript + Tailwind CSS  
**Backend:** Next.js API Routes + Anthropic Claude AI  
**Testing:** Jest + Testing Library (45+ tests, <8s execution)  
**CI/CD:** GitHub Actions (build, lint, test, security)  
**Deployment:** Railway / Vercel ready  
**i18n:** next-intl for English/Spanish support

## 🧪 Professional Testing

Our AI-human collaboration has produced a **bulletproof testing strategy**:

- ✅ **45+ Unit Tests** covering all API endpoints and utilities
- ✅ **<8 Second Execution** with comprehensive coverage
- ✅ **Production Bug Prevention** (Spanish difficulty validation fix)
- ✅ **Automated CI/CD** with quality gates on every PR
- ✅ **Professional DevOps** practices with cost optimization

```bash
npm run test          # Run all tests
npm run test:watch    # Development mode
npm run test:coverage # Coverage report
npm run ci:all        # Complete CI pipeline
```

## 🌟 Contributing

We welcome contributions that continue the spirit of AI-human collaboration! Check out our [Contributing Guide](./CONTRIBUTING.md) for:

- Professional development workflow
- Testing standards and patterns
- CI/CD pipeline integration
- Code quality requirements

## 🎯 What Makes This Special

1. **AI-Assisted Architecture** - Leveraging AI for optimal code structure and patterns
2. **Human-Guided UX** - Master developer intuition for user experience
3. **Collaborative Testing** - AI-generated comprehensive test suites with human validation
4. **Production-Ready** - Enterprise-grade CI/CD and quality standards
5. **Living Documentation** - Evolving plans and specs that reflect real development

---

**This is how the future of software development looks: humans and AI working together to build amazing things.** 🚀✨
