# FinTrack — Frontend

A personal finance tracker. This is the frontend, built with **React + Vite + TypeScript** and plain **CSS Modules**.

> Current status: project scaffold with a placeholder home page. Features (auth, onboarding, dashboard) come next.

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server (hot reload)         |
| `npm run build`   | Type-check and build for production        |
| `npm run preview` | Preview the production build locally       |

## Project structure

```
frontend/
├── index.html          # App entry HTML
├── vite.config.ts      # Vite config
├── tsconfig.json       # TypeScript config
└── src/
    ├── main.tsx        # React entry point
    ├── App.tsx         # Placeholder home page
    ├── App.module.css  # Home page styles
    └── index.css       # Global styles + design tokens
```

## Planned roadmap

1. Authentication (register / login)
2. Onboarding (quick setup with dropdowns)
3. Dashboard (transactions table + charts)
4. Dockerize
