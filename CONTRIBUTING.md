# Contributing to VocabTest

Thank you for your interest in contributing to VocabTest! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive, and collaborative environment. We welcome contributors of all backgrounds and experience levels.

## How to Contribute

### 🐛 Reporting Bugs

1. Check if the issue already exists in the [Issues](../../issues) section
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Browser/device information

### ✨ Suggesting Features

1. Check existing issues and discussions for similar ideas
2. Open a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
   - Mockups or examples if applicable

### 💻 Code Contributions

#### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/[your-username]/vocabtest.git
   cd vocabtest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Code Style
- Use TypeScript for all new code
- Follow existing code formatting and naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Ensure code is readable and well-organized

##### React/Next.js Conventions
- Use functional components with hooks
- Prefer custom hooks for complex state logic
- Use 'use client' directive only when necessary
- Follow Next.js App Router patterns
- Implement proper loading and error states

##### CSS/Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Support both light and dark themes
- Ensure accessibility (color contrast, keyboard navigation)

##### Testing
- Test your changes thoroughly across different devices
- Verify PWA functionality works properly
- Check that localStorage persistence works correctly
- Ensure offline functionality remains intact

#### Commit Guidelines

Use conventional commit messages:
```
type(scope): description

Examples:
feat(test): add audio pronunciation feature
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
style(home): improve button hover effects
```

#### Pull Request Process

1. **Before submitting:**
   - Ensure your code follows the style guidelines
   - Test your changes thoroughly
   - Update documentation if needed
   - Make sure the build passes (`npm run build`)

2. **Create the Pull Request:**
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference any related issues
   - Include screenshots for UI changes
   - Mark as draft if work in progress

3. **After submitting:**
   - Respond to feedback promptly
   - Make requested changes in new commits
   - Keep the conversation focused and respectful

## Types of Contributions

### 🎨 UI/UX Improvements
- Better responsive design
- Improved accessibility
- Enhanced user experience
- Visual design improvements
- Animation and micro-interactions

### 📚 Content Contributions
- Adding new vocabulary words
- Improving word definitions
- Better example sentences
- Categorizing words by topics
- Translation support

### 🚀 Feature Development
- New question types (fill-in-the-blank, matching)
- User progress tracking
- Social features
- Gamification elements
- Performance analytics

### 🐛 Bug Fixes
- Cross-browser compatibility issues
- Mobile-specific problems
- PWA functionality bugs
- Performance optimizations
- Security improvements

### 📖 Documentation
- Code documentation
- User guides
- API documentation
- Tutorial creation
- README improvements

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Modern web browser
- Code editor (VS Code recommended)

### Recommended Extensions (VS Code)
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- Auto Rename Tag

### Project Structure
```
src/
├── app/
│   ├── hooks/           # Custom React hooks
│   ├── [page]/         # App Router pages
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
public/
├── words.json          # Vocabulary database
├── manifest.json       # PWA manifest
└── [assets]           # Static assets
```

### Key Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **next-pwa**: PWA functionality
- **localStorage**: Client-side state persistence

## Vocabulary Word Guidelines

When adding new words to `public/words.json`:

### Word Selection Criteria
- Choose genuinely challenging words
- Ensure words are useful for vocabulary building
- Avoid overly obscure or archaic terms
- Include words from various domains (academic, professional, literary)

### Entry Format
```json
{
  "word": "Perspicacious",
  "meaning": "Having a ready insight into and understanding of things",
  "example": "Her perspicacious analysis of the market trends impressed the board.",
  "difficulty": "hard"
}
```

### Quality Standards
- **Word**: Correct spelling and capitalization
- **Meaning**: Clear, concise definition (avoid circular definitions)
- **Example**: Natural sentence showing proper usage
- **Difficulty**: Appropriate level (easy/medium/hard)

## License

By contributing to VocabTest, you agree that your contributions will be licensed under the VocabTest Community License (VCL) v1.0. This means:

- ✅ Your contributions can be used freely for non-commercial purposes
- ✅ You retain credit for your contributions
- ✅ The community benefits from your work
- ❌ Commercial use requires permission from the project owner

## Recognition

Contributors will be acknowledged in:
- CONTRIBUTORS.md file
- Release notes for significant contributions
- About page in the application (for major contributors)

## Getting Help

- **Questions about contributing**: Open a discussion or issue
- **Technical help**: Check existing issues or create a new one
- **General support**: Use the discussions section

Thank you for helping make VocabTest better for everyone! 🚀📚