# Contributing to Applied-LLM-Platform

First off, thank you for considering contributing to Applied-LLM-Platform! It's people like you that make this project a great learning resource for the community.

## 🌟 Ways to Contribute

There are many ways to contribute to this project:

- 🐛 **Report bugs** - Help us identify and fix issues
- 💡 **Suggest features** - Share ideas for new examples or improvements
- 📝 **Improve documentation** - Help others understand the code better
- 🧪 **Add tests** - Increase code coverage and reliability
- 🎨 **Enhance UI/UX** - Make the examples more user-friendly
- 🔧 **Fix issues** - Help resolve open issues
- ✨ **Add examples** - Create new LLM integration patterns
- 📹 **Create tutorials** - Help others learn

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/th_Applied-LLM-Platform.git
cd th_Applied-LLM-Platform
```

### 2. Set Up Development Environment

Follow the [GETTING_STARTED.md](GETTING_STARTED.md) guide to set up your local environment.

### 3. Create a Branch

```bash
# Create a descriptive branch name
git checkout -b feature/add-new-example
# or
git checkout -b fix/chat-error-handling
# or
git checkout -b docs/improve-rag-guide
```

### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 5. Test Your Changes

```bash
# Run linting
npm run lint

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Build the project
npm run build
```

### 6. Commit Your Changes

Use clear and descriptive commit messages:

```bash
git add .
git commit -m "Add: New example for multi-agent collaboration"
# or
git commit -m "Fix: Chat component error handling"
# or
git commit -m "Docs: Update RAG documentation with examples"
```

**Commit message format**:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Docs:` for documentation changes
- `Test:` for adding or updating tests
- `Refactor:` for code refactoring
- `Style:` for formatting changes
- `Chore:` for maintenance tasks

### 7. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with a clear description of your changes.

## 📋 Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Code is properly formatted (run `npm run lint`)
- [ ] Tests pass locally (`npm run test:unit` and `npm run test:e2e`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No sensitive information (API keys, passwords) is committed

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Use **functional components** for React
- Use **async/await** instead of promises when possible
- Use **destructuring** for props and objects
- Follow **ESLint** rules (configured in `.eslintrc.json`)

**Example**:
```typescript
// Good ✅
const MyComponent: React.FC<{ name: string }> = ({ name }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = async () => {
    try {
      const result = await fetchData();
      setCount(result.count);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return <div onClick={handleClick}>{name}: {count}</div>;
};

// Avoid ❌
function MyComponent(props) {
  const [count, setCount] = useState(0);
  
  function handleClick() {
    fetchData().then(result => {
      setCount(result.count);
    }).catch(error => {
      console.error('Error:', error);
    });
  }
  
  return <div onClick={handleClick}>{props.name}: {count}</div>;
}
```

### React Components

- Use **shadcn/ui** components for UI elements
- Use **Tailwind CSS** for styling
- Keep components **small and focused**
- Use **TypeScript interfaces** for props

**Example**:
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChatMessageProps {
  message: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  role, 
  timestamp 
}) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">{role}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{message}</p>
        <span className="text-xs text-gray-500">
          {timestamp.toLocaleTimeString()}
        </span>
      </CardContent>
    </Card>
  );
};
```

### API Routes

- Use **Next.js App Router** conventions
- Implement proper **error handling**
- Add **input validation**
- Return consistent **response formats**

**Example**:
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    
    if (!body.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await processQuery(body.query);
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Testing

- Write **unit tests** for utility functions
- Write **integration tests** for API routes
- Write **E2E tests** for critical user flows
- Use **descriptive test names**

**Example**:
```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateCosineSimilarity } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('calculateCosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vector = [1, 2, 3];
      const result = calculateCosineSimilarity(vector, vector);
      expect(result).toBe(1);
    });
    
    it('should return 0 for orthogonal vectors', () => {
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];
      const result = calculateCosineSimilarity(vector1, vector2);
      expect(result).toBe(0);
    });
  });
});
```

## 📁 Project Structure

```
th_Applied-LLM-Platform/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/                # API routes
│   │   ├── chat/               # Chat example
│   │   ├── ragAgentic/         # RAG example
│   │   └── ...                 # Other examples
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ...                 # Custom components
│   ├── lib/                    # Utility functions
│   └── types/                  # TypeScript types
├── tests/
│   ├── e2e/                    # Playwright tests
│   └── unit/                   # Jest tests
├── docs/                       # Documentation
├── prisma/                     # Database schema
└── public/                     # Static assets
```

## 🧪 Adding New Examples

When adding a new LLM integration example:

1. **Create the page** in `src/app/your-example/page.tsx`
2. **Create API routes** in `src/app/api/your-example/route.ts`
3. **Create components** in `src/components/YourExample/`
4. **Add documentation** in `docs/YOUR_EXAMPLE.md`
5. **Add tests** in `tests/e2e/your-example.spec.ts`
6. **Update README** with a link to your example

### Example Template

```typescript
// src/app/myExample/page.tsx
'use client';

import { MyExampleComponent } from '@/components/MyExample/MyExampleComponent';

export default function MyExamplePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Example</h1>
      <MyExampleComponent />
    </div>
  );
}
```

## 📖 Documentation Guidelines

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Link to relevant resources
- Keep it up-to-date

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: What happened?
- **Expected behavior**: What should have happened?
- **Steps to reproduce**: How can we reproduce the issue?
- **Environment**: Node version, OS, browser
- **Error messages**: Full error stack trace
- **Screenshots**: If applicable

## 💡 Feature Requests

When suggesting features, please include:

- **Use case**: Why is this feature needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other ways to solve the problem
- **Examples**: Similar features in other projects

## ❓ Questions

- Check existing [documentation](docs/)
- Search [existing issues](https://github.com/pacozaa/Applied-LLM-Platform/issues)
- Ask in [GitHub Discussions](https://github.com/pacozaa/Applied-LLM-Platform/discussions)

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## 🎯 Development Priorities

See [RECOMMENDATIONS.md](RECOMMENDATIONS.md) for current priorities and roadmap.

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Applied-LLM-Platform! 🎉
