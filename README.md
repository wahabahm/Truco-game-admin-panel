# Truco Admin Panel

A complete admin panel for managing Truco game tournaments, matches, players, and transactions.

## Features

- **User Management**: Manage players, view user statistics
- **Tournaments**: Create and manage tournaments
- **Matches**: Track and monitor game matches
- **Transactions**: Handle payments and transactions
- **Live Monitoring**: Real-time game monitoring
- **Reports**: Generate analytics and reports
- **Authentication**: Secure login system with protected routes

## Technologies

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **React Router** - Client-side routing
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Radix UI** - Accessible component primitives

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── dashboard/ # Dashboard-specific components
│   ├── layout/    # Layout components (sidebar, etc.)
│   └── ui/        # shadcn/ui components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── pages/         # Page components
├── services/      # API service functions
└── main.tsx       # Application entry point
```

## Demo Credentials

- **Email**: admin@truco.com
- **Password**: admin123

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private project - All rights reserved
