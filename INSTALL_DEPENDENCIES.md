# Install Required Dependencies

Run these commands in your terminal:

```bash
# Install Zustand for state management
npm install zustand

# Install React Query for server state management
npm install @tanstack/react-query @tanstack/react-query-devtools

# Install React Hook Form for better form handling (optional but recommended)
npm install react-hook-form

# Install Zod for validation (optional but recommended)
npm install zod @hookform/resolvers
```

## Why These Libraries?

### Zustand (4KB)
- Simple, lightweight state management
- No boilerplate
- TypeScript-first
- DevTools support

### React Query
- Automatic caching and refetching
- Optimistic updates
- Background synchronization
- No need to manage loading/error states manually

### React Hook Form (Optional)
- Better form performance (uncontrolled components)
- Built-in validation
- Less re-renders

### Zod (Optional)
- Runtime type validation
- Type-safe schema validation
- Works with React Hook Form

## After Installation

1. Wrap your app with QueryClientProvider
2. Add React Query DevTools
3. Start using the new architecture

See `src/main.tsx` for setup example.
