# Hunchie Dashboard

A gentle, pastel website/dashboard for tracking posture with Hunchie — your stood-up cat toy / posture buddy. Built to match the **Cotton Candy Sunset** style guide (Josefin Sans, Outfit, pastel pinks, purples, yellows, brown, teal).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Features

- **Onboarding** – Name + Bluetooth connection flow (Web Bluetooth API; falls back to demo mode if unavailable or user skips).
- **Session tracking** – Start a session, see session number and live timer.
- **Hit/slouch logs** – Log events with time, type (hit/slouch), and severity (light/medium/heavy). In production these would come from the Hunchie device; for now use the demo buttons.
- **Hunchie reactions** – Avatar mood reflects recent activity: happy (no recent hits), calm (few), sad (several), annoyed (many/heavy).
- **End-of-session summary** – Duration, total events, hits vs slouches, severity breakdown.
- **Optional notes** – On the summary screen: rate environment comfort (chair, floor, cushion, other), environment state (noisy, calm, mixed), and free-text energy/emotional state.
- **Trends** – Overview (session count, total events, avg per session, total time) and a list of past sessions (from dashboard when no session is active).

## Tech stack

- **React 18** + **TypeScript**
- **Vite**
- **React Router**
- **CSS modules** + CSS variables for the Cotton Candy Sunset palette
- **localStorage** for persistence (sessions, onboarding state)

## Replacing Hunchie avatars

The app uses simple circular avatars for Hunchie’s four moods (happy, sad, annoyed, calm). To use your real Hunchie illustrations from the style tile, replace or extend `src/components/HunchieAvatar.tsx` to render images (e.g. from `public/hunchie-happy.png`, etc.) based on the `mood` prop.

## Bluetooth

The onboarding step “Find Hunchie” uses the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API). It’s only available in supported browsers (e.g. Chrome) and secure contexts (HTTPS or localhost). When not available or when the user skips, the app continues in demo mode and you can log hits manually.
