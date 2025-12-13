#!/bin/bash

# ==========================================
# Xchange Scrap Marketplace - Project Setup
# ==========================================

set -e

echo "🚀 إعداد مشروع Xchange Scrap Marketplace..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo "📋 التحقق من المتطلبات..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js غير مثبت${NC}"
        echo "   قم بتثبيته من: https://nodejs.org"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
    
    # npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm غير مثبت${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm $(npm -v)${NC}"
    
    # PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}⚠️ PostgreSQL CLI غير موجود (اختياري)${NC}"
    else
        echo -e "${GREEN}✓ PostgreSQL$(NC}"
    fi
    
    echo ""
}

# Create project structure
create_structure() {
    echo "📁 إنشاء هيكل المشروع..."
    
    mkdir -p xchange-scrap/{apps/{web,api},packages/{shared,ui}}
    mkdir -p xchange-scrap/apps/web/{app,components,hooks,lib,styles}
    mkdir -p xchange-scrap/apps/api/{src/{controllers,services,middleware,routes,utils},prisma}
    mkdir -p xchange-scrap/docker
    
    echo -e "${GREEN}✓ تم إنشاء الهيكل${NC}"
}

# Initialize packages
init_packages() {
    echo "📦 تهيئة الحزم..."
    
    cd xchange-scrap
    
    # Root package.json
    cat > package.json << 'EOF'
{
  "name": "xchange-scrap",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run dev --workspace=apps/api",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "db:migrate": "npm run db:migrate --workspace=apps/api",
    "db:seed": "npm run db:seed --workspace=apps/api",
    "db:studio": "npm run db:studio --workspace=apps/api"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
EOF
    
    # Web app package.json
    cat > apps/web/package.json << 'EOF'
{
  "name": "@xchange/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.5",
    "date-fns": "^3.2.0",
    "date-fns-tz": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
EOF

    # API app package.json
    cat > apps/api/package.json << 'EOF'
{
  "name": "@xchange/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.8.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4",
    "ioredis": "^5.3.2",
    "bull": "^4.12.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.10.6",
    "prisma": "^5.8.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
EOF

    echo -e "${GREEN}✓ تم تهيئة الحزم${NC}"
    cd ..
}

# Copy config files
copy_configs() {
    echo "📄 نسخ ملفات الإعداد..."
    
    # Copy schema.prisma
    if [ -f "config/schema.prisma" ]; then
        cp config/schema.prisma xchange-scrap/apps/api/prisma/schema.prisma
        echo -e "${GREEN}✓ schema.prisma${NC}"
    fi
    
    # Copy seed.ts
    if [ -f "config/seed.ts" ]; then
        cp config/seed.ts xchange-scrap/apps/api/prisma/seed.ts
        echo -e "${GREEN}✓ seed.ts${NC}"
    fi
    
    # Copy .env.example
    if [ -f "config/.env.example" ]; then
        cp config/.env.example xchange-scrap/apps/api/.env.example
        cp config/.env.example xchange-scrap/apps/api/.env
        echo -e "${GREEN}✓ .env${NC}"
    fi
}

# Create additional config files
create_configs() {
    echo "⚙️ إنشاء ملفات التكوين..."
    
    cd xchange-scrap
    
    # tsconfig.json (root)
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist"
  }
}
EOF
    
    # Web tsconfig
    cat > apps/web/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    # Web tailwind.config.js
    cat > apps/web/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        secondary: {
          DEFAULT: '#0891b2',
          500: '#06b6d4',
          600: '#0891b2',
        },
        accent: {
          DEFAULT: '#f59e0b',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF

    # Web globals.css
    mkdir -p apps/web/styles
    cat > apps/web/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');

html {
  direction: rtl;
}

body {
  font-family: 'Cairo', sans-serif;
}
EOF

    # API tsconfig
    cat > apps/api/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules"]
}
EOF

    # API entry point
    mkdir -p apps/api/src
    cat > apps/api/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
EOF

    # Web layout
    mkdir -p apps/web/app
    cat > apps/web/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Xchange Scrap - سوق الخردة',
  description: 'أول منصة رقمية لتجارة الخردة في مصر',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
EOF

    # Web home page
    cat > apps/web/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-4">
        🔄 Xchange Scrap
      </h1>
      <p className="text-gray-600 mb-8">
        أول منصة رقمية لتجارة الخردة في مصر
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">💰 أسعار اليوم</h2>
          <p className="text-gray-500">تابع أسعار الخردة لحظة بلحظة</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">📦 طلب جمع</h2>
          <p className="text-gray-500">اطلب روبابيكيا موثق للبيت</p>
        </div>
      </div>
    </main>
  )
}
EOF

    # Docker compose
    cat > docker/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: xchange_scrap
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

    echo -e "${GREEN}✓ تم إنشاء ملفات التكوين${NC}"
    cd ..
}

# Install dependencies
install_deps() {
    echo "📥 تثبيت الحزم..."
    
    cd xchange-scrap
    npm install
    
    echo -e "${GREEN}✓ تم تثبيت الحزم${NC}"
    cd ..
}

# Main
main() {
    echo "═══════════════════════════════════════"
    echo "  🔄 Xchange Scrap Marketplace Setup   "
    echo "═══════════════════════════════════════"
    echo ""
    
    check_prerequisites
    create_structure
    init_packages
    copy_configs
    create_configs
    
    echo ""
    echo -e "${YELLOW}📥 هل تريد تثبيت الحزم الآن؟ (y/n)${NC}"
    read -r answer
    if [ "$answer" = "y" ]; then
        install_deps
    fi
    
    echo ""
    echo "═══════════════════════════════════════"
    echo -e "${GREEN}✅ تم إعداد المشروع بنجاح!${NC}"
    echo "═══════════════════════════════════════"
    echo ""
    echo "الخطوات التالية:"
    echo "  1. cd xchange-scrap"
    echo "  2. عدّل ملف apps/api/.env"
    echo "  3. docker compose -f docker/docker-compose.yml up -d"
    echo "  4. npm run db:migrate"
    echo "  5. npm run db:seed"
    echo "  6. npm run dev"
    echo ""
    echo "🌐 Web: http://localhost:3000"
    echo "🔌 API: http://localhost:3001"
    echo ""
}

main
