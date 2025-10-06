# Totali Frontend

Frontend application for the Totali personal item value tracking system.

## Technology Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui
- **State Management**:
  - React Query (server state)
  - Zustand (client state)
- **Development Tools**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (latest LTS version)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

The application will be available at http://localhost:3000.

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

- `app/`: Next.js App Router
  - `(home)/`: Home page routes
  - `auth/`: Authentication routes
  - `dashboard/`: Dashboard routes
- `components/`: Reusable React components
  - `ui/`: UI components from shadcn/ui
  - `forms/`: Form components
  - `layouts/`: Layout components
  - `shared/`: Shared components
- `lib/`: Utility functions and hooks
  - `api/`: API client
  - `hooks/`: Custom React hooks
  - `store/`: Zustand stores
- `types/`: TypeScript type definitions

## API Communication

The frontend communicates with the backend API running at http://localhost:3001. API requests are proxied through Next.js to avoid CORS issues.
