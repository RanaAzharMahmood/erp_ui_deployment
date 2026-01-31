# ERP System - React UI

A modern, responsive ERP system built with React, TypeScript, and Material UI.

## Features

- 🔐 **Authentication**: Secure login system with protected routes
- 📦 **Product Management**: Create, edit, and delete products with full CRUD operations
- 🏷️ **Category Management**: Organize products with categories
- 🎨 **Modern UI**: Beautiful Material UI design with responsive layout
- ⚡ **Fast**: Built with Vite for optimal performance
- 🔒 **Type-Safe**: Full TypeScript support

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Material UI (MUI)** - Component library
- **React Router** - Navigation and routing
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/        # Reusable components
│   └── layout/       # Layout components (DashboardLayout)
├── contexts/         # React contexts (AuthContext)
├── hooks/           # Custom React hooks
├── pages/           # Page components
│   ├── LoginPage.tsx
│   ├── ProductsPage.tsx
│   └── CategoriesPage.tsx
├── types/           # TypeScript type definitions
├── App.tsx          # Main app component with routing
├── main.tsx         # Application entry point
└── theme.ts         # Material UI theme configuration
```

## Usage

### Login

- Enter any email and password to login (authentication is simulated)
- After login, you'll be redirected to the products page

### Products

- View all products in a table format
- Add new products with name, description, SKU, category, price, and stock
- Edit existing products
- Delete products
- Stock levels are color-coded (green: >10, yellow: 1-10, red: 0)

### Categories

- View categories in a card grid layout
- Create new categories with name and description
- Edit existing categories
- Delete categories (only if not assigned to any products)

## Data Storage

Currently, data is stored in browser localStorage. In a production environment, this would be replaced with API calls to a backend service.

## Best Practices Implemented

- ✅ Type-safe code with TypeScript
- ✅ Component-based architecture
- ✅ Context API for state management
- ✅ Protected routes for authentication
- ✅ Responsive design
- ✅ Accessible UI components
- ✅ Clean code structure
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

## License

MIT

