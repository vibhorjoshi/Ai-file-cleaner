# Contributing to AI File Cleanup

We love your input! We want to make contributing to AI File Cleanup as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/ai-file-cleanup.git
cd ai-file-cleanup

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development
pnpm run dev
```

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- All functions must have proper type annotations
- Prefer interfaces over types for object definitions
- Use Zod for runtime type validation

### Code Style
- Use Prettier for formatting (configured in `.prettierrc`)
- Use ESLint for linting (configured in `.eslintrc.js`)
- Follow conventional commits format
- Write meaningful commit messages

### Testing
- Write unit tests for all new features
- Maintain test coverage above 80%
- Use Jest for testing framework
- Mock external dependencies

## Project Structure

```
ai-file-cleanup/
├── apps/                      # Applications
├── services/                  # Backend services
├── packages/                  # Shared packages
├── infra/                     # Infrastructure
└── docs/                      # Documentation
```

## Monorepo Guidelines

### Package Dependencies
- Use `workspace:*` for internal dependencies
- Keep external dependencies minimal
- Update dependencies regularly
- Document breaking changes

### Build System
- Use TurboRepo for orchestration
- Configure caching appropriately
- Optimize build performance
- Ensure reproducible builds

## AI/ML Contributions

### Model Integration
- Use transformers.js for browser compatibility
- Implement proper error handling
- Add fallback mechanisms
- Document model requirements

### Performance
- Optimize inference speed
- Minimize memory usage
- Implement batching where appropriate
- Profile performance regularly

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/ai-file-cleanup/issues); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please provide:

- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Any related issues or discussions

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)