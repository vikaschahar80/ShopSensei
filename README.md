# ShopSensei 🛍️

A modern, AI-powered e-commerce platform built with React, TypeScript, and Express.js. Features intelligent product recommendations, user behavior tracking, and a seamless shopping experience.

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **React Query (TanStack Query)** - Server state management
- **Wouter** - Lightweight routing solution

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Database & ORM
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Primary database (with Neon serverless support)
- **In-Memory Storage** - Development fallback storage

### Authentication & Security
- **JWT Authentication** - Stateless authentication
- **Google OAuth 2.0** - Social login integration
- **Session Management** - Express sessions
- **Password Hashing** - Secure password storage

### Payment & External Services
- **Stripe** - Payment processing
- **Google OAuth** - Social authentication

### Development Tools
- **TSX** - TypeScript execution
- **ESBuild** - Fast bundling
- **Cross-env** - Cross-platform environment variables
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## ✨ Features

### 🛒 E-commerce Core
- **Product Catalog** - Browse products by category
- **Smart Search** - Product search with filters
- **Shopping Cart** - Add/remove items, quantity management
- **Order Management** - Track order status and history
- **User Accounts** - Registration, login, profile management

### 🤖 AI-Powered Recommendations
- **Behavioral Tracking** - Monitor user interactions (views, cart additions, purchases)
- **Collaborative Filtering** - Find products liked by similar users
- **Category-Based Suggestions** - Smart category recommendations
- **Popular Products** - Trending items based on user behavior
- **Personalized Feed** - Tailored product suggestions

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based auth
- **Google OAuth** - One-click social login
- **Password Security** - Bcrypt hashing with salt rounds
- **Admin Panel** - Role-based access control
- **Session Management** - Secure user sessions

### 💳 Payment Integration
- **Stripe Payment** - Secure payment processing
- **Payment Intents** - Modern payment flow
- **Order Tracking** - Complete purchase lifecycle

### 📱 Modern UI/UX
- **Responsive Design** - Mobile-first approach
- **Dark/Light Themes** - Theme switching support
- **Smooth Animations** - Framer Motion integration
- **Accessible Components** - Radix UI primitives
- **Modern Components** - Cards, modals, forms, etc.

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** (optional, in-memory storage works for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <paste my repo url>
   cd ShopSensei
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see Environment Variables section below)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - **Complete Application:** http://localhost:5000
   - **Note:** Both frontend and backend run on the same port (5000) for seamless integration

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/shopsensei

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Optional Variables
```bash
# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Database (if using Neon)
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname
```

## 🗄️ Database Setup

### Option 1: In-Memory Storage (Default)
The app uses in-memory storage by default, perfect for development and testing.

### Option 2: PostgreSQL with Drizzle
1. **Install PostgreSQL**
2. **Set DATABASE_URL in .env**
3. **Run database migrations**
   ```bash
   npm run db:push
   ```

## 🎨 Frontend E-commerce App

The project includes a complete React-based frontend application located in `client/src/pages/ecommerce-app/`.

### 📁 Frontend Project Structure
```
ecommerce-app
├── src
│   ├── pages
│   │   ├── index.tsx                # Main entry point of the application
│   │   ├── categories
│   │   │   ├── all.tsx              # Page displaying all product categories
│   │   │   ├── electronics.tsx       # Page for Electronics category
│   │   │   ├── fashion.tsx           # Page for Fashion category
│   │   │   ├── home-garden.tsx       # Page for Home & Garden category
│   │   │   ├── sports.tsx            # Page for Sports category
│   │   │   └── books.tsx             # Page for Books category
│   │   └── ai-recommended.tsx        # Page for AI Recommended products
│   ├── components
│   │   ├── Navigation.tsx            # Navigation component for the app
│   │   └── ProductCard.tsx           # Component to display individual product details
│   └── types
│       └── index.ts                  # Types and interfaces used in the application
├── package.json                      # npm configuration file
├── tsconfig.json                     # TypeScript configuration file
└── README.md                         # Frontend-specific documentation
```

**Note:** `npm run dev` runs both the frontend e-commerce app and backend API server on port 5000, providing a seamless integrated experience.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `
