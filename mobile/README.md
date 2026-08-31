# BlogVerse Mobile App (React Native Expo)

Complete cross-platform mobile application for **BlogVerse**, built with React Native and Expo. It features identical design aesthetics, dynamic dark and light themes, SVG Captcha authentication, real-time live synchronization with the website backend, rich Markdown reading & editing, and admin post management.

---

## Features

- **Exact Visual Aesthetics & Theme Matching**:
  - Dark mode (`#0a0a0b`) and Light mode (`#f8fafc`) with vibrant orange brand accents (`#f97316`).
  - Persistent theme preference saved in `AsyncStorage`.
- **Live Automatic Synchronization with Website**:
  - Both Website & Mobile app connect to the same MongoDB backend API.
  - Automatic revalidation on screen focus (`useFocusEffect`) & 20s background sync polling.
  - Native pull-to-refresh (`RefreshControl`) on post feeds.
- **Home Feed**:
  - Hero header with taglines.
  - 300ms debounced search bar with instant clear.
  - Post cards with cover images, quotes, author, date, and admin controls.
  - Loading skeleton shimmer placeholders.
  - Numbered and Prev/Next pagination.
- **Blog Article Reader**:
  - Full Markdown rendering with headings, blockquotes, lists, tables, and links.
  - Syntax-styled code blocks with **one-tap copy-to-clipboard**.
- **Admin Post Management**:
  - Create and Edit posts with auto-slug generation.
  - Rich Markdown Editor with quick formatting toolbar (Bold, Italic, H1/H2, Quote, Code, List, Table, Image, etc.).
  - Cover image picker & camera roll upload via `expo-image-picker`.
- **Authentication**:
  - Login & Sign Up with dynamic **SVG Captchas** from the backend.
  - JWT token and session management with persistent storage.
- **Explore & Tutorials**:
  - Curated guide shortcuts (SQL, Docker, Linux & Networking, Git & Open Source).

---

## Project Structure

```
mobile/
├── package.json
├── app.json
├── babel.config.js
├── App.js
└── src/
    ├── theme/
    │   ├── colors.js             # Exact color tokens (dark & light)
    │   └── ThemeContext.js       # Dynamic theme provider with AsyncStorage
    ├── services/
    │   └── api.js                # API client with live backend endpoints & sync helpers
    ├── context/
    │   └── AuthContext.js        # Auth state (user, token, session persistence)
    ├── components/
    │   ├── Header.js             # Top brand header & theme switcher
    │   ├── PostCard.js           # Post card with image & admin actions
    │   ├── Captcha.js            # SVG Captcha renderer from backend
    │   ├── MarkdownViewer.js     # Markdown viewer with copy-code button
    │   ├── MarkdownEditor.js     # Markdown editor with toolbar & preview
    │   ├── PostForm.js           # Create/Edit post form
    │   ├── SkeletonCard.js       # Pulsing skeleton loader
    │   └── Pagination.js         # Mobile-optimized pagination
    ├── screens/
    │   ├── HomeScreen.js         # Hero, search, feed, pagination & live sync
    │   ├── BlogPostScreen.js     # Article reader
    │   ├── CreatePostScreen.js   # New post creator
    │   ├── EditPostScreen.js     # Post editor
    │   ├── LoginScreen.js        # Login screen with captcha
    │   ├── SignupScreen.js       # Signup screen with captcha
    │   ├── TutorialsScreen.js    # Curated tutorials & stack overview
    │   └── ProfileScreen.js      # Account details & settings
    └── navigation/
        └── RootNavigator.js      # Bottom tab + Stack navigation
```

---

## How to Run

### 1. Navigate to the mobile folder
```bash
cd mobile
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start Expo Dev Server
```bash
npx expo start
```

- Scan the QR code using the **Expo Go** app on your Android or iOS device.
- Press `a` to open on Android Emulator.
- Press `i` to open on iOS Simulator.
- Press `w` to open in your web browser.

---

## API Configuration

By default, the mobile app connects to the live deployed Render backend:
```javascript
// mobile/src/services/api.js
export const API_BASE = 'https://blog-website-jj8f.onrender.com';
```

If you are running the backend locally:
```javascript
// Replace with your local machine's IP address:
export const API_BASE = 'http://192.168.1.X:5000';
```
