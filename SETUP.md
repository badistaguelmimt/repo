# Adopty Project Setup Guide

This is a full-stack monorepo project with three main parts:
- **Backend**: Node.js/Express API server
- **Web**: React + Vite web application
- **Mobile**: React Native + Expo mobile application

## Prerequisites

- **Node.js**: Version 20.0.0 or higher
- **npm**: Comes with Node.js
- External services:
  - MySQL database
  - Clerk (Authentication)
  - Cloudinary (Image storage)
  - Inngest (Workflow engine)

## Installation Steps

### 1. Clone and Navigate
```bash
cd adopty
```

### 2. Set Up Environment Variables

#### Backend (.env)
```bash
cp backend/.env.example backend/.env
```

Fill in the required values in `backend/.env`:
- Database credentials (MySQL)
- Clerk API keys (from [clerk.com](https://clerk.com))
- Cloudinary credentials (from [cloudinary.com](https://cloudinary.com))
- Inngest signing key (from [inngest.com](https://inngest.com))

#### Web (.env.local)
```bash
cp web/.env.example web/.env.local
```

#### Mobile (.env)
```bash
cp mobile/.env.example mobile/.env
```

### 3. Install Dependencies

From the root directory:
```bash
npm install --prefix backend
npm install --prefix web
npm install --prefix mobile
```

Or install each individually:

**Backend:**
```bash
cd backend && npm install && cd ..
```

**Web:**
```bash
cd web && npm install && cd ..
```

**Mobile:**
```bash
cd mobile && npm install && cd ..
```

### 4. Set Up Database

- Create a MySQL database named `adopty`
- Update `backend/.env` with your database credentials
- Run any migrations if needed (check backend/src/database for scripts)

## Development

### Start Backend (Port 3000)
```bash
npm run dev --prefix backend
```

### Start Web (Port 5173)
```bash
npm run dev --prefix web
```

### Start Mobile (Expo)
```bash
npm start --prefix mobile
```

## Production Build

### Build Web
```bash
npm run build --prefix web
```

### Start Backend (Production)
```bash
npm start --prefix backend
```

## Project Structure

```
adopty/
├── backend/              # Express API server
│   ├── src/
│   │   ├── server.js
│   │   ├── config/       # Configuration (db, env, etc.)
│   │   ├── controlleurs/ # API controllers
│   │   ├── database/     # Database models
│   │   ├── midleware/    # Express middleware
│   │   ├── modeles/      # Data models
│   │   └── routes/       # API routes
│   └── package.json
├── web/                  # React + Vite web app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── assets/
│   │   └── lib/
│   └── package.json
├── mobile/               # React Native + Expo app
│   ├── app/              # Expo Router screens
│   ├── components/       # React Native components
│   ├── constants/        # App constants (theme, etc.)
│   ├── hooks/            # Custom React hooks
│   └── package.json
└── package.json          # Root package (monorepo scripts)
```

## Useful Commands

### From Root
```bash
npm run build    # Build backend and web
npm start        # Start backend
```

### Backend Commands
```bash
npm run dev      # Development with file watching
npm start        # Production start
```

### Web Commands
```bash
npm run dev      # Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Mobile Commands
```bash
npm start        # Start Expo dev server
npm run android  # Start on Android emulator
npm run ios      # Start on iOS simulator
npm run web      # Start web version
npm run lint     # Run ESLint
```

## Troubleshooting

- **Database connection errors**: Check your `.env` database credentials match your MySQL setup
- **Port conflicts**: Make sure ports 3000, 5173, and Expo's ports aren't in use
- **Missing modules**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Support

For issues or questions, check the GitHub repository: https://github.com/Adopty-Org/adopty
