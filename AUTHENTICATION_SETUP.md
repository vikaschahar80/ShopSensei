# ShopSensei Authentication Setup Guide

This guide will help you set up Google OAuth authentication with JWT token management for ShopSensei.

## Features Implemented

- ✅ Secure Google OAuth login
- ✅ JWT token management with 7-day expiration
- ✅ Password hashing with bcrypt
- ✅ User registration with email/password
- ✅ Protected routes with authentication middleware
- ✅ Admin-only routes with role-based access
- ✅ User profile management with avatar support
- ✅ Automatic token verification on app load
- ✅ Secure logout functionality

## Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:5173

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

## Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret to your `.env` file

### 3. Configure OAuth Consent Screen

1. Go to "OAuth consent screen"
2. Fill in the required information:
   - App name: "ShopSensei"
   - User support email: your email
   - Developer contact information: your email
3. Add scopes: `email` and `profile`

## Database Schema Updates

The user table has been updated to support OAuth authentication:

```sql
-- New fields added to users table
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN google_email TEXT;
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN first_name TEXT;
ALTER TABLE users ADD COLUMN last_name TEXT;
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ALTER COLUMN password DROP NOT NULL; -- Make password optional for OAuth users
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client-side)

### Protected Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

## Frontend Components

### Authentication Context

The `AuthProvider` manages authentication state and provides:
- User information
- JWT token management
- Login/logout functions
- Google OAuth integration

### Components

- `LoginForm` - Email/password login with Google OAuth
- `RegisterForm` - User registration with validation
- `ProtectedRoute` - Route protection with authentication/authorization
- `AuthPage` - Main authentication page
- `AuthCallbackPage` - OAuth callback handling

## Usage Examples

### Protecting Routes

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

// Require authentication
<ProtectedRoute requireAuth>
  <YourComponent />
</ProtectedRoute>

// Require admin access
<ProtectedRoute requireAuth requireAdmin>
  <AdminComponent />
</ProtectedRoute>
```

### Using Authentication in Components

```tsx
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.firstName}!</div>;
}
```

## Security Features

1. **JWT Tokens**: 7-day expiration with secure signing
2. **Password Hashing**: bcrypt with 12 salt rounds
3. **CORS Protection**: Configured for frontend domain
4. **Input Validation**: Zod schemas for all inputs
5. **Rate Limiting**: Built into the authentication middleware
6. **Secure Headers**: CORS and security headers configured

## Testing the Setup

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5173/auth`
3. Try both email/password registration and Google OAuth
4. Test protected routes and admin access

## Troubleshooting

### Common Issues

1. **Google OAuth not working**: Check redirect URIs in Google Console
2. **CORS errors**: Verify FRONTEND_URL in .env
3. **JWT errors**: Ensure JWT_SECRET is set and secure
4. **Database errors**: Run database migrations if needed

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and OAuth debugging information.

## Production Deployment

1. Update environment variables for production
2. Set secure JWT_SECRET
3. Configure production Google OAuth credentials
4. Update CORS settings for production domain
5. Enable HTTPS for OAuth callbacks

## Data Storage

User registration data is stored in the database with the following structure:

- **Regular Users**: Username, email, hashed password
- **OAuth Users**: Google ID, email, profile information
- **Hybrid Users**: Can link Google account to existing email/password account

The system automatically handles:
- Account linking when email already exists
- Profile updates from Google
- Last login tracking
- Email verification status
