# Contributing to Xchange

Thank you for considering contributing to Xchange! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/xchange-egypt.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "feat: your feature description"`
7. Push: `git push origin feature/your-feature-name`
8. Create a Pull Request

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add JWT refresh token functionality
fix(listings): resolve barter matching algorithm bug
docs(api): update API documentation for auctions
```

## 🧪 Testing

Before submitting a PR:

```bash
# Backend
cd backend
pnpm run test
pnpm run lint

# Frontend
cd frontend
pnpm run test
pnpm run lint
pnpm run build  # Ensure it builds successfully
```

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** (if applicable)
5. **Request review** from maintainers

## 🎨 Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Comments**: Write clear comments for complex logic
- **Formatting**: Run Prettier before committing

### Backend Style
```typescript
// Good
export const getUserById = async (userId: string): Promise<User> => {
  // Implementation
}

// Bad
export const get_user = async (id: any) => {
  // Implementation
}
```

### Frontend Style
```typescript
// Good
export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Implementation
}

// Bad
export const productcard = (props: any) => {
  // Implementation
}
```

## 🐛 Bug Reports

When filing a bug report, include:

1. **Description**: Clear description of the bug
2. **Steps to reproduce**: How to trigger the bug
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**: OS, Node version, browser (if applicable)
6. **Screenshots**: If relevant

## 💡 Feature Requests

When requesting a feature:

1. **Use case**: Why is this feature needed?
2. **Description**: Detailed description of the feature
3. **Examples**: How would it work?
4. **Alternatives**: Other solutions you've considered

## 🔐 Security

**DO NOT** open public issues for security vulnerabilities.

Instead, email: security@xchange.eg (placeholder)

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's proprietary license.

## ❓ Questions?

Feel free to open a discussion or contact the maintainers.

---

**Thank you for contributing to Xchange! 🙏**
