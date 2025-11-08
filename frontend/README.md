# Xchange Frontend

Modern Next.js 14 frontend for the Xchange E-commerce Platform with real-time features.

## 🚀 Features

- ✅ **Authentication Flow** - Login, register, JWT token management
- ✅ **API Client** - Axios with automatic token refresh
- ✅ **WebSocket Integration** - Real-time chat with Socket.IO
- ✅ **Image Upload** - Multi-image upload with validation
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern, responsive styling
- ✅ **React Context** - State management with Context API

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at `https://xchange-egypt-production.up.railway.app`

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🌐 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
```

For local backend development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js 14 app directory
│   ├── page.tsx             # Home page
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── dashboard/           # Dashboard page
│   ├── layout.tsx           # Root layout with providers
│   └── globals.css          # Global styles
├── components/
│   └── ui/
│       └── ImageUpload.tsx  # Image upload component
├── lib/
│   ├── api/
│   │   ├── client.ts        # Axios client with auth
│   │   ├── auth.ts          # Auth API functions
│   │   └── images.ts        # Image upload API
│   └── contexts/
│       ├── AuthContext.tsx  # Authentication context
│       └── SocketContext.tsx # WebSocket context
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔐 Authentication

### Using the Auth Context

```tsx
'use client';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MyComponent() {
  const { user, login, logout, register } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'user@example.com',
      password: 'password123'
    });
  };

  return (
    <div>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### API Calls with Authentication

The API client automatically includes JWT tokens:

```tsx
import apiClient from '@/lib/api/client';

// Automatically includes Authorization header
const response = await apiClient.get('/items');
const items = response.data;
```

## 💬 WebSocket / Real-time Chat

### Using the Socket Context

```tsx
'use client';
import { useSocket } from '@/lib/contexts/SocketContext';
import { useEffect } from 'react';

export default function ChatComponent() {
  const { connected, sendMessage, onMessage, offMessage } = useSocket();

  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log('New message:', message);
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, []);

  const handleSend = () => {
    sendMessage('conversation-id', 'Hello!');
  };

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
}
```

## 📸 Image Upload

### Using the ImageUpload Component

```tsx
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function MyForm() {
  const handleUploadComplete = (urls: string[]) => {
    console.log('Uploaded images:', urls);
    // Use the uploaded image URLs
  };

  const handleUploadError = (error: string) => {
    console.error('Upload failed:', error);
  };

  return (
    <ImageUpload
      multiple={true}
      category="items"
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      maxFiles={5}
    />
  );
}
```

### Manual Image Upload

```tsx
import { uploadImage, uploadMultipleImages } from '@/lib/api/images';

// Single image
const file = ...; // File from input
const result = await uploadImage(file, 'items');
console.log('Image URL:', result.url);

// Multiple images
const files = [...]; // Files from input
const results = await uploadMultipleImages(files, 'items');
const urls = results.map(r => r.url);
```

## 🎨 Styling with Tailwind CSS

All components use Tailwind CSS utility classes:

```tsx
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
  Click Me
</button>
```

Custom theme colors are defined in `tailwind.config.ts`.

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Set these in your deployment platform:

```
NEXT_PUBLIC_API_URL=https://xchange-egypt-production.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://xchange-egypt-production.up.railway.app
```

## 🧪 Testing the Frontend

1. **Start the app**: `npm run dev`
2. **Register**: Go to `/register` and create an account
3. **Login**: Use your credentials at `/login`
4. **Dashboard**: You'll be redirected to `/dashboard`
5. **Test features**:
   - Upload images
   - Check WebSocket connection status
   - View your profile

## 🔗 API Endpoints Used

The frontend connects to these backend endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/images/upload` - Upload single image
- `POST /api/v1/images/upload-multiple` - Upload multiple images
- WebSocket: Real-time chat connections

## 🐛 Troubleshooting

### Authentication Issues

If you get 401 errors:
1. Check that `accessToken` is in localStorage
2. Verify backend is running
3. Check CORS settings on backend

### WebSocket Not Connecting

1. Verify `NEXT_PUBLIC_WS_URL` is correct
2. Check browser console for connection errors
3. Ensure backend WebSocket server is running

### Image Upload Failing

1. Check file size (max 5MB)
2. Verify file type (JPEG, PNG, WebP only)
3. Ensure backend `/api/v1/images/upload` is accessible

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Axios](https://axios-http.com/docs/intro)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see backend LICENSE file for details
