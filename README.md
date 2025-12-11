# Startup HQ

A clean, minimal React + TypeScript workspace app with notes, tasks, and recipe cards.

## Tech Stack

- **React 18** + **Vite 5** + **TypeScript**
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **Context + useReducer** for state management
- **@dnd-kit** for drag-and-drop kanban board

## Features

- 📝 **Notes** - Markdown editor with live preview
- ✅ **Tasks** - Kanban board with drag-and-drop
- 🍳 **Recipe Cards** - Gallery with live card builder
- 📁 **Files** - Drag-drop file list (in-memory only)
- ⚙️ **Settings** - Dark/light mode toggle

**Note:** All data is stored in memory and resets on page refresh. No backend calls.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

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

- [ ] Wire up backend for data persistence
- [ ] Add real authentication
- [ ] Implement whiteboard canvas
- [ ] Add PDF export for recipe cards
- [ ] Add real-time collaboration
