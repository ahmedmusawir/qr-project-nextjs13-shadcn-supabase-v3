# QR Project V3 Documentation

A sophisticated event ticketing and QR code management system built with Next.js 13, Shadcn UI, and Supabase, integrating with GoHighLevel (GHL) CRM platform for real-time order processing and ticket validation.

---

## Documentation Structure

### Getting Started
- **[Getting Started Guide](/docs/guides/getting-started.md)** - Initial setup, installation, and configuration
- **[Development Workflow](/docs/guides/development-workflow.md)** - Development practices and common tasks
- **[Deployment Guide](/docs/guides/deployment-guide.md)** - Production deployment and configuration

### Architecture
- **[System Overview](/docs/architecture/overview.md)** - High-level architecture and technology stack
- **[Data Flow](/docs/architecture/data-flow.md)** - Order processing, webhooks, and synchronization
- **[Routing](/docs/architecture/routing.md)** - Next.js App Router structure and protected routes
- **[Authentication](/docs/architecture/authentication.md)** - Supabase Auth and role-based access control
- **[State Management](/docs/architecture/state-management.md)** - Zustand implementation and patterns

### Database
- **[Database Schema](/docs/database/schema.md)** - Complete database structure and table definitions
- **[Tables Reference](/docs/database/tables-reference.md)** - Detailed column-by-column documentation
- **[Data Relationships](/docs/database/data-relationships.md)** - Foreign keys and relationship patterns

### API
- **[Authentication Endpoints](/docs/api/auth-endpoints.md)** - Login, logout, signup, and session management
- **[GHL Integration](/docs/api/ghl-integration.md)** - GoHighLevel API endpoints for orders, events, and contacts
- **[Webhook Integration](/docs/api/webhook-integration.md)** - GHL webhook processing and QR code generation
- **[QR App Endpoints](/docs/api/qr-app-endpoints.md)** - Internal API for orders, tickets, and events
- **[SuperAdmin Endpoints](/docs/api/superadmin-endpoints.md)** - User management APIs

### Features
- **[Event Ticketing](/docs/features/event-ticketing.md)** - Event management and ticket types
- **[QR Code Generation](/docs/features/qr-code-generation.md)** - Automatic QR code creation and storage
- **[Data Synchronization](/docs/features/data-synchronization.md)** - Real-time sync between GHL and Supabase
- **[Ticket Validation](/docs/features/ticket-validation.md)** - Ticket status management and validation
- **[User Management](/docs/features/user-management.md)** - SuperAdmin user creation and deletion

### State Management
- **[Zustand Stores](/docs/state/zustand-stores.md)** - Store-by-store reference and usage
- **[State Patterns](/docs/state/state-patterns.md)** - Best practices and implementation patterns

### UI Components
- **[Component Library](/docs/ui-components/component-library.md)** - Complete component inventory
- **[Design System](/docs/ui-components/design-system.md)** - Colors, typography, and styling conventions
- **[Admin Portal](/docs/ui-components/admin-portal.md)** - Admin interface components
- **[SuperAdmin Portal](/docs/ui-components/superadmin-portal.md)** - SuperAdmin interface components
- **[Forms and Validation](/docs/ui-components/forms-and-validation.md)** - Form handling with React Hook Form and Zod

### User Flows
- **[Admin Workflows](/docs/user-flows/admin-workflows.md)** - Admin user journeys and processes
- **[SuperAdmin Workflows](/docs/user-flows/superadmin-workflows.md)** - SuperAdmin user journeys and processes
- **[Authentication Flows](/docs/user-flows/authentication-flows.md)** - Login, logout, and password reset flows

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:4001
```

See the [Getting Started Guide](/docs/guides/getting-started.md) for detailed setup instructions.

---

## Tech Stack

**Frontend:**
- Next.js 13.5.6 (App Router)
- React 18
- TypeScript
- Tailwind CSS 3.4.1
- Shadcn UI (Radix UI primitives)

**Backend:**
- Next.js API Routes
- Express.js (Custom Server)
- Socket.IO (Real-time communication)

**Database & Auth:**
- Supabase (PostgreSQL + Authentication)

**State Management:**
- Zustand 4.5.4
- React Hook Form 7.51.5
- Zod 3.23.8

**External Integrations:**
- GoHighLevel (GHL) API
- QRCode 1.5.4

---

## Key Features

- **Event Ticketing System** - Create and manage events with multiple ticket types
- **QR Code Generation** - Automatic QR codes for order validation
- **GHL Webhook Integration** - Real-time order processing from GoHighLevel
- **Data Synchronization** - Bi-directional sync between GHL and Supabase
- **Role-Based Access Control** - SuperAdmin, Admin, and Member roles
- **User Management** - SuperAdmin can create and delete users
- **Real-Time Updates** - Socket.IO for live sync progress
- **Ticket Validation** - Update ticket status (live/used/cancelled)

---

## Project Structure

```
qr-project-nextjs13-shadcn-supabase-v3/
├── app/                    # Next.js 13 App Router
│   ├── (public)/           # Public routes
│   ├── (auth)/             # Authentication pages
│   ├── (admin)/            # Admin portal (protected)
│   ├── (superadmin)/       # SuperAdmin portal (protected)
│   ├── (members)/          # Members portal (protected)
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Shadcn UI components
│   ├── admin/              # Admin components
│   ├── superadmin/         # SuperAdmin components
│   └── global/             # Global components
├── lib/                    # Utility libraries
├── services/               # Service layer (API interactions)
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
│   ├── supabase/           # Supabase clients
│   └── qrapp/              # QR code helpers
├── hoc/                    # Higher-Order Components (route protection)
├── hooks/                  # Custom React hooks
├── public/                 # Static assets & generated JSON
├── docs/                   # Documentation (you are here)
├── server.js               # Custom Express + Socket.IO server
└── server.prod.js          # Production server config
```

---

## Contributing

When updating documentation:

1. Follow the established structure and style
2. Include code examples with proper syntax highlighting
3. Add TypeScript type definitions where applicable
4. Link to related documentation
5. Keep examples practical and tested
6. Update the session log in the root directory

---

## Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated:** December 31, 2025
