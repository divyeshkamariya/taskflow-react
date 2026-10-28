# TaskFlow (React)

A task manager built with **React** only. There is no backend and no database: everything runs in the
browser and your tasks are saved in `localStorage`, so the app works offline and needs no setup.

> **Live demo:** _add your Vercel / Netlify / GitHub Pages link here_

<!--
Add 2 or 3 screenshots to docs/screenshots and uncomment:

![Dashboard](docs/screenshots/dashboard.png)
![Kanban board](docs/screenshots/kanban.png)
![Dark mode](docs/screenshots/dark.png)
-->

## Features

- **Task CRUD:** create, edit, delete and complete tasks (title, description, priority, category, due date, status)
- **Search, filters and sorting:** by status, category and deadline (overdue / today / upcoming / none), 7 sort options
- **Pagination:** 5, 10 or 20 tasks per page
- **Kanban board:** drag a card to another column, or use the "Move to" menu (works with keyboard and touch)
- **Calendar view:** tasks shown on their due dates, month navigation
- **Reminders:** overdue tasks and tasks due in the next 3 days
- **Dashboard analytics:** stat cards, progress bar, status pie chart and category bar chart (Recharts)
- **Dark mode:** remembers your choice, defaults to your system theme
- **Backup:** export all tasks to a JSON file and import them back
- **Sample data:** one click to fill the app with demo tasks
- **Keyboard shortcuts:** `N` new task, `/` focus search, `Esc` close dialogs
- **Responsive and accessible:** mobile sidebar, labelled controls, `aria-live` page status

## Tech stack

| Area    | Tools                                           |
| ------- | ----------------------------------------------- |
| UI      | React 19, hooks, Lucide icons, Recharts         |
| Build   | Vite                                            |
| Styling | Plain CSS with CSS variables (light and dark)   |
| State   | `useState`, `useMemo`, custom hooks             |
| Storage | Browser `localStorage`                          |
| Quality | ESLint, Prettier, Vitest, React Testing Library |
| CI      | GitHub Actions (lint, test, build)              |

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command              | What it does                |
| -------------------- | --------------------------- |
| `npm run dev`        | Start the dev server        |
| `npm run build`      | Production build in `dist/` |
| `npm run preview`    | Serve the production build  |
| `npm run lint`       | Run ESLint                  |
| `npm test`           | Run all tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode     |

## Project structure

```
src/
  pages/Dashboard.jsx      Main screen: wires filters, views and dialogs together
  components/              TaskCard, TaskModal, KanbanBoard, TaskCalendar, TaskCharts,
                           TaskReminders, SettingsModal, Sidebar, Navbar, StatCard, ThemeToggle
  hooks/
    useTasks.js            Task state + save to localStorage on every change
    useSettings.js         Display name
    useTheme.js            Light / dark mode
  utils/
    taskFilters.js         Pure functions: filter, sort, paginate, stats, reminders
    storage.js             localStorage + validation + backup file helpers
    sampleData.js          Demo tasks
  test/setup.js            Vitest setup
```

### How the data flows

1. `useTasks` loads tasks from `localStorage` (validated by `sanitizeTask`, so corrupted data cannot crash the app).
2. `Dashboard` runs `filterTasks` → `sortTasks` → `paginate` inside `useMemo`.
3. Every add / edit / delete updates state; an effect then saves the new list to `localStorage`.

Business logic lives in plain functions (`utils/`) instead of components, which keeps components small and makes the logic easy to test.

## Testing

35 tests cover the filter/sort/paginate/stats helpers, localStorage validation and backup import/export,
the Kanban board (drag and drop and the move menu), and the full dashboard flow (create a task, reload,
search, filter, paginate, complete, delete, load sample data).

## Deploy (free)

- **Vercel / Netlify:** import the GitHub repo. Build command `npm run build`, output directory `dist`.
- **GitHub Pages:** run `npm run build`, then publish the `dist` folder (for example with the `gh-pages` package).
  The build uses relative paths (`base: "./"`), so sub-paths work.

## Good to know

- Data is stored **per browser**. Clearing site data deletes your tasks, so use **Settings → Export backup**.
- There are no accounts, so the app is single-user by design.

## Ideas to extend it

- Subtasks and tags
- Recurring tasks
- Browser notifications for reminders (Notification API)
- Drag to reorder inside a Kanban column
- Installable PWA with offline cache
- Sync with a backend (the data layer is isolated in `useTasks` and `utils/storage.js`, so it can be swapped)

## Interview talking points

- Why filtering logic is in pure functions and how that helped testing
- Why `useMemo` is used for the filter → sort → paginate pipeline
- How invalid or corrupted `localStorage` data is handled (`sanitizeTask`)
- Why the charts library is loaded with `React.lazy` (smaller first load)
- How drag and drop works with the HTML5 API, and why a keyboard/touch alternative exists
- Why date strings (`YYYY-MM-DD`) are compared instead of `Date` objects (no timezone bugs)

## Resume bullets

- Built **TaskFlow**, a responsive React task manager with Kanban drag-and-drop, calendar, deadline reminders and Recharts analytics; data persists in `localStorage` with validation and JSON backup/import.
- Implemented search, multi-filter, 7 sort modes and pagination as pure, unit-tested functions; wrote 35 Vitest + React Testing Library tests and a GitHub Actions CI pipeline (lint, test, build).
- Added dark mode, keyboard shortcuts and accessible controls; reduced the initial bundle by lazy-loading the charts library.
