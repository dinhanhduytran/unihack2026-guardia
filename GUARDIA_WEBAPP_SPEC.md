# Guardia Web App Spec (React)

## Recommendation: React Vite (not Next.js) for this phase

Use **React + Vite + TypeScript** first.

- This project is UI-heavy, mobile-first, and does not need SSR/SEO initially.
- The source of truth includes the app prototype (`guardia-screens.html`) and welcome entry prototype (`safe-router-welcome-v2.html`).
- Vite gives faster setup, faster iteration, and simpler deployment for demo/hackathon velocity.
- If later you need auth + server rendering + SEO pages, migrate to Next.js.

## Product Scope

Build a women's safety **mobile-first web app** called **Guardia** based on:

- Existing references: `guardia-screens.html`, `safe-router-welcome-v2.html`
- New clarified prompt (9 screens total including welcome entry, 390x844 primary viewport)

Target behavior:

- Feels like an app shell on mobile (one-handed use).
- Consistent design system across all 9 screens.
- Bottom nav appears on screens 3, 4, 5, 6.
- Screen 7 and 8 are immersive overlays (no bottom nav).

## Tech Stack

- React 18 + Vite + TypeScript
- React Router (screen routing)
- CSS Modules (or plain CSS) with design tokens in `:root`
- Optional animation helper: Framer Motion (or CSS keyframes only)

## Project Structure

```txt
guardia-web/
  src/
    app/
      App.tsx
      routes.tsx
    styles/
      tokens.css
      globals.css
      animations.css
    components/
      layout/
        PhoneFrame.tsx
        StatusBar.tsx
        BottomNav.tsx
        BottomSheet.tsx
      ui/
        PrimaryButton.tsx
        GhostButton.tsx
        Card.tsx
        InputField.tsx
        Badge.tsx
        StatusDot.tsx
      map/
        MapCanvas.tsx
        RouteCard.tsx
        IncidentZone.tsx
    screens/
      S0Welcome.tsx
      S1Onboarding.tsx
      S2Permissions.tsx
      S3Home.tsx
      S4MapPreJourney.tsx
      S5JourneyActive.tsx
      S6Companion.tsx
      S7AICall.tsx
      S8Emergency.tsx
    state/
      appStore.ts
      journeyStore.ts
    data/
      mockRoutes.ts
      mockAlerts.ts
```

## Design Tokens (must match prompt)

Add to `src/styles/tokens.css`:

```css
:root {
  --bg: #FAF7F5;
  --surface: #FFFFFF;
  --surface-raised: #F3EDE8;
  --coral: #E8735A;
  --coral-light: #F2A48C;
  --coral-pale: #FDF0EB;
  --teal: #3AAFA9;
  --teal-light: #E8F7F6;
  --amber: #E8A838;
  --text-primary: #2D1F1A;
  --text-secondary: #7A6260;
  --text-muted: #B0958F;
  --border: rgba(232,115,90,0.12);
  --border-neutral: #EDE5E0;
  --shadow: rgba(45,31,26,0.08);
}
```

Typography:

- Display/hero: `Lora` italic
- Body/captions: `Nunito`
- Mobile-first default text scale from prompt

## Routing Model

- `/` -> S0 Welcome
- `/onboarding` -> S1
- `/permissions` -> S2
- `/home` -> S3
- `/map` -> S4
- `/journey` -> S5
- `/companion` -> S6
- `/ai-call` -> S7
- `/emergency` -> S8

## Shared Components and Rules

1. **App viewport**
   - Real app mode uses full viewport (`100dvh`) and full width (`100vw`) by default.
   - `390x844` is the primary design target, not a fixed device frame wrapper in production UI.

2. **BottomNav**
   - 64px height, 4 tabs: Home, Map, Companion, Profile.
   - Active tab uses coral label/icon tint.

3. **Buttons**
   - Primary: coral gradient, white text, 54px height, radius 14.
   - Ghost: transparent, 1.5px coral border/text, 54px.

4. **Cards/Inputs**
   - Cards: white, border neutral, radius 14, padding 18, soft shadow.
   - Input: 48px height, 10px radius, coral focus ring.

5. **BottomSheet**
   - White, top radius 20, drag handle.
   - S4 default expanded ~38%, S5 ~28%.

## Screen-by-Screen Build Notes

### S0 Welcome
- Build from `safe-router-welcome-v2.html` visual language:
  - Greeting area ("Hello, Welcome back!")
  - Center brand hero orb + "Safe Router"
  - Feature pills + primary CTA
- Primary CTA text: `Get Started ->`.
- CTA action: route to `/onboarding` (S1Onboarding).
- No bottom nav.

### S1 Onboarding
- Recreate glowing orb + centered shield + brand wordmark.
- Bottom card with 3 fields and "Continue ->".
- No bottom nav.

### S2 Permissions
- Two permission cards: Location and Mic.
- CTA buttons inside card rows.
- After both permissions are granted (`location = granted` and `mic = granted`), show a primary `Next` button.
- `Next` action: route to `/home` (S3 Home).

### S3 Home
- Greeting header + avatar.
- Search bar card.
- Horizontal quick destination chips.
- Route cards + nearby alerts card.
- Bottom nav active: Home.

### S4 Map (Pre-journey)
- Top floating search.
- Stylized map canvas with incident circles + user dot pulse.
- Bottom sheet with route cards and primary "Start Journey ->".
- Tapping route card updates highlighted route style.

### S5 Journey (Active)
- Full map with active route line.
- Top HUD (ETA + SAFETY).
- Bottom sheet with route status and action buttons:
  - "I'm Home Safe" (teal ghost)
  - "SOS" (coral primary)

### S6 Companion
- Animated avatar pulse.
- Speech bubble + animated waveform.
- Listening indicator and active-route status row.
- "End Companion" ghost button.

### S7 AI Call
- Dark immersive UI (`#1A1210`).
- Big avatar, transcript bubble, user thumbnail.
- Call control row: Mute/Camera/Speaker/Emergency.
- No bottom nav.

### S8 Emergency
- Overlay card centered, countdown ring, checklist.
- "I'm Safe" + "Call Now" actions.
- No bottom nav.

## Interaction + State Model (frontend only)

Use a simple global store (Zustand/Redux/context):

- `user.name`
- `permissions.location`, `permissions.mic`
- `journey.status` (`idle | suggested | active | incident | emergency`)
- `journey.selectedRouteId`
- `journey.etaMin`, `journey.distanceKm`, `journey.safetyScore`
- `alerts.nearbyCount`
- `companion.isListening`, `companion.transcript`

Transition examples:

- S0 "Get Started" -> route `/onboarding`
- S2 both permissions granted -> show `Next` -> route `/home`
- S4 "Start Journey" -> set `journey.status = active` -> route `/journey`
- Incident zone reached -> route `/companion`
- Voice trigger "Help me" -> route `/emergency`

## Animations (from existing HTML patterns)

Mirror these keyframes from `guardia-screens.html`:

- `pulseRing` for user location pulse
- `blink` for status dots
- `wave` for voice bars
- `spin` for emergency checklist pending item
- `breathe` / `callPulse` for companion avatar glow

## Delivery Plan

1. Bootstrap Vite app + fonts + tokens + base shell.
2. Build shared UI components and nav.
3. Implement screens S1-S3.
4. Implement map screens S4-S5 with bottom sheet interactions.
5. Implement S6-S8 immersive states + animations.
6. Add responsive behavior for widths `<= 430px` and desktop preview mode.
7. Add mock state transitions and QA pass.

## Acceptance Criteria

- All 9 screens exist (S0-S8) and match prompt look/feel.
- App entry at `/` shows S0 Welcome and `Get Started` navigates to `/onboarding` (S1).
- On S2, `Next` appears only after Location and Mic permissions are both granted.
- Pressing S2 `Next` navigates to `/home` (S3).
- Mobile-first layout validated at `390x844`.
- Bottom nav appears only on S3-S6.
- S4/S5 bottom sheets and route card selection work.
- Core animations are visible and smooth.
- No aggressive warning styling; warm, calm, trustworthy mood preserved.

