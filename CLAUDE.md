# CLAUDE.md — Meeting Cost App

## Project Overview

Static, frontend-only web app that calculates the real-time cost of a meeting based on role counts and hourly rates. No backend, no build step, no framework — pure HTML + CSS + JS deployed on GitHub Pages.

## File Structure

```
index.html      # App shell and markup
style.css       # Mobile-first styles
app.js          # All application logic
```

No package.json, no node_modules, no bundler. Open `index.html` directly in a browser to run locally.

## Architecture

### Views
The app has three logical views rendered in a single HTML file (show/hide via JS):

| View | ID | Purpose |
|---|---|---|
| Main | `#view-main` | Role tile selection + Start button |
| Active | `#view-active` | Live cost display + timer controls |
| Settings | `#view-settings` | Edit role names, rates, currency |

### Data Model

```js
roles = [
  { name: "Manager", rate: 120, count: 2 },
  { name: "Senior",  rate: 100, count: 3 },
  { name: "Mid",     rate: 70,  count: 5 },
  { name: "Junior",  rate: 50,  count: 1 }
]
```

Derived on every render tick:
- `totalParticipants` = `roles.reduce((s, r) => s + r.count, 0)`
- `totalHourlyRate` = `roles.reduce((s, r) => s + r.rate * r.count, 0)`

### Cost Formula

```
meetingCost = totalHourlyRate × (elapsedMs / 3_600_000)
elapsedMs   = Date.now() - startTime - totalPausedMs
```

Always derive from timestamps — never use an incremental counter.

### Timer State

```js
{
  startTime:     Number | null,   // Date.now() at start
  pausedAt:      Number | null,   // Date.now() at pause
  totalPausedMs: Number,          // accumulated pause time
  isRunning:     Boolean
}
```

Render loop interval: **250–500 ms**.

### localStorage Keys

| Key | Value |
|---|---|
| `meetingCost:roles` | JSON array of role objects (name, rate, count) |
| `meetingCost:settings` | `{ currency: "PLN" \| "EUR" \| "USD" }` |

Load from storage on app init. Save on every change.

### Currency Formatting

```js
new Intl.NumberFormat('pl-PL', { style: 'currency', currency: settings.currency })
```

Supported: `PLN`, `EUR`, `USD`.

## Key Constraints

- **No frameworks** — vanilla JS only, keep load fast.
- **Timestamp-based time** — never `setInterval` counter accumulation.
- **Mobile-first** — minimum tap target 44px, font size ≥ 16px (prevents iOS zoom), single-column layout, no hover states.
- **No backend** — everything in localStorage, no network calls.

## MVP Checklist

- [ ] Role tiles with +/− increment
- [ ] `totalHourlyRate` preview on main view
- [ ] Start / Pause / Resume / Reset
- [ ] Live cost updating every ~250 ms
- [ ] localStorage persistence
- [ ] Currency selector (PLN / EUR / USD)

## Future Extensions (not in MVP)

- Meeting presets ("Weekly Standup", etc.)
- Cost-per-minute view
- Dark mode
- PWA manifest + service worker
- Cost threshold alerts
