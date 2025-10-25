# Scope Media Platform - Component Documentation

## 🧩 Component Overview

This document provides detailed documentation for all React components in the Scope Media Platform. Each component includes props, usage examples, and implementation details.

---

## 📁 Component Structure

```
src/components/
├── Navigation.tsx          # Main navigation bar
├── LiveFeatureBox.tsx     # Live streams and videos display
├── VideoPlayer.tsx        # Custom video player
├── AuthModal.tsx          # Authentication modal
├── ThemeToggle.tsx        # Dark/light mode toggle
├── NoSSR.tsx              # Client-side only wrapper
├── ClientNavigation.tsx   # Client-side navigation
├── HydrationFix.tsx       # Hydration fix component
└── ThemeProvider.tsx      # Theme context provider
```

---

## 🧩 Component Details

### 1. Navigation Component

**File**: `src/components/Navigation.tsx`

**Purpose**: Main navigation bar with theme toggle, search, and user authentication.

#### Props
```typescript
// No props - uses AuthContext internally
```

#### Features
- Responsive design (mobile/desktop)
- Theme toggle (dark/light mode)
- User authentication state
- Search functionality
- Admin access link
- Real-time user profile display

#### Usage
```tsx
import Navigation from '@/components/Navigation';

function Layout() {
  return (
    <div>
      <Navigation />
      <main>
        {/* Your content */}
      </main>
    </div>
  );
}
```

#### Implementation Details
- Uses `useAuth` hook for authentication state
- Implements `usePathname` for active link highlighting
- Responsive design with Tailwind CSS
- Includes `suppressHydrationWarning` for SSR compatibility

---

### 2. LiveFeatureBox Component

**File**: `src/components/LiveFeatureBox.tsx`

**Purpose**: Displays live streams and recent videos in an animated grid layout.

#### Props
```typescript
interface LiveFeatureBoxProps {
  liveStreams: LiveStreamProps[];
  recentVideos: RecentVideoProps[];
  onVideoClick?: (video: any) => void;
}

interface LiveStreamProps {
  id: string;
  title: string;
  thumbnail: string;
  url?: string;
  isLive: boolean;
  viewers?: number;
}

interface RecentVideoProps {
  id: string;
  title: string;
  thumbnail: string;
  url?: string;
  duration: string;
  uploadDate: string;
}
```

#### Features
- Animated grid layout with Framer Motion
- Hover effects and transitions
- Click handlers for video selection
- Live status indicators
- Viewer count display
- Responsive design (1-4 columns)

#### Usage
```tsx
import LiveFeatureBox from '@/components/LiveFeatureBox';

function HomePage() {
  const [streams, setStreams] = useState([]);
  const [videos, setVideos] = useState([]);

  const handleVideoClick = (video) => {
    // Handle video selection
    console.log('Selected video:', video);
  };

  return (
    <LiveFeatureBox
      liveStreams={streams}
      recentVideos={videos}
      onVideoClick={handleVideoClick}
    />
  );
}
```

#### Animation Variants
```typescript
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};
```

---

### 3. VideoPlayer Component

**File**: `src/components/VideoPlayer.tsx`

**Purpose**: Custom video player with React Player integration for YouTube and RTMP streams.

#### Props
```typescript
interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  autoplay?: boolean;
  controls?: boolean;
  width?: string;
  height?: string;
  className?: string;
}
```

#### Features
- YouTube and RTMP stream support
- Custom controls and styling
- Thumbnail display before play
- Responsive sizing
- Error handling
- Loading states

#### Usage
```tsx
import VideoPlayer from '@/components/VideoPlayer';

function VideoPage() {
  return (
    <VideoPlayer
      url="https://youtube.com/watch?v=dQw4w9WgXcQ"
      thumbnail="https://example.com/thumb.jpg"
      autoplay={true}
      controls={true}
      width="100%"
      height="400px"
    />
  );
}
```

#### Supported URLs
- YouTube: `https://youtube.com/watch?v=...`
- YouTube Live: `https://youtube.com/live/...`
- RTMP: `rtmp://example.com/live/stream`
- Other React Player supported formats

---

### 4. AuthModal Component

**File**: `src/components/AuthModal.tsx`

**Purpose**: Authentication modal for user login and signup.

#### Props
```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess?: (user: any) => void;
}
```

#### Features
- Login and signup forms
- Form validation
- Supabase authentication integration
- Error handling and display
- Responsive design
- Loading states

#### Usage
```tsx
import AuthModal from '@/components/AuthModal';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  return (
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      mode={authMode}
      onSuccess={(user) => {
        console.log('User authenticated:', user);
        setShowAuth(false);
      }}
    />
  );
}
```

#### Form Fields
**Login:**
- Email
- Password

**Signup:**
- Email
- Password
- Confirm Password
- Full Name (optional)

---

### 5. ThemeToggle Component

**File**: `src/components/ThemeToggle.tsx`

**Purpose**: Dark/light mode toggle button with smooth transitions.

#### Props
```typescript
// No props - uses ThemeProvider context
```

#### Features
- Theme persistence in localStorage
- Smooth transitions
- Icon updates (sun/moon)
- System preference detection
- Accessibility support

#### Usage
```tsx
import ThemeToggle from '@/components/ThemeToggle';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

#### Theme Context
```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

---

### 6. NoSSR Component

**File**: `src/components/NoSSR.tsx`

**Purpose**: Client-side only rendering wrapper to prevent hydration issues.

#### Props
```typescript
interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

#### Features
- Prevents hydration mismatches
- Fallback content support
- Client-side only rendering
- Loading state handling

#### Usage
```tsx
import NoSSR from '@/components/NoSSR';

function App() {
  return (
    <NoSSR fallback={<div>Loading...</div>}>
      <ClientOnlyComponent />
    </NoSSR>
  );
}
```

#### When to Use
- Components using `window` or `document`
- Components with browser-specific APIs
- Components with different server/client rendering
- Third-party components with hydration issues

---

### 7. ClientNavigation Component

**File**: `src/components/ClientNavigation.tsx`

**Purpose**: Client-side navigation component to avoid hydration issues.

#### Props
```typescript
// No props - uses Next.js navigation internally
```

#### Features
- Client-side only rendering
- Next.js navigation integration
- Responsive design
- Active link highlighting

#### Usage
```tsx
import ClientNavigation from '@/components/ClientNavigation';

function Layout() {
  return (
    <div>
      <ClientNavigation />
      <main>
        {/* Your content */}
      </main>
    </div>
  );
}
```

---

### 8. HydrationFix Component

**File**: `src/components/HydrationFix.tsx`

**Purpose**: Wrapper component to fix hydration mismatches.

#### Props
```typescript
interface HydrationFixProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

#### Features
- Hydration mismatch prevention
- Fallback content
- Client-side rendering
- Error boundary integration

#### Usage
```tsx
import HydrationFix from '@/components/HydrationFix';

function ProblematicComponent() {
  return (
    <HydrationFix fallback={<div>Loading...</div>}>
      <ComponentWithHydrationIssues />
    </HydrationFix>
  );
}
```

---

### 9. ThemeProvider Component

**File**: `src/components/ThemeProvider.tsx`

**Purpose**: Theme context provider for dark/light mode management.

#### Props
```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: 'light' | 'dark';
}
```

#### Features
- Theme state management
- localStorage persistence
- System preference detection
- Context API integration

#### Usage
```tsx
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <YourApp />
    </ThemeProvider>
  );
}
```

#### Context Usage
```tsx
import { useTheme } from '@/components/ThemeProvider';

function Component() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

---

## 🎨 Styling Guidelines

### Tailwind CSS Classes
All components use Tailwind CSS for styling with consistent patterns:

```tsx
// Responsive design
className="flex flex-col md:flex-row"

// Dark mode support
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"

// Hover effects
className="hover:bg-blue-500 hover:text-white transition-colors"

// Focus states
className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
```

### Component Styling Patterns
1. **Container**: `container mx-auto px-4 py-8`
2. **Cards**: `bg-white rounded-lg shadow-md p-6`
3. **Buttons**: `px-4 py-2 rounded-lg font-medium transition-colors`
4. **Forms**: `w-full px-3 py-2 border border-gray-300 rounded-lg`

---

## 🔧 Custom Hooks

### useHydrationFix Hook

**File**: `src/hooks/useHydrationFix.ts`

**Purpose**: Custom hook to handle hydration issues.

```typescript
export function useHydrationFix() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
```

**Usage**:
```tsx
import { useHydrationFix } from '@/hooks/useHydrationFix';

function Component() {
  const isClient = useHydrationFix();
  
  if (!isClient) {
    return <div>Loading...</div>;
  }
  
  return <div>Client-side content</div>;
}
```

---

## 🧪 Testing Components

### Unit Testing with Jest
```typescript
import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';

test('renders navigation', () => {
  render(<Navigation />);
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

### Component Testing with Storybook
```typescript
// LiveFeatureBox.stories.tsx
export default {
  title: 'Components/LiveFeatureBox',
  component: LiveFeatureBox,
};

export const Default = {
  args: {
    liveStreams: mockStreams,
    recentVideos: mockVideos,
  },
};
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

### Responsive Patterns
```tsx
// Grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Text sizes
className="text-sm md:text-base lg:text-lg"

// Spacing
className="p-4 md:p-6 lg:p-8"
```

---

## ♿ Accessibility

### ARIA Labels
```tsx
<button aria-label="Toggle theme">
  <SunIcon />
</button>
```

### Keyboard Navigation
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

### Focus Management
```tsx
<button
  className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
>
  Accessible button
</button>
```

---

## 🐛 Common Issues

### Hydration Mismatches
**Problem**: Server and client render different content
**Solution**: Use `NoSSR` or `useHydrationFix`

### Theme Flickering
**Problem**: Theme changes on page load
**Solution**: Use `suppressHydrationWarning` and proper theme initialization

### Image Loading
**Problem**: Images not loading properly
**Solution**: Use Next.js `Image` component with proper optimization

---

## 📚 Best Practices

### Component Design
1. **Single Responsibility**: Each component has one clear purpose
2. **Props Interface**: Define clear TypeScript interfaces
3. **Default Props**: Provide sensible defaults
4. **Error Boundaries**: Wrap components that might fail

### Performance
1. **Memoization**: Use `React.memo` for expensive components
2. **Lazy Loading**: Load components when needed
3. **Code Splitting**: Split large components into smaller ones

### Maintainability
1. **Documentation**: Document all props and usage
2. **Consistent Naming**: Use clear, descriptive names
3. **Type Safety**: Use TypeScript for all components
4. **Testing**: Write tests for critical components

---

*This component documentation is maintained alongside the codebase. Please update it when making changes to components.*
