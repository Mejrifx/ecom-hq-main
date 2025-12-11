# Startup HQ

A clean, minimal React + TypeScript workspace app with notes, tasks, and recipe cards.

## Tech Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Supabase** for backend and database
- **React Query** for data fetching and caching
- **Context + useReducer** for state management
- **@dnd-kit** for drag-and-drop kanban board

## Features

- 📝 **Notes** - Markdown editor with live preview
- ✅ **Tasks** - Kanban board with drag-and-drop
- 🍳 **Recipe Cards** - Gallery with live card builder
- 📁 **Files** - Drag-drop file list
- ⚙️ **Settings** - Dark/light mode toggle

**Note:** All data is now persisted to Supabase database. See `SUPABASE_SETUP.md` for database setup instructions.

## Getting Started

```bash
# Install dependencies
npm install

# Set up Supabase database (see SUPABASE_SETUP.md)
# 1. Run the SQL schema in your Supabase SQL Editor
# 2. Verify .env file has your Supabase credentials

# Set up authentication (see AUTHENTICATION_SETUP.md)
# 1. Create user accounts in Supabase dashboard
# 2. Share credentials securely with your friend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Important:** Before running the app, make sure to:
1. Run the database schema from `supabase-schema.sql` in your Supabase SQL Editor
2. Verify your `.env` file contains your Supabase URL and anon key
3. Create user accounts (see `AUTHENTICATION_SETUP.md`)
4. The app now requires login - you'll see a login page instead of "Enter" button

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   ├── Modal.tsx
│   └── Toast.tsx
├── contexts/       # React Context providers
│   ├── ThemeContext.tsx
│   └── FakeDataContext.tsx
├── pages/          # Route pages
│   ├── Landing.tsx
│   ├── Dashboard.tsx
│   ├── Notes.tsx
│   ├── Tasks.tsx
│   ├── Whiteboard.tsx
│   ├── RecipeCards.tsx
│   ├── Files.tsx
│   └── Settings.tsx
├── router.tsx      # React Router config
├── types.ts        # TypeScript types
├── App.tsx
├── main.tsx
└── index.css       # Tailwind + custom styles
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page with "Enter" button |
| `/dashboard` | Stats, quick create, recent activity |
| `/notes` | Markdown notes manager |
| `/tasks` | Kanban task board |
| `/whiteboard` | Placeholder (coming soon) |
| `/recipe-cards` | Recipe card gallery & builder |
| `/files` | Drag-drop file manager |
| `/settings` | Theme toggle & account fields |

## TODO

- [x] Wire up backend for data persistence (Supabase)
- [x] Add real authentication (Supabase Auth)
- [ ] Implement whiteboard canvas
- [ ] Add PDF export for recipe cards
- [ ] Add real-time collaboration
