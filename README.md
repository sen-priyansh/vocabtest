# VocabTest - Progressive Web App

A vocabulary testing Progressive Web App built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 📱 **Progressive Web App (PWA)** - Install on any device and use offline
- 📚 **200+ Vocabulary Words** - Difficult English words with meanings and examples
- 🎯 **Multiple Choice Questions** - 20 random questions per test
- 📊 **Detailed Results** - Track your progress and see detailed explanations
- 💾 **Offline Support** - Works without internet connection after initial load
- 🎨 **Mobile-First Design** - Responsive design optimized for all devices
- 🌙 **Dark Mode Support** - Automatic dark/light theme detection

## Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **PWA**: next-pwa with Workbox
- **State Management**: localStorage with custom hooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd vocabtest
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── hooks/
│   │   └── useVocabTest.ts    # Custom hooks for state management
│   ├── page.tsx               # Home page (difficulty selection)
│   ├── test/
│   │   └── page.tsx           # Test page (quiz interface)
│   ├── result/
│   │   └── page.tsx           # Results page (score & analysis)
│   ├── layout.tsx             # Root layout with PWA metadata
│   └── globals.css            # Global styles
public/
├── words.json                 # Vocabulary database (200+ words)
├── manifest.json              # PWA manifest
└── [icons]                    # PWA icons (192x192, 512x512)
```

## How It Works

### 1. Home Page (`/`)
- Difficulty selection (Easy, Medium, Hard, All Levels)
- Clean, intuitive interface with difficulty indicators
- Start test button that passes difficulty parameter

### 2. Test Page (`/test`)
- Displays random word based on selected difficulty
- 4 multiple choice options with shuffled answers
- Real-time progress tracking and score display
- Shows correct answer after selection
- Optional example sentence toggle
- LocalStorage persistence for interrupted sessions

### 3. Results Page (`/result`)
- Overall score and percentage
- Performance feedback with emojis
- Time taken to complete test
- Detailed breakdown of each question
- Retake test functionality

### 4. Data & Storage
- **words.json**: Contains 200+ vocabulary words with:
  - `word`: The vocabulary word
  - `meaning`: Definition/meaning
  - `example`: Example sentence
  - `difficulty`: easy/medium/hard classification
- **localStorage**: Persists test state for offline functionality

### 5. PWA Features
- **Service Worker**: Caches app for offline use
- **Manifest**: Enables "Add to Home Screen"
- **Icons**: Custom app icons for different devices
- **Offline Support**: Works without internet after first load

## Customization

### Adding More Words
Edit `public/words.json` and add entries in this format:
```json
{
  "word": "Example",
  "meaning": "A representative form or pattern",
  "example": "This sentence is an example of proper usage.",
  "difficulty": "medium"
}
```

### Changing Test Length
Modify the `selectRandomWords` function call in `/test/page.tsx`:
```typescript
const selectedWords = selectRandomWords(allWords, 30, difficulty); // Change 20 to 30
```

### Styling
- Tailwind classes can be modified in each component
- Global styles in `src/app/globals.css`
- Color scheme can be changed by updating Tailwind configuration

## PWA Installation

### Mobile (iOS/Android)
1. Open the app in Safari/Chrome
2. Tap the share button
3. Select "Add to Home Screen"

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install"

## Performance

- **Lighthouse Score**: 95+ in all categories
- **Bundle Size**: Optimized with Next.js automatic splitting
- **Loading**: Instant loading after first visit (service worker)
- **Offline**: Fully functional offline after initial load

## Browser Support

- Chrome 60+
- Firefox 62+
- Safari 11.1+
- Edge 79+

## Contributing

We welcome contributions from the community! This project is open for non-commercial use and contributions under the VocabTest Community License.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure your changes don't break existing functionality
- Be respectful and constructive in discussions

### Types of Contributions Welcome

- 🐛 Bug fixes
- ✨ New features (UI improvements, new question types, etc.)
- 📚 Additional vocabulary words
- 🎨 Design improvements
- 📖 Documentation improvements
- 🌐 Translations/internationalization
- ♿ Accessibility improvements
- ⚡ Performance optimizations

## License

This project is licensed under the **VocabTest Community License (VCL) v1.0**.

### Quick Summary:
- ✅ **Free for personal, educational, and community use**
- ✅ **Open source contributions welcome**
- ✅ **Modify and redistribute for non-commercial purposes**
- ❌ **Commercial use prohibited without permission**
- ❌ **Cannot sell or monetize without explicit licensing agreement**

For commercial licensing inquiries, please contact the project owner.

See the [LICENSE](LICENSE) file for full terms and conditions.

## Future Enhancements

- [ ] User accounts and progress tracking
- [ ] More question types (fill-in-the-blank, audio pronunciation)
- [ ] Spaced repetition algorithm
- [ ] Social features (compete with friends)
- [ ] Analytics dashboard
- [ ] Word categories (business, academic, etc.)
- [ ] Adaptive difficulty based on performance

---

Built with ❤️ using Next.js and Tailwind CSS
