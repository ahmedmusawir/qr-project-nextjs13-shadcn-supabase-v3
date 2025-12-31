# Getting Started

This guide will help you set up the QR Project V3 development environment on your local machine.

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Check Command |
|----------|----------------|---------------|
| **Node.js** | 18.0.0 or higher | `node --version` |
| **npm** | 9.0.0 or higher | `npm --version` |
| **Git** | Latest | `git --version` |

### Required Accounts

1. **Supabase Account** - [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **GoHighLevel (GHL) Account** - [https://www.gohighlevel.com](https://www.gohighlevel.com)
   - Obtain API access token
   - Note your location ID

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd qr-project-nextjs13-shadcn-supabase-v3
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
```

This will install all required packages including:
- Next.js 13.5.6
- React 18
- Supabase SSR 0.5.1
- Zustand 4.5.4
- Socket.IO 4.8.0
- And all other dependencies

**Note:** The installation may take 2-5 minutes depending on your internet connection.

---

## Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

If `.env.example` doesn't exist, create `.env.local` manually.

### 2. Configure Environment Variables

Open `.env.local` and add the following variables:

```bash
# ============================================
# API URLs
# ============================================
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001

# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ============================================
# GoHighLevel (GHL) Configuration
# ============================================
NEXT_PUBLIC_GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_ACCESS_TOKEN=your-ghl-access-token
NEXT_PUBLIC_GHL_LOCATION_ID=your-ghl-location-id
```

### 3. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret!)

### 4. Get Your GHL Credentials

1. Log in to your GoHighLevel account
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **API Access Token** → `GHL_ACCESS_TOKEN`
   - **Location ID** → `NEXT_PUBLIC_GHL_LOCATION_ID`

**Security Warning:** Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Database Setup

### 1. Create Supabase Tables

Run the following SQL in your Supabase SQL Editor (**Database** → **SQL Editor**):

#### Table: ghl_qr_orders

```sql
CREATE TABLE ghl_qr_orders (
  order_id TEXT PRIMARY KEY,
  location_id TEXT,
  total_paid NUMERIC,
  payment_status TEXT,
  payment_currency TEXT,
  order_status TEXT,
  contact_id TEXT,
  contact_firstname TEXT,
  contact_lastname TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  date_added TIMESTAMPTZ,
  event_id TEXT,
  event_name TEXT,
  event_image TEXT,
  event_ticket_price NUMERIC,
  event_ticket_currency TEXT,
  event_available_qty INTEGER,
  event_ticket_qty INTEGER,
  event_ticket_type TEXT,
  qr_code_image TEXT,
  ticket_quantities JSONB,
  inserted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: ghl_qr_tickets

```sql
CREATE TABLE ghl_qr_tickets (
  ticket_id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES ghl_qr_orders(order_id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  status TEXT DEFAULT 'live'
);
```

#### Table: ghl_qr_users

```sql
CREATE TABLE ghl_qr_users (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Table: ghl_qr_fields

```sql
CREATE TABLE ghl_qr_fields (
  id SERIAL PRIMARY KEY,
  product_id TEXT UNIQUE,
  field_id TEXT,
  field_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Verify Tables

In Supabase dashboard, navigate to **Database** → **Tables** and verify all 4 tables were created:
- ✅ ghl_qr_orders
- ✅ ghl_qr_tickets
- ✅ ghl_qr_users
- ✅ ghl_qr_fields

### 3. Create Initial SuperAdmin User

You need to create your first SuperAdmin user manually:

1. Go to **Authentication** → **Users** in Supabase
2. Click **Add User**
3. Fill in:
   - Email: `your-email@example.com`
   - Password: `your-secure-password`
   - Auto Confirm User: ✅ Yes
4. After creating, click on the user
5. Scroll to **User Metadata** and add:

```json
{
  "is_qr_superadmin": 1,
  "is_qr_admin": 1,
  "is_qr_member": 0,
  "name": "Your Name"
}
```

6. Save changes

7. Also add this user to the `ghl_qr_users` table (run in SQL Editor):

```sql
INSERT INTO ghl_qr_users (id, name, email, type)
VALUES (
  'user-uuid-from-auth',
  'Your Name',
  'your-email@example.com',
  'Super Admin'
);
```

---

## Running the Application

### Development Mode

Start the development server with Socket.IO:

```bash
npm run dev
```

**Expected Output:**

```
Server is running on port 4001
Next.js ready on http://localhost:4001
Socket.IO server running
```

### Open in Browser

Navigate to: **http://localhost:4001**

You should see the home page.

### Test Authentication

1. Go to **http://localhost:4001/auth**
2. Log in with the SuperAdmin credentials you created
3. You should be redirected to **http://localhost:4001/superadmin-portal**

---

## Verification Steps

### 1. Verify Development Server

```bash
# Server should be running on port 4001
curl http://localhost:4001
```

You should receive HTML content.

### 2. Verify Socket.IO Connection

1. Open browser DevTools → Console
2. Navigate to any admin page
3. Look for Socket.IO connection messages
4. You should see: `Socket connected: <socket-id>`

### 3. Verify API Routes

Test the authentication API:

```bash
curl http://localhost:4001/api/auth/getUser
```

You should receive a JSON response (may be `null` if not logged in).

### 4. Verify Supabase Connection

1. Log in to the application
2. Check browser DevTools → Network tab
3. Look for requests to `supabase.co`
4. Verify no CORS errors

---

## Common Scripts

### Development

```bash
# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Type Checking

```bash
# Run TypeScript compiler (check only)
npx tsc --noEmit
```

---

## Troubleshooting

### Issue: Port 4001 Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4001
```

**Solution:**
```bash
# Find process using port 4001
lsof -i :4001

# Kill the process
kill -9 <PID>

# Or use a different port (edit server.js)
```

### Issue: Supabase Connection Failed

**Error:**
```
Error: Failed to fetch from Supabase
```

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check Supabase project status (not paused)
4. Check network connectivity

### Issue: GHL API Returns 401 Unauthorized

**Error:**
```
Error: 401 Unauthorized from GHL API
```

**Solutions:**
1. Verify `GHL_ACCESS_TOKEN` is valid
2. Check token hasn't expired
3. Verify API permissions in GHL dashboard

### Issue: Module Not Found Errors

**Error:**
```
Module not found: Can't resolve '@/components/...'
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### Issue: Database Tables Don't Exist

**Error:**
```
Error: relation "ghl_qr_orders" does not exist
```

**Solution:**
1. Go to Supabase SQL Editor
2. Re-run the table creation SQL (see Database Setup section above)
3. Verify tables in Database → Tables

### Issue: Socket.IO Not Connecting

**Symptoms:**
- No real-time sync updates
- Console shows connection errors

**Solutions:**
1. Verify server is running (`npm run dev`)
2. Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`
3. Clear browser cache
4. Check browser console for CORS errors

---

## Next Steps

Now that your development environment is set up:

1. **Explore the Application**
   - Navigate to different portals (Admin, SuperAdmin)
   - Test creating users, viewing orders, managing tickets

2. **Read Architecture Documentation**
   - [System Overview](/docs/architecture/overview.md)
   - [Data Flow](/docs/architecture/data-flow.md)
   - [Authentication](/docs/architecture/authentication.md)

3. **Set Up GHL Webhook** (Optional for development)
   - See [Webhook Integration](/docs/api/webhook-integration.md)

4. **Review Development Workflow**
   - See [Development Workflow](/docs/guides/development-workflow.md)

---

## Production Deployment

For production deployment instructions, see the [Deployment Guide](/docs/guides/deployment-guide.md).

---

**Need Help?**

If you encounter issues not covered here:
1. Check the [Development Workflow](/docs/guides/development-workflow.md) guide
2. Review the [Architecture](/docs/architecture/overview.md) documentation
3. Contact the development team

---

**Last Updated:** December 31, 2025
