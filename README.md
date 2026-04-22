# Meeting Cost App

A minimal, mobile-first web application that calculates the real-time cost of a meeting. Runs entirely in the browser — no backend required. Designed for hosting on GitHub Pages.

## Overview

The core idea: open the app → select how many people are in each role → click Start → see the live meeting cost.

No names, no individual entries, no complexity.

## Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML |
| Styling | CSS (mobile-first) |
| Logic | Vanilla JavaScript |
| Persistence | localStorage |
| Hosting | GitHub Pages |

**Primary target:** Safari on iPhone  
**Secondary target:** Desktop browsers

## UX Flow

### Step 1 – Open App
User lands directly on the main screen.

### Step 2 – Select Team Composition
User sees role tiles with increment/decrement controls:

```
[ Manager   -  2  + ]
[ Senior    -  3  + ]
[ Mid       -  5  + ]
[ Junior    -  1  + ]
```

### Step 3 – Start Meeting
User taps **Start**.

### Step 4 – Live View
App displays:
- **Large live cost** (primary focus)
- Time elapsed
- Total hourly rate
- Number of participants

### Step 5 – Stop / Reset
User can Pause, Resume, or Reset.

## Data Model

Roles are defined as counts, not individuals:

```js
roles = [
  { name: "Manager", rate: 120, count: 2 },
  { name: "Senior",  rate: 100, count: 3 },
  { name: "Mid",     rate: 70,  count: 5 },
  { name: "Junior",  rate: 50,  count: 1 }
]
```

Derived values:
- `totalParticipants` = sum of all counts
- `totalHourlyRate` = sum of `rate × count` for each role

## Cost Calculation

```
meetingCost = totalHourlyRate × elapsedTimeInHours
```

Where:

```
elapsedTimeInHours = (Date.now() - startTime - totalPausedMs) / 3600000
```

Time is always based on timestamps (`Date.now()`), not incremental counters.

## Timer Logic

**State:**
- `startTime` — timestamp when meeting started
- `pausedAt` — timestamp when paused (or `null`)
- `totalPausedMs` — accumulated pause duration
- `isRunning` — boolean

**Behavior:**
- Start → set `startTime`
- Pause → store `pausedAt`
- Resume → add `(Date.now() - pausedAt)` to `totalPausedMs`
- Reset → clear all state

The render loop runs every ~250–500 ms and recalculates cost from timestamps on every tick.

## UI Structure

**View 1 – Main (default)**
- Role tiles with +/− controls
- Total hourly cost preview
- Start button (sticky at bottom)

**View 2 – Active Meeting**
- Large live cost display
- Timer
- Secondary stats (participants, hourly rate)
- Pause / Reset controls

**View 3 – Settings (optional)**
- Edit role names and hourly rates
- Select currency

## Storage (localStorage)

| Key | Contents |
|---|---|
| `meetingCost:roles` | Role definitions (name, rate) and last-used counts |
| `meetingCost:settings` | Selected currency and other preferences |

No backend, no sync, no account required.

## Currency Support

Formatted using the browser's `Intl.NumberFormat` API:

```js
new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })
```

Supported currencies: **PLN**, **EUR**, **USD**

## Mobile Design Principles

- Large, thumb-friendly buttons
- Single-column layout
- No hover interactions
- Minimum font size 16px (prevents iOS zoom)
- Sticky Start button at the bottom
- High-contrast UI

## Performance

- No frameworks — fast initial load
- Minimal JS bundle
- UI updates ~4× per second
- No heavy animations

## MVP Scope

**Must have:**
- Role-based participant counting
- Hourly rate per role
- Start / Pause / Reset controls
- Live cost calculation from timestamps
- localStorage persistence
- Mobile-friendly UI

## Future Extensions

- Presets (e.g. "Weekly Standup")
- Cost-per-minute view
- Dark mode
- PWA / Add to Home Screen
- Cost threshold alerts (e.g. alert when cost exceeds $100)

## Summary

Meeting Cost App is a lightweight, stateless frontend tool that:
- models a meeting as role counts with associated hourly rates,
- calculates cost in real time using timestamp-based elapsed time,
- runs entirely in the browser,
- requires zero backend infrastructure.

**Focus: Speed · Simplicity · Mobile UX**
