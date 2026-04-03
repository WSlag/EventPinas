# EventPH Design System

**Version:** 1.0  
**Last Updated:** April 2026  
**Stack:** React + Vite + Tailwind CSS v3 + Firebase PWA

This file is the single source of truth for all UI decisions in EventPH. Every component, spacing, color, font, and border-radius must reference this document. This prevents the inconsistency problems from previous apps (mismatched pill rounding, random padding, clashing fonts).

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Border Radius (Pills & Cards)](#5-border-radius-pills--cards)
6. [Shadows & Elevation](#6-shadows--elevation)
7. [Component Tokens](#7-component-tokens)
8. [Buttons](#8-buttons)
9. [Pills & Badges](#9-pills--badges)
10. [Input Fields](#10-input-fields)
11. [Cards](#11-cards)
12. [Iconography](#12-iconography)
13. [Motion & Animation](#13-motion--animation)
14. [Responsive Breakpoints](#14-responsive-breakpoints)
15. [Tailwind Config](#15-tailwind-config)
16. [Do's and Don'ts](#16-dos-and-donts)

---

## 1. Design Philosophy

EventPH is a **mobile-first community platform** for Filipino event organizers outside NCR. The design must feel:

- **Warm and accessible** — not cold or corporate
- **Fast and lightweight** — works on mid-range Android phones
- **Trustworthy** — organizers are handling money and guests
- **Culturally resonant** — Filipinos, Taglish context, social and celebration-focused

### Design Personality
**Friendly Utility** — clean enough to feel professional, warm enough to feel approachable. Think: a well-organized fiesta program, not a Fortune 500 dashboard.

---

## 2. Color System

### Brand Colors

```css
/* tailwind.config.js → extend.colors */

:root {
  /* Primary — Coral/Sunset (energy, celebration, Filipino warmth) */
  --color-primary-50:  #FFF1EE;
  --color-primary-100: #FFE0D9;
  --color-primary-200: #FFC2B4;
  --color-primary-300: #FF9A84;
  --color-primary-400: #FF6B4A;   /* ← Primary CTA */
  --color-primary-500: #F04E2A;
  --color-primary-600: #D93A18;
  --color-primary-700: #B52E12;
  --color-primary-800: #8F2410;
  --color-primary-900: #6B1A0C;

  /* Secondary — Deep Teal (reliability, trust, night markets) */
  --color-secondary-50:  #EDFAFA;
  --color-secondary-100: #D5F5F4;
  --color-secondary-200: #AAEAE9;
  --color-secondary-300: #72D9D7;
  --color-secondary-400: #38C2BF;
  --color-secondary-500: #1FA8A5;   /* ← Secondary CTA */
  --color-secondary-600: #178A88;
  --color-secondary-700: #126E6C;
  --color-secondary-800: #0E5452;
  --color-secondary-900: #0A3E3D;

  /* Neutral — Warm Gray (not cold) */
  --color-neutral-50:  #FAFAF9;
  --color-neutral-100: #F5F4F2;
  --color-neutral-200: #E8E6E1;
  --color-neutral-300: #D1CEC8;
  --color-neutral-400: #A8A49C;
  --color-neutral-500: #78746C;
  --color-neutral-600: #57534E;
  --color-neutral-700: #44403C;
  --color-neutral-800: #292524;
  --color-neutral-900: #1C1917;

  /* Semantic */
  --color-success:  #16A34A;  /* green-600 */
  --color-warning:  #D97706;  /* amber-600 */
  --color-error:    #DC2626;  /* red-600 */
  --color-info:     #2563EB;  /* blue-600 */

  /* Surface */
  --color-surface-base:    #FAFAF9;  /* page background */
  --color-surface-raised:  #FFFFFF;  /* cards */
  --color-surface-overlay: #F5F4F2;  /* input backgrounds */
  --color-surface-invert:  #1C1917;  /* dark sections */
}
```

### Semantic Usage Rules

| Token | Use For | Never Use For |
|---|---|---|
| `primary-400` | Main CTA buttons, active nav, links | Decorative backgrounds |
| `primary-100` | Pill/badge backgrounds (light) | Text on white |
| `secondary-500` | Secondary buttons, icons, highlights | Danger states |
| `neutral-800` | Body text, headings | Disabled states |
| `neutral-500` | Placeholder text, meta info | Primary text |
| `neutral-200` | Dividers, borders | Text |
| `surface-raised` | Card backgrounds | Page backgrounds |
| `surface-overlay` | Input backgrounds | Card backgrounds |

### Dark Text on Background Rules

```
primary-400 background  → use WHITE text (contrast 4.8:1 ✅)
secondary-500 background → use WHITE text (contrast 4.6:1 ✅)
primary-100 background  → use primary-700 text (contrast 5.2:1 ✅)
neutral-100 background  → use neutral-800 text (contrast 10.1:1 ✅)
```

---

## 3. Typography

### Font Stack

```css
/* Google Fonts import — add to index.html */
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
```

**Why these fonts:**
- **Plus Jakarta Sans** — Modern, slightly humanist geometric sans. Warm but structured. Filipino-app friendly: readable at small sizes on Android, feels approachable not corporate. Used for headings and UI labels.
- **DM Sans** — Clean, neutral, highly legible. Perfect body text companion. Avoids the overused Inter feel while remaining professional.

### Type Scale

```js
// tailwind.config.js → extend.fontSize
// Format: [font-size, { lineHeight, letterSpacing, fontWeight }]

fontSize: {
  // Display — Hero sections, splash screens
  'display-xl': ['2.25rem',  { lineHeight: '2.75rem', letterSpacing: '-0.02em', fontWeight: '800' }],  // 36px
  'display-lg': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.02em', fontWeight: '800' }],  // 30px

  // Heading — Section titles
  'heading-xl': ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '-0.015em', fontWeight: '700' }],  // 24px
  'heading-lg': ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '-0.01em',  fontWeight: '700' }],  // 20px
  'heading-md': ['1.125rem', { lineHeight: '1.625rem', letterSpacing: '-0.01em', fontWeight: '600' }],  // 18px
  'heading-sm': ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0',        fontWeight: '600' }],  // 16px

  // Body — Content text
  'body-lg': ['1rem',    { lineHeight: '1.625rem', letterSpacing: '0',       fontWeight: '400' }],  // 16px
  'body-md': ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '0',       fontWeight: '400' }],  // 15px
  'body-sm': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0',      fontWeight: '400' }],  // 14px

  // Label — Buttons, tabs, form labels
  'label-lg': ['0.9375rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '600' }],  // 15px
  'label-md': ['0.875rem',  { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '600' }],  // 14px
  'label-sm': ['0.8125rem', { lineHeight: '1.125rem', letterSpacing: '0.02em', fontWeight: '500' }],  // 13px

  // Caption — Meta info, timestamps, helper text
  'caption-lg': ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0',      fontWeight: '400' }],  // 13px
  'caption-sm': ['0.75rem',   { lineHeight: '1.125rem', letterSpacing: '0',     fontWeight: '400' }],  // 12px

  // Overline — Category labels above headings
  'overline': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em', fontWeight: '600' }],  // 11px
}
```

### Typography Usage Rules

```
Page title (screen header)    → display-lg, Plus Jakarta Sans, neutral-900
Section heading               → heading-lg, Plus Jakarta Sans, neutral-800
Card title                    → heading-md, Plus Jakarta Sans, neutral-800
Subheading / card subtitle    → heading-sm, Plus Jakarta Sans, neutral-700
Body paragraphs               → body-md, DM Sans, neutral-700
Secondary text / description  → body-sm, DM Sans, neutral-500
Button label                  → label-md, Plus Jakarta Sans, (inherits from button)
Form label                    → label-sm, Plus Jakarta Sans, neutral-700
Input placeholder             → body-md, DM Sans, neutral-400
Helper / error text           → caption-lg, DM Sans, (semantic color)
Timestamp / meta              → caption-sm, DM Sans, neutral-400
Badge / pill label            → overline OR label-sm, Plus Jakarta Sans
Tab label                     → label-sm, Plus Jakarta Sans
```

### React Typography Components

```tsx
// src/components/ui/Typography.tsx

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const DisplayXL = ({ children, className = '' }: TypographyProps) => (
  <h1 className={`font-display text-display-xl text-neutral-900 ${className}`}>{children}</h1>
);

export const HeadingLG = ({ children, className = '' }: TypographyProps) => (
  <h2 className={`font-display text-heading-lg text-neutral-800 ${className}`}>{children}</h2>
);

export const HeadingMD = ({ children, className = '' }: TypographyProps) => (
  <h3 className={`font-display text-heading-md text-neutral-800 ${className}`}>{children}</h3>
);

export const BodyMD = ({ children, className = '' }: TypographyProps) => (
  <p className={`font-body text-body-md text-neutral-700 ${className}`}>{children}</p>
);

export const LabelMD = ({ children, className = '' }: TypographyProps) => (
  <span className={`font-display text-label-md ${className}`}>{children}</span>
);

export const Caption = ({ children, className = '' }: TypographyProps) => (
  <span className={`font-body text-caption-lg text-neutral-400 ${className}`}>{children}</span>
);

export const Overline = ({ children, className = '' }: TypographyProps) => (
  <span className={`font-display text-overline uppercase tracking-widest text-neutral-500 ${className}`}>{children}</span>
);
```

---

## 4. Spacing & Layout

### Spacing Scale

EventPH uses an **8px base grid**. All spacing values are multiples of 4px or 8px. Never use arbitrary values.

```js
// tailwind.config.js → extend.spacing
// These are ADDITIONS to Tailwind's default scale

spacing: {
  // Named tokens (use these in components for clarity)
  'space-1':  '4px',    // micro — icon gaps, tight label padding
  'space-2':  '8px',    // xs — inline element gaps
  'space-3':  '12px',   // sm — compact padding
  'space-4':  '16px',   // md — standard padding (DEFAULT)
  'space-5':  '20px',   // lg — comfortable padding
  'space-6':  '24px',   // xl — section inner padding
  'space-8':  '32px',   // 2xl — card padding, section gaps
  'space-10': '40px',   // 3xl — large gaps between sections
  'space-12': '48px',   // 4xl — hero padding
  'space-16': '64px',   // 5xl — page-level spacing
}
```

### Layout Containers

```tsx
// Page wrapper — mobile-first, max-width constrained
<div className="min-h-screen bg-surface-base">
  <div className="max-w-md mx-auto px-space-4">
    {/* content */}
  </div>
</div>

// Card grid (2 columns on mobile-plus)
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-4">

// Horizontal scroll row (chip filters, event thumbnails)
<div className="flex gap-space-2 overflow-x-auto pb-space-2 scrollbar-hide -mx-space-4 px-space-4">
```

### Padding Rules by Component

```
Page horizontal padding:      px-4 (16px) — never less on mobile
Section vertical gap:         py-6 (24px) between major sections
Card internal padding:        p-4 (16px) standard | p-5 (20px) featured
Button padding:               px-5 py-3 (large) | px-4 py-2.5 (medium) | px-3 py-1.5 (small)
Input padding:                px-4 py-3 (standard)
Pill/Badge padding:           px-3 py-1 (standard) | px-2.5 py-0.5 (compact)
List item padding:            px-4 py-3 (standard list row)
Bottom nav height:            h-16 (64px) + safe-area-inset-bottom
Top nav/header height:        h-14 (56px)
```

---

## 5. Border Radius (Pills & Cards)

**THIS IS THE MOST CRITICAL SECTION** — the previous app had inconsistent rounding. Every element must use one of these defined radius tokens only.

### Radius Scale

```js
// tailwind.config.js → extend.borderRadius

borderRadius: {
  'none':   '0px',
  'xs':     '4px',    // subtle — checkboxes, small tags
  'sm':     '6px',    // small elements
  'md':     '8px',    // DEFAULT — inputs, cards, dropdowns
  'lg':     '12px',   // cards, modals, sheets
  'xl':     '16px',   // featured cards, image thumbnails
  '2xl':    '20px',   // large modals, bottom sheets
  '3xl':    '24px',   // hero cards
  'full':   '9999px', // pills, chips, avatars, toggle switches
}
```

### Radius Usage Rules — STRICT

| Element | Radius Token | Class | Notes |
|---|---|---|---|
| **Pill / Chip / Badge** | `full` | `rounded-full` | Always — no exceptions |
| **Toggle / Switch** | `full` | `rounded-full` | Always |
| **Avatar** | `full` | `rounded-full` | Always |
| **FAB button** | `full` | `rounded-full` | Always |
| **Icon-only button** | `full` | `rounded-full` | Always |
| **Standard button (text)** | `full` | `rounded-full` | Pills for CTAs |
| **Input field** | `md` | `rounded-md` | 8px — never full |
| **Textarea** | `md` | `rounded-md` | 8px |
| **Dropdown / Select** | `md` | `rounded-md` | 8px |
| **Standard card** | `lg` | `rounded-lg` | 12px |
| **Featured card** | `xl` | `rounded-xl` | 16px |
| **Bottom sheet** | `3xl` top only | `rounded-t-3xl` | 24px top corners |
| **Modal / Dialog** | `2xl` | `rounded-2xl` | 20px |
| **Image in card** | `lg` | `rounded-lg` | Match card |
| **Image standalone** | `xl` | `rounded-xl` | 16px |
| **Tooltip** | `sm` | `rounded-sm` | 6px |
| **Snackbar / Toast** | `lg` | `rounded-lg` | 12px |
| **Progress bar track** | `full` | `rounded-full` | Always |
| **Checkbox** | `xs` | `rounded-xs` | 4px |
| **Tab indicator** | `full` | `rounded-full` | Always |
| **Skeleton loader** | same as element | — | Match what it loads |

### ⚠️ Common Mistakes to Avoid

```
❌ rounded-2xl on an input field   → use rounded-md (8px)
❌ rounded-md on a pill badge      → use rounded-full
❌ rounded-lg on a button          → use rounded-full for text buttons
❌ Different radius on same card type in different screens
❌ rounded-xl on modals            → use rounded-2xl
❌ No radius on images             → always use rounded-lg or rounded-xl
```

---

## 6. Shadows & Elevation

```js
// tailwind.config.js → extend.boxShadow

boxShadow: {
  // Elevation system — use these only
  'none':   'none',
  'xs':     '0 1px 2px 0 rgb(0 0 0 / 0.05)',                          // subtle — pressed state
  'sm':     '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',  // input on focus
  'md':     '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // cards
  'lg':     '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)', // floating cards
  'xl':     '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)', // modals
  '2xl':    '0 25px 50px -12px rgb(0 0 0 / 0.15)',                    // bottom sheets
  // Colored shadows (primary CTA)
  'primary': '0 4px 14px 0 rgb(240 78 42 / 0.35)',                    // primary button hover
  'inner':   'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',                   // pressed input
}
```

### Elevation Usage

```
Page background:      no shadow
Standard card:        shadow-md (resting) → shadow-lg (hover)
Input resting:        shadow-xs or border only
Input focused:        shadow-sm + border-primary-400
Primary CTA button:   shadow-primary (hover/active only)
Bottom navigation:    shadow-xl (always — floats above content)
Modal:                shadow-xl
Bottom sheet:         shadow-2xl
FAB:                  shadow-lg (resting) → shadow-xl (hover)
Toast/Snackbar:       shadow-lg
```

---

## 7. Component Tokens

Define these as CSS custom properties in your `index.css` so they can be referenced globally:

```css
/* src/index.css */

:root {
  /* Typography */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  /* Brand */
  --color-brand:        #FF6B4A;  /* primary-400 */
  --color-brand-dark:   #D93A18;  /* primary-600 */
  --color-brand-light:  #FFE0D9;  /* primary-100 */
  --color-accent:       #1FA8A5;  /* secondary-500 */
  --color-accent-light: #D5F5F4;  /* secondary-100 */

  /* Surfaces */
  --surface-base:    #FAFAF9;
  --surface-raised:  #FFFFFF;
  --surface-overlay: #F5F4F2;

  /* Text */
  --text-primary:   #1C1917;  /* neutral-900 */
  --text-secondary: #57534E;  /* neutral-600 */
  --text-tertiary:  #78746C;  /* neutral-500 */
  --text-disabled:  #A8A49C;  /* neutral-400 */
  --text-inverse:   #FFFFFF;

  /* Borders */
  --border-subtle:  #E8E6E1;  /* neutral-200 */
  --border-default: #D1CEC8;  /* neutral-300 */
  --border-strong:  #A8A49C;  /* neutral-400 */

  /* Radius */
  --radius-pill:  9999px;
  --radius-card:  12px;
  --radius-input: 8px;
  --radius-modal: 20px;
  --radius-sheet: 24px;

  /* Motion */
  --duration-fast:   150ms;
  --duration-normal: 250ms;
  --duration-slow:   350ms;
  --ease-default:    cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:        cubic-bezier(0, 0, 0.2, 1);
}
```

---

## 8. Buttons

### Size Variants

```tsx
// src/components/ui/Button.tsx

const buttonSizes = {
  lg: 'h-12 px-6 text-label-lg gap-2',      // 48px height
  md: 'h-10 px-5 text-label-md gap-2',      // 40px height — DEFAULT
  sm: 'h-8  px-4 text-label-sm gap-1.5',    // 32px height
  xs: 'h-7  px-3 text-label-sm gap-1',      // 28px height
};

const buttonVariants = {
  primary:   'bg-primary-400 text-white hover:bg-primary-500 active:bg-primary-600 shadow-sm hover:shadow-primary disabled:bg-neutral-200 disabled:text-neutral-400',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 shadow-sm disabled:bg-neutral-200 disabled:text-neutral-400',
  outline:   'bg-transparent border-2 border-primary-400 text-primary-400 hover:bg-primary-50 active:bg-primary-100 disabled:border-neutral-200 disabled:text-neutral-400',
  ghost:     'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 disabled:text-neutral-400',
  danger:    'bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  neutral:   'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400',
};

// Base classes — ALWAYS applied
const base = 'inline-flex items-center justify-center font-display font-semibold rounded-full transition-all duration-150 ease-default select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.97]';
```

### Icon Button

```tsx
// For icon-only buttons — always rounded-full
const iconSizes = {
  lg: 'h-12 w-12',  // 48px
  md: 'h-10 w-10',  // 40px — DEFAULT
  sm: 'h-8  w-8',   // 32px
  xs: 'h-7  w-7',   // 28px
};

// Usage
<button className={`${iconSizes.md} rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 inline-flex items-center justify-center transition-all duration-150`}>
  <Icon size={20} />
</button>
```

### FAB (Floating Action Button)

```tsx
// Bottom-right FAB — always rounded-full, always shadow-lg
<button className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary-400 text-white shadow-lg hover:shadow-xl hover:bg-primary-500 inline-flex items-center justify-center transition-all duration-200 z-40">
  <Plus size={24} />
</button>

// Extended FAB (with label)
<button className="fixed bottom-20 right-4 h-14 rounded-full bg-primary-400 text-white shadow-lg px-6 gap-2 inline-flex items-center justify-center font-display font-semibold text-label-md transition-all duration-200 z-40">
  <Plus size={20} />
  <span>Create Event</span>
</button>
```

---

## 9. Pills & Badges

**RULE: All pills use `rounded-full`. No exceptions. Ever.**

### Status Badges

```tsx
// src/components/ui/Badge.tsx

const badgeVariants = {
  // Soft variants (colored bg, matching text)
  primary:  'bg-primary-100  text-primary-700  border border-primary-200',
  success:  'bg-green-100    text-green-700    border border-green-200',
  warning:  'bg-amber-100    text-amber-700    border border-amber-200',
  error:    'bg-red-100      text-red-700      border border-red-200',
  info:     'bg-blue-100     text-blue-700     border border-blue-200',
  neutral:  'bg-neutral-100  text-neutral-600  border border-neutral-200',
  accent:   'bg-secondary-100 text-secondary-700 border border-secondary-200',

  // Solid variants (for high visibility)
  'solid-primary':  'bg-primary-400  text-white',
  'solid-success':  'bg-green-600    text-white',
  'solid-warning':  'bg-amber-500    text-white',
  'solid-error':    'bg-red-600      text-white',
  'solid-neutral':  'bg-neutral-700  text-white',
};

const badgeSizes = {
  sm: 'px-2    py-0.5  text-caption-sm',   // compact — table cells, tight spaces
  md: 'px-2.5  py-1    text-label-sm',     // DEFAULT — most use cases
  lg: 'px-3    py-1.5  text-label-md',     // prominent — hero areas
};

// Base — ALWAYS rounded-full
const badgeBase = 'inline-flex items-center gap-1 rounded-full font-display font-semibold leading-none whitespace-nowrap';

// Usage examples
<span className={`${badgeBase} ${badgeVariants.success} ${badgeSizes.md}`}>Confirmed</span>
<span className={`${badgeBase} ${badgeVariants.warning} ${badgeSizes.md}`}>Pending</span>
<span className={`${badgeBase} ${badgeVariants['solid-primary']} ${badgeSizes.md}`}>Live</span>
```

### Filter Chips (Horizontal Scroll Row)

```tsx
// Selectable filter chips — toggle selected state
const chipBase = 'inline-flex items-center gap-1.5 rounded-full font-display font-semibold text-label-sm whitespace-nowrap cursor-pointer transition-all duration-150 select-none';

const chipVariants = {
  default:  'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200',
  selected: 'bg-primary-400 text-white border border-primary-400 shadow-xs',
};

const chipSizes = {
  sm: 'h-7  px-3',   // compact — dense chip rows
  md: 'h-8  px-3.5', // DEFAULT
  lg: 'h-9  px-4',   // prominent filter bars
};

// Usage
<div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
  {['All', 'Upcoming', 'Past', 'Draft'].map(label => (
    <button
      key={label}
      className={`${chipBase} ${chipSizes.md} ${selected === label ? chipVariants.selected : chipVariants.default}`}
      onClick={() => setSelected(label)}
    >
      {label}
    </button>
  ))}
</div>
```

### Count / Notification Dot

```tsx
// Notification count pill on icons/tabs
<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary-400 text-white text-[11px] font-bold font-display flex items-center justify-center px-1 leading-none">
  {count > 99 ? '99+' : count}
</span>
```

---

## 10. Input Fields

```tsx
// src/components/ui/Input.tsx

// Base — always rounded-md (8px), never rounded-full
const inputBase = 'w-full rounded-md bg-surface-overlay border border-neutral-200 font-body text-body-md text-neutral-800 placeholder:text-neutral-400 transition-all duration-150 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed';

const inputSizes = {
  sm: 'h-9  px-3 py-2   text-body-sm',
  md: 'h-11 px-4 py-3   text-body-md',   // DEFAULT
  lg: 'h-12 px-4 py-3.5 text-body-md',
};

// With icon prefix
const inputWithIcon = 'pl-10';  // add to inputBase when icon present

// Error state
const inputError = 'border-red-400 focus:border-red-400 focus:ring-red-100 bg-red-50';

// Form label — always above input, never inside
<label className="block font-display text-label-sm text-neutral-700 mb-1.5">
  Guest Name <span className="text-error">*</span>
</label>
<input className={`${inputBase} ${inputSizes.md}`} placeholder="Enter full name" />

// Helper text
<p className="mt-1.5 font-body text-caption-lg text-neutral-400">As it appears on valid ID</p>

// Error text
<p className="mt-1.5 font-body text-caption-lg text-red-600 flex items-center gap-1">
  <AlertCircle size={12} /> This field is required
</p>
```

### Search Input

```tsx
// Pill-shaped search bar — exception: search inputs use rounded-full
<div className="relative">
  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
  <input
    className="w-full h-10 rounded-full bg-neutral-100 border border-transparent pl-10 pr-4 font-body text-body-md text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300 transition-all duration-150"
    placeholder="Search events..."
  />
</div>
```

---

## 11. Cards

```tsx
// Standard Card
const cardBase = 'bg-surface-raised rounded-lg shadow-md overflow-hidden';

// Featured / Hero Card
const cardFeatured = 'bg-surface-raised rounded-xl shadow-lg overflow-hidden';

// List Item Card (no image, tight)
const cardList = 'bg-surface-raised rounded-lg shadow-xs border border-neutral-200 px-4 py-3';

// Interactive Card (pressable)
const cardInteractive = `${cardBase} cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99] active:shadow-md`;

// Card anatomy — consistent padding
<div className={cardInteractive}>
  {/* Image — always fills top, rounded-none inside card (card clips it) */}
  <div className="relative aspect-video bg-neutral-100">
    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
    {/* Status badge — top-left of image */}
    <span className="absolute top-3 left-3 ...badge classes...">Live</span>
  </div>

  {/* Card body */}
  <div className="p-4">
    {/* Overline / category */}
    <span className="font-display text-overline uppercase text-primary-400 tracking-widest">Wedding</span>
    {/* Title */}
    <h3 className="font-display text-heading-md text-neutral-800 mt-1 mb-1 line-clamp-2">Event Title Here</h3>
    {/* Meta row */}
    <div className="flex items-center gap-3 text-caption-lg text-neutral-400 font-body">
      <span className="flex items-center gap-1"><Calendar size={12} /> Jun 15, 2026</span>
      <span className="flex items-center gap-1"><MapPin size={12} /> Davao City</span>
    </div>
    {/* Footer row */}
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
      <span className="font-display text-heading-sm text-primary-400">₱250 / ticket</span>
      <button className="...button primary sm...">Get Tickets</button>
    </div>
  </div>
</div>
```

---

## 12. Iconography

**Icon Library:** `lucide-react` (already in your stack)

### Icon Size Scale

```tsx
const iconSizes = {
  xs:  12,  // inline with caption text
  sm:  16,  // inline with body text, dense lists
  md:  20,  // DEFAULT — most UI icons
  lg:  24,  // navigation icons, prominent actions
  xl:  32,  // empty states, feature highlights
  '2xl': 48, // hero illustrations
};

// Usage rules:
// Navigation bar icons:     size={24}
// Button icons (md button): size={16}
// Button icons (lg button): size={20}
// List item icons:          size={20}
// Form field icons:         size={18}
// Badge/chip icons:         size={12}
// Notification dot icon:    size={12}
```

### Icon + Text Alignment

```tsx
// Always use inline-flex + items-center for icon+text combos
<span className="inline-flex items-center gap-1.5 font-body text-body-sm text-neutral-500">
  <Calendar size={14} />
  June 15, 2026
</span>
```

---

## 13. Motion & Animation

```css
/* src/index.css */

/* Standard transitions — always use these durations */
.transition-fast   { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
.transition-normal { transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1); }
.transition-slow   { transition: all 350ms cubic-bezier(0.4, 0, 0.2, 1); }

/* Spring — for scale/pop effects */
.transition-spring { transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1); }

/* Page slide-in (React Router transitions) */
@keyframes slide-in-right {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes slide-in-up {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.animate-slide-in-right { animation: slide-in-right 300ms cubic-bezier(0, 0, 0.2, 1) both; }
.animate-slide-in-up    { animation: slide-in-up 250ms cubic-bezier(0, 0, 0.2, 1) both; }
.animate-fade-in        { animation: fade-in 200ms ease-out both; }

/* Bottom sheet slide up */
@keyframes sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.animate-sheet-up { animation: sheet-up 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
```

### Animation Rules

```
Button press:         active:scale-[0.97] — always
Card hover:           hover:-translate-y-0.5 + hover:shadow-lg
Bottom sheet open:    animate-sheet-up (spring)
Page transition:      animate-slide-in-right (screen push)
Toast/Snackbar:       animate-slide-in-up
Modal backdrop:       animate-fade-in (200ms)
Skeleton:             animate-pulse (Tailwind built-in)
Loading spinner:      animate-spin (Tailwind built-in)
```

---

## 14. Responsive Breakpoints

EventPH is mobile-first. Desktop is secondary (PWA targets phone).

```js
// tailwind.config.js
screens: {
  'xs':  '375px',  // Small phones (iPhone SE)
  'sm':  '390px',  // Standard phones (iPhone 14)
  'md':  '768px',  // Tablets
  'lg':  '1024px', // Desktop (secondary)
}

// Usage pattern — mobile first, then expand:
// className="text-heading-sm md:text-heading-lg"
// className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
// className="px-4 md:px-8"
```

### Safe Area Insets (iOS/Android PWA)

```css
/* Always add safe area padding to bottom-fixed elements */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

.fab {
  bottom: calc(64px + env(safe-area-inset-bottom, 16px) + 16px);
}
```

---

## 15. Tailwind Config

Complete `tailwind.config.js` for EventPH:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#FFF1EE', 100: '#FFE0D9', 200: '#FFC2B4',
          300: '#FF9A84', 400: '#FF6B4A', 500: '#F04E2A',
          600: '#D93A18', 700: '#B52E12', 800: '#8F2410', 900: '#6B1A0C',
        },
        secondary: {
          50:  '#EDFAFA', 100: '#D5F5F4', 200: '#AAEAE9',
          300: '#72D9D7', 400: '#38C2BF', 500: '#1FA8A5',
          600: '#178A88', 700: '#126E6C', 800: '#0E5452', 900: '#0A3E3D',
        },
        neutral: {
          50:  '#FAFAF9', 100: '#F5F4F2', 200: '#E8E6E1',
          300: '#D1CEC8', 400: '#A8A49C', 500: '#78746C',
          600: '#57534E', 700: '#44403C', 800: '#292524', 900: '#1C1917',
        },
        surface: {
          base:    '#FAFAF9',
          raised:  '#FFFFFF',
          overlay: '#F5F4F2',
          invert:  '#1C1917',
        },
      },
      fontSize: {
        'display-xl': ['2.25rem',  { lineHeight: '2.75rem',  letterSpacing: '-0.02em',  fontWeight: '800' }],
        'display-lg': ['1.875rem', { lineHeight: '2.375rem', letterSpacing: '-0.02em',  fontWeight: '800' }],
        'heading-xl': ['1.5rem',   { lineHeight: '2rem',     letterSpacing: '-0.015em', fontWeight: '700' }],
        'heading-lg': ['1.25rem',  { lineHeight: '1.75rem',  letterSpacing: '-0.01em',  fontWeight: '700' }],
        'heading-md': ['1.125rem', { lineHeight: '1.625rem', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'heading-sm': ['1rem',     { lineHeight: '1.5rem',   letterSpacing: '0',        fontWeight: '600' }],
        'body-lg':    ['1rem',     { lineHeight: '1.625rem', letterSpacing: '0',        fontWeight: '400' }],
        'body-md':    ['0.9375rem',{ lineHeight: '1.5rem',   letterSpacing: '0',        fontWeight: '400' }],
        'body-sm':    ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0',        fontWeight: '400' }],
        'label-lg':   ['0.9375rem',{ lineHeight: '1.25rem',  letterSpacing: '0.01em',   fontWeight: '600' }],
        'label-md':   ['0.875rem', { lineHeight: '1.25rem',  letterSpacing: '0.01em',   fontWeight: '600' }],
        'label-sm':   ['0.8125rem',{ lineHeight: '1.125rem', letterSpacing: '0.02em',   fontWeight: '500' }],
        'caption-lg': ['0.8125rem',{ lineHeight: '1.25rem',  letterSpacing: '0',        fontWeight: '400' }],
        'caption-sm': ['0.75rem',  { lineHeight: '1.125rem', letterSpacing: '0',        fontWeight: '400' }],
        'overline':   ['0.6875rem',{ lineHeight: '1rem',     letterSpacing: '0.08em',   fontWeight: '600' }],
      },
      borderRadius: {
        'xs': '4px', 'sm': '6px', 'md': '8px', 'lg': '12px',
        'xl': '16px', '2xl': '20px', '3xl': '24px', 'full': '9999px',
      },
      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm':      '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'md':      '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'lg':      '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'xl':      '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        '2xl':     '0 25px 50px -12px rgb(0 0 0 / 0.15)',
        'primary': '0 4px 14px 0 rgb(240 78 42 / 0.35)',
        'inner':   'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        'none':    'none',
      },
      spacing: {
        'space-1': '4px',  'space-2': '8px',  'space-3': '12px',
        'space-4': '16px', 'space-5': '20px', 'space-6': '24px',
        'space-8': '32px', 'space-10': '40px','space-12': '48px',
        'space-16': '64px',
      },
      screens: {
        'xs': '375px', 'sm': '390px', 'md': '768px', 'lg': '1024px',
      },
      animation: {
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0, 0, 0.2, 1) both',
        'slide-in-up':    'slide-in-up 250ms cubic-bezier(0, 0, 0.2, 1) both',
        'fade-in':        'fade-in 200ms ease-out both',
        'sheet-up':       'sheet-up 350ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
      keyframes: {
        'slide-in-right': { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'slide-in-up':    { from: { transform: 'translateY(20px)', opacity: '0' }, to: { transform: 'translateY(0)',   opacity: '1' } },
        'fade-in':        { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up':       { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
```

---

## 16. Do's and Don'ts

### ✅ DO

- Use `rounded-full` for ALL pills, chips, badges, avatars, toggles, and FABs
- Use `rounded-md` (8px) for ALL input fields
- Use `rounded-lg` (12px) for ALL standard cards
- Use `rounded-2xl` (20px) for ALL modals and dialogs
- Use `rounded-t-3xl` (24px) for ALL bottom sheets
- Use `Plus Jakarta Sans` for ALL headings, labels, buttons
- Use `DM Sans` for ALL body text, placeholders, helper text
- Use the defined type scale only — no arbitrary text sizes
- Use 8px-grid spacing — stick to `space-1` through `space-16`
- Use semantic color tokens — `text-neutral-800` not `text-gray-800`
- Add `transition-all duration-150` to ALL interactive elements
- Add `active:scale-[0.97]` to ALL pressable buttons
- Always add `focus-visible:ring-2` for keyboard accessibility

### ❌ DON'T

- Don't use `rounded-xl` or `rounded-2xl` on buttons — use `rounded-full`
- Don't use `rounded-full` on input fields — use `rounded-md`
- Don't use arbitrary font sizes like `text-[13px]` — use the scale
- Don't use `font-sans` or `font-mono` — use `font-display` or `font-body`
- Don't mix spacing — no `p-[14px]` or `mt-[7px]`
- Don't use `text-gray-*` — use `text-neutral-*`
- Don't hardcode colors in JSX — always use Tailwind tokens
- Don't skip transitions on interactive elements
- Don't use different card radius on the same screen
- Don't place labels inside input fields (use above-field labels always)
- Don't use `rounded-lg` on search bars — use `rounded-full` for search
- Don't stack too many font weights — use only 400 (body), 500, 600, 700, 800

---

## 17. Tech Stack Libraries

This section documents the exact usage patterns, conventions, and rules for every major library in the EventPH stack. Follow these patterns in every component — no improvising with alternative approaches.

**Full Stack:**
```
React 18 + Vite + Firebase PWA
├── Routing:       React Router v6
├── State:         Zustand
├── Animation:     Framer Motion
├── Sheets/Drawer: Vaul
├── Gestures:      @use-gesture/react
├── Offline DB:    Dexie.js (IndexedDB)
├── Haptics:       Capacitor Haptics / navigator.vibrate
├── Push Notifs:   Firebase Cloud Messaging (FCM)
└── PWA/Cache:     Workbox (via vite-plugin-pwa)
```

---

### 17.1 React Router v6

**Purpose:** Client-side navigation with native-feeling screen transitions. Fixes the back-button behavior problems from earlier GetGo PH work.

#### Installation
```bash
npm install react-router-dom@6
```

#### Route Structure
```tsx
// src/main.tsx
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter>
  <App />
</BrowserRouter>

// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';

export default function App() {
  return (
    <Routes>
      {/* Auth guard wrapper */}
      <Route path="/" element={<AuthGuard />}>
        {/* Tab-based main layout */}
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home"   element={<HomePage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="scan"   element={<ScanPage />} />
          <Route path="guests" element={<GuestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Full-screen stack pages (no bottom nav) */}
        <Route path="events/:id"        element={<EventDetailPage />} />
        <Route path="events/:id/seating" element={<SeatingPage />} />
        <Route path="events/:id/checkin" element={<CheckInPage />} />
        <Route path="events/create"      element={<CreateEventPage />} />
        <Route path="guests/:id"         element={<GuestDetailPage />} />
      </Route>

      {/* Unauthenticated */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/onboard"  element={<OnboardPage />} />
      <Route path="*"         element={<NotFoundPage />} />
    </Routes>
  );
}
```

#### Navigation Patterns
```tsx
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';

// Programmatic navigation
const navigate = useNavigate();
navigate('/events/123');              // push (forward)
navigate(-1);                         // back (like hardware back button)
navigate('/home', { replace: true }); // replace (no back stack entry)

// Pass state between routes (no URL params needed)
navigate('/events/create', { state: { templateId: 'wedding' } });

// Read route params
const { id } = useParams<{ id: string }>();

// Read location state
const location = useLocation();
const { templateId } = location.state ?? {};

// Link component (prefer over navigate() for user-initiated navigation)
<Link to={`/events/${event.id}`} className="block">
  <EventCard event={event} />
</Link>
```

#### Scroll Restoration
```tsx
// src/components/ScrollRestoration.tsx
// Add once inside <BrowserRouter> to restore scroll on navigation
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollRestoration() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
```

#### Rules
```
✅ Use <Link> for navigation the user initiates (taps)
✅ Use navigate() for programmatic redirects (after form submit, auth)
✅ Use navigate(-1) for back buttons — matches hardware back behavior
✅ Use replace: true after login/logout to clear auth from history
✅ Always define a catch-all * route
❌ Never use window.location.href for internal navigation
❌ Never use <a href> for internal links — always <Link>
❌ Never nest <BrowserRouter> inside components
```

---

### 17.2 Zustand

**Purpose:** Global state management. Lightweight, no boilerplate, works perfectly with React 18. Used for auth state, event data, UI state (modals, bottom sheets), and offline sync status.

#### Installation
```bash
npm install zustand
```

#### Store Structure — One File Per Domain
```
src/stores/
├── useAuthStore.ts       # User session, profile
├── useEventStore.ts      # Events list, active event
├── useGuestStore.ts      # Guest list, check-in state
├── useUIStore.ts         # Modal/sheet visibility, toasts
└── useSyncStore.ts       # Offline sync status
```

#### Auth Store
```tsx
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  uid: string;
  name: string;
  phone: string;
  role: 'organizer' | 'staff' | 'guest';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null }),
    }),
    { name: 'eventph-auth' } // persists to localStorage
  )
);
```

#### Event Store
```tsx
// src/stores/useEventStore.ts
import { create } from 'zustand';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  guestCount: number;
  status: 'draft' | 'published' | 'live' | 'past';
}

interface EventState {
  events: Event[];
  activeEvent: Event | null;
  isLoading: boolean;
  setEvents: (events: Event[]) => void;
  setActiveEvent: (event: Event | null) => void;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  addEvent: (event: Event) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  activeEvent: null,
  isLoading: false,
  setEvents: (events) => set({ events }),
  setActiveEvent: (activeEvent) => set({ activeEvent }),
  updateEvent: (id, patch) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  addEvent: (event) =>
    set((state) => ({ events: [event, ...state.events] })),
}));
```

#### UI Store (Modals, Toasts, Sheets)
```tsx
// src/stores/useUIStore.ts
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  // Bottom sheets
  isGuestSheetOpen: boolean;
  isFilterSheetOpen: boolean;
  // Toasts
  toasts: Toast[];
  // Actions
  openGuestSheet: () => void;
  closeGuestSheet: () => void;
  openFilterSheet: () => void;
  closeFilterSheet: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGuestSheetOpen: false,
  isFilterSheetOpen: false,
  toasts: [],
  openGuestSheet: () => set({ isGuestSheetOpen: true }),
  closeGuestSheet: () => set({ isGuestSheetOpen: false }),
  openFilterSheet: () => set({ isFilterSheetOpen: true }),
  closeFilterSheet: () => set({ isFilterSheetOpen: false }),
  showToast: (message, type = 'info') =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now().toString(), message, type }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

#### Usage in Components
```tsx
// Reading state — always use selectors (prevents unnecessary re-renders)
const user = useAuthStore((s) => s.user);
const events = useEventStore((s) => s.events);
const showToast = useUIStore((s) => s.showToast);

// Never destructure the whole store:
// ❌ const { user, isLoading, setUser } = useAuthStore();
// ✅ const user = useAuthStore((s) => s.user);
```

#### Rules
```
✅ One store file per domain (auth, events, guests, UI, sync)
✅ Always use selector functions: useStore((s) => s.field)
✅ Use persist middleware for auth and user preferences only
✅ Keep stores flat — no deeply nested state
✅ Put derived/computed values in selectors, not store
❌ Never store non-serializable values (functions, class instances) in persisted stores
❌ Never import stores inside other stores
❌ Never mutate state directly — always use set()
```

---

### 17.3 Framer Motion

**Purpose:** Production-quality animations. Used for page transitions, card animations, list stagger effects, FAB reveals, and micro-interactions. Do NOT use CSS animations for anything Framer Motion handles.

#### Installation
```bash
npm install framer-motion
```

#### Standard Variants — Define Once, Reuse Everywhere
```tsx
// src/lib/motion.ts — import from here in all components

export const pageVariants = {
  initial:  { opacity: 0, x: 40 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -40 },
};

export const pageTransition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.28,
};

export const slideUpVariants = {
  initial:  { opacity: 0, y: 24 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: 24 },
};

export const fadeVariants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  initial:  { opacity: 0, y: 16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

export const scaleVariants = {
  initial:  { opacity: 0, scale: 0.92 },
  animate:  { opacity: 1, scale: 1 },
  exit:     { opacity: 0, scale: 0.92 },
};

export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};
```

#### Page Transitions (with React Router)
```tsx
// src/components/PageTransition.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageVariants, pageTransition } from '@/lib/motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

#### Staggered List (Event Cards, Guest List)
```tsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';

<motion.ul variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-3">
  {events.map((event) => (
    <motion.li key={event.id} variants={staggerItem}>
      <EventCard event={event} />
    </motion.li>
  ))}
</motion.ul>
```

#### FAB Reveal (hide on scroll down, show on scroll up)
```tsx
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

export function FAB() {
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();
  let lastY = 0;

  useMotionValueEvent(scrollY, 'change', (y) => {
    setVisible(y < lastY || y < 80);
    lastY = y;
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={springTransition}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-primary-400 text-white shadow-lg flex items-center justify-center z-40"
        >
          <Plus size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
```

#### Pressable Card (tap feedback)
```tsx
<motion.div
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
  className="bg-surface-raised rounded-lg shadow-md cursor-pointer"
>
  <EventCard event={event} />
</motion.div>
```

#### Rules
```
✅ Import all variants from src/lib/motion.ts — never define inline
✅ Use AnimatePresence for any conditional rendering with exit animation
✅ Use mode="wait" on AnimatePresence for page transitions
✅ Use whileTap={{ scale: 0.97 }} on all pressable cards and buttons
✅ Use staggerContainer + staggerItem for all list renders
✅ Keep durations short: 200-350ms for UI, never exceed 500ms
❌ Never animate layout-affecting properties (width, height) on mobile — use opacity/transform only
❌ Never use Framer Motion AND CSS transitions on the same element
❌ Never define variants inline in JSX — define in motion.ts and import
```

---

### 17.4 Vaul

**Purpose:** Bottom drawer/sheet component. Used for guest details, filter panels, event options, QR display, and any content that slides up from the bottom. Replaces custom bottom sheet implementations.

#### Installation
```bash
npm install vaul
```

#### Standard Bottom Sheet Pattern
```tsx
// src/components/ui/BottomSheet.tsx
import { Drawer } from 'vaul';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];         // e.g. [0.4, 0.9] — 40% and 90% of screen
  defaultSnap?: number;
}

export function BottomSheet({ open, onClose, title, children, snapPoints, defaultSnap }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()} snapPoints={snapPoints} defaultSnap={defaultSnap}>
      <Drawer.Portal>
        {/* Backdrop */}
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        {/* Sheet */}
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-surface-raised rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col focus:outline-none">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-neutral-300" />
          </div>
          {/* Header */}
          {title && (
            <div className="px-5 pb-3 pt-1 flex-shrink-0">
              <h2 className="font-display text-heading-md text-neutral-900 text-center">{title}</h2>
            </div>
          )}
          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-5 pb-safe">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
```

#### Usage Examples
```tsx
// Guest detail sheet — snaps to 50% or 90%
const { isGuestSheetOpen, closeGuestSheet } = useUIStore((s) => ({
  isGuestSheetOpen: s.isGuestSheetOpen,
  closeGuestSheet: s.closeGuestSheet,
}));

<BottomSheet
  open={isGuestSheetOpen}
  onClose={closeGuestSheet}
  title="Guest Details"
  snapPoints={[0.5, 0.92]}
  defaultSnap={0.5}
>
  <GuestDetailContent guest={selectedGuest} />
</BottomSheet>

// Filter sheet — fixed height, no snap
<BottomSheet open={isFilterOpen} onClose={closeFilter} title="Filter Events">
  <FilterOptions />
</BottomSheet>

// QR code sheet — single snap
<BottomSheet open={showQR} onClose={() => setShowQR(false)} title="Your QR Code">
  <QRCodeDisplay value={guestId} />
</BottomSheet>
```

#### Sheet Trigger via Zustand
```tsx
// Best practice: control all sheets through useUIStore
// Component triggers via store, sheet listens to store
const openGuestSheet = useUIStore((s) => s.openGuestSheet);

<button onClick={openGuestSheet} className="...">
  View Guest
</button>

// Sheet defined once in root layout, not in every component
// src/components/layout/SheetLayer.tsx
export function SheetLayer() {
  return (
    <>
      <GuestDetailSheet />
      <FilterSheet />
      <EventOptionsSheet />
    </>
  );
}
```

#### Rules
```
✅ Always use Vaul for bottom sheets — no custom implementations
✅ Always include the drag handle (w-10 h-1 rounded-full bg-neutral-300)
✅ Always use rounded-t-3xl on the sheet container
✅ Control sheet open state through useUIStore
✅ Define sheets once in SheetLayer, not inside every page component
✅ Add pb-safe (safe-area-inset-bottom) to sheet content
❌ Never use modals for content that fits a bottom sheet on mobile
❌ Never animate the sheet manually — Vaul handles all animation
❌ Never put form submits inside sheets without scroll handling
```

---

### 17.5 @use-gesture/react

**Purpose:** Touch and pointer gestures for swipe-to-dismiss, swipe-to-check-in, pull-to-refresh, and drag interactions in the seating floor plan builder.

#### Installation
```bash
npm install @use-gesture/react
```

#### Swipe to Check-In (Guest List Row)
```tsx
import { useSpring, animated } from '@react-spring/web'; // pair with react-spring
import { useDrag } from '@use-gesture/react';

// Install react-spring too: npm install @react-spring/web
export function SwipeableGuestRow({ guest, onCheckIn }: Props) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [dx], cancel }) => {
      // Only allow left swipe (negative x)
      if (mx > 0) { cancel(); return; }
      if (!active && Math.abs(mx) > 80) {
        onCheckIn(guest.id);
        api.start({ x: 0, immediate: false });
      } else {
        api.start({ x: active ? Math.max(mx, -120) : 0, immediate: active });
      }
    },
    { axis: 'x', filterTaps: true, bounds: { left: -120, right: 0 } }
  );

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background action (revealed on swipe) */}
      <div className="absolute inset-y-0 right-0 w-28 bg-green-500 flex items-center justify-center rounded-r-lg">
        <span className="text-white font-display font-bold text-label-md">Check In ✓</span>
      </div>
      {/* Swipeable row */}
      <animated.div {...bind()} style={{ x, touchAction: 'pan-y' }} className="relative bg-surface-raised rounded-lg shadow-xs border border-neutral-200">
        <GuestRow guest={guest} />
      </animated.div>
    </div>
  );
}
```

#### Pull to Refresh
```tsx
import { useScroll } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

export function PullToRefresh({ onRefresh, children }: Props) {
  const [{ y }, api] = useSpring(() => ({ y: 0 }));
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 80;

  const bind = useDrag(
    async ({ movement: [, my], active, cancel }) => {
      if (window.scrollY > 0) { cancel(); return; }
      if (!active && my > threshold) {
        setRefreshing(true);
        api.start({ y: 48 });
        await onRefresh();
        setRefreshing(false);
        api.start({ y: 0 });
      } else {
        api.start({ y: active ? Math.min(my, threshold) : 0, immediate: active });
      }
    },
    { axis: 'y', filterTaps: true, pointer: { touch: true } }
  );

  return (
    <div {...bind()} style={{ touchAction: 'pan-x' }}>
      <animated.div style={{ marginTop: y }}>
        {refreshing && <RefreshIndicator />}
        {children}
      </animated.div>
    </div>
  );
}
```

#### Draggable Seat (Floor Plan Builder)
```tsx
import { useDrag } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

export function DraggableSeat({ seat, onMove }: Props) {
  const [{ x, y }, api] = useSpring(() => ({ x: seat.x, y: seat.y }));

  const bind = useDrag(
    ({ offset: [ox, oy], last }) => {
      api.start({ x: ox, y: oy, immediate: true });
      if (last) onMove(seat.id, ox, oy);
    },
    { from: () => [x.get(), y.get()], bounds: { left: 0, top: 0, right: 360, bottom: 640 } }
  );

  return (
    <animated.div {...bind()} style={{ x, y, position: 'absolute', touchAction: 'none' }} className="w-16 h-16 rounded-xl bg-primary-100 border-2 border-primary-400 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md">
      <span className="font-display font-bold text-label-sm text-primary-700">{seat.label}</span>
    </animated.div>
  );
}
```

#### Rules
```
✅ Always set touchAction: 'none' on draggable elements
✅ Use filterTaps: true to prevent drag conflicts with taps
✅ Use axis: 'x' or axis: 'y' to constrain gesture direction
✅ Always pair with @react-spring/web for smooth animated values
✅ Use bounds to constrain drag within container limits
❌ Never use both Framer Motion AND use-gesture on the same element
❌ Never use pointer events on elements that need gesture handling
❌ Never forget to handle the last: true case (drop/release)
```

---

### 17.6 Dexie.js

**Purpose:** IndexedDB wrapper for offline data storage. Stores events, guest lists, and check-in records locally so EventPH works without internet — critical for venues in Mindanao with poor connectivity.

#### Installation
```bash
npm install dexie dexie-react-hooks
```

#### Database Definition
```tsx
// src/lib/db.ts
import Dexie, { type Table } from 'dexie';

export interface DBEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: 'draft' | 'published' | 'live' | 'past';
  guestCount: number;
  syncedAt?: number;
  dirty?: boolean; // true = has local changes not yet synced to Firebase
}

export interface DBGuest {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  tableNumber?: number;
  seatNumber?: number;
  checkedIn: boolean;
  checkInTime?: number;
  ticketType: 'general' | 'vip' | 'staff';
  dirty?: boolean;
}

export interface DBCheckIn {
  id: string;
  guestId: string;
  eventId: string;
  timestamp: number;
  method: 'qr' | 'manual' | 'walkin';
  staffId: string;
  synced: boolean;
}

class EventPHDatabase extends Dexie {
  events!: Table<DBEvent>;
  guests!: Table<DBGuest>;
  checkIns!: Table<DBCheckIn>;

  constructor() {
    super('EventPH');
    this.version(1).stores({
      events:   'id, status, date, dirty',
      guests:   'id, eventId, checkedIn, tableNumber, dirty',
      checkIns: 'id, eventId, guestId, synced, timestamp',
    });
  }
}

export const db = new EventPHDatabase();
```

#### Data Access Patterns
```tsx
// src/hooks/useGuests.ts
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

// Live query — auto-updates when DB changes (reactive)
export function useGuests(eventId: string) {
  return useLiveQuery(
    () => db.guests.where('eventId').equals(eventId).sortBy('name'),
    [eventId]
  );
}

// Check in a guest (offline-first)
export async function checkInGuest(guestId: string, staffId: string, method: 'qr' | 'manual' | 'walkin') {
  const timestamp = Date.now();

  await db.transaction('rw', db.guests, db.checkIns, async () => {
    // Update guest record
    await db.guests.update(guestId, {
      checkedIn: true,
      checkInTime: timestamp,
      dirty: true,
    });

    // Record check-in event
    await db.checkIns.add({
      id: `${guestId}-${timestamp}`,
      guestId,
      eventId: (await db.guests.get(guestId))!.eventId,
      timestamp,
      method,
      staffId,
      synced: false,
    });
  });
}

// Sync dirty records to Firebase when online
export async function syncToFirebase() {
  const dirtyGuests = await db.guests.where('dirty').equals(1).toArray();
  const unsyncedCheckIns = await db.checkIns.where('synced').equals(0).toArray();

  // Upload to Firestore...
  for (const guest of dirtyGuests) {
    await updateGuestInFirestore(guest);
    await db.guests.update(guest.id, { dirty: false });
  }
  for (const checkIn of unsyncedCheckIns) {
    await addCheckInToFirestore(checkIn);
    await db.checkIns.update(checkIn.id, { synced: true });
  }
}
```

#### Seed from Firebase on App Load
```tsx
// src/hooks/useSeedLocalDB.ts
import { db } from '@/lib/db';
import { getFirestoreEvents } from '@/lib/firebase';

export async function seedLocalDB(organizerId: string) {
  const events = await getFirestoreEvents(organizerId);
  await db.events.bulkPut(events); // upsert all
}
```

#### Rules
```
✅ Define the full schema in one file (src/lib/db.ts)
✅ Use useLiveQuery for reactive data in components
✅ Use db.transaction() for multi-table atomic operations
✅ Mark records as dirty: true when modified offline
✅ Always sync dirty records when connection is restored
✅ Use bulkPut() for seeding — never bulkAdd() (breaks on duplicates)
❌ Never query Firestore directly in components — go through Dexie first
❌ Never store blobs/images in Dexie — store URLs only
❌ Never forget to handle the case where useLiveQuery returns undefined (loading state)
```

---

### 17.7 Haptics (Vibration Feedback)

**Purpose:** Physical feedback for check-in confirmations, errors, QR scan success, and drag interactions. Makes the app feel native.

#### Installation (PWA approach — no Capacitor needed)
```bash
# No install needed — uses navigator.vibrate Web API
# For Capacitor (if adding native wrapper later):
# npm install @capacitor/haptics
```

#### Haptics Utility
```tsx
// src/lib/haptics.ts

// Check browser support once
const supportsHaptics = 'vibrate' in navigator;

export const Haptics = {
  // Light — chip select, toggle, tab switch
  light: () => {
    if (supportsHaptics) navigator.vibrate(10);
  },

  // Medium — button press, form submit, card tap
  medium: () => {
    if (supportsHaptics) navigator.vibrate(25);
  },

  // Heavy — check-in success, QR scan confirmed
  success: () => {
    if (supportsHaptics) navigator.vibrate([30, 50, 80]);
  },

  // Error — scan failed, duplicate check-in, validation error
  error: () => {
    if (supportsHaptics) navigator.vibrate([50, 30, 50, 30, 50]);
  },

  // Warning — approaching capacity, seat conflict
  warning: () => {
    if (supportsHaptics) navigator.vibrate([20, 40, 20]);
  },

  // Selection change — drag seat, scroll snap
  selection: () => {
    if (supportsHaptics) navigator.vibrate(8);
  },
};

// If using Capacitor native wrapper (future):
// import { Haptics as CapHaptics, ImpactStyle } from '@capacitor/haptics';
// export const Haptics = {
//   light:   () => CapHaptics.impact({ style: ImpactStyle.Light }),
//   medium:  () => CapHaptics.impact({ style: ImpactStyle.Medium }),
//   success: () => CapHaptics.notification({ type: NotificationType.Success }),
//   error:   () => CapHaptics.notification({ type: NotificationType.Error }),
// };
```

#### Usage
```tsx
import { Haptics } from '@/lib/haptics';

// Check-in button
async function handleCheckIn(guestId: string) {
  try {
    await checkInGuest(guestId, staffId, 'manual');
    Haptics.success();
    showToast('Guest checked in!', 'success');
  } catch (error) {
    Haptics.error();
    showToast('Check-in failed', 'error');
  }
}

// Filter chip select
<button onClick={() => { setFilter(chip); Haptics.light(); }}>
  {chip}
</button>

// QR scan result
function onScanResult(result: string) {
  if (isValidGuest(result)) {
    Haptics.success();
  } else {
    Haptics.error();
  }
}

// Seat drag (fire on each snap position)
function onSeatDrop(seatId: string, x: number, y: number) {
  Haptics.selection();
  updateSeatPosition(seatId, x, y);
}
```

#### Rules
```
✅ Always wrap in try/catch — vibrate() can throw on some browsers
✅ Use success pattern (triple pulse) only for confirmed check-ins and QR scans
✅ Use light for all selection/toggle interactions
✅ Use error pattern for all failure states
✅ Keep patterns short — max 3 pulses, never more than 200ms total
❌ Never use haptics on page transitions — only on user actions
❌ Never use haptics without a corresponding visual feedback
❌ Never use continuous vibration — always discrete pulses
```

---

### 17.8 Firebase Cloud Messaging (FCM)

**Purpose:** Push notifications for event-day alerts: guest arrival milestones, capacity warnings, payment confirmations, and staff coordination messages.

#### Installation
```bash
# Already in Firebase SDK
npm install firebase
```

#### Setup
```tsx
// src/lib/firebase.ts (add to existing Firebase init)
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase-app'; // your existing Firebase app instance

export const messaging = getMessaging(app);

// public/firebase-messaging-sw.js (service worker — must be in /public)
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '...',
  projectId: 'eventph',
  messagingSenderId: '...',
  appId: '...',
});

const messaging = firebase.messaging();

// Handle background messages (app not in focus)
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data,
  });
});
```

#### FCM Hook
```tsx
// src/hooks/useFCM.ts
import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY;

export function useFCM() {
  const user = useAuthStore((s) => s.user);
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    if (!user) return;

    async function initFCM() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });

        // Save token to Firestore against user profile
        await saveTokenToFirestore(user.uid, token);
      } catch (err) {
        console.warn('FCM init failed:', err);
      }
    }

    initFCM();

    // Handle foreground messages (app is open)
    const unsubscribe = onMessage(messaging, (payload) => {
      showToast(payload.notification?.body ?? 'New notification', 'info');
    });

    return () => unsubscribe();
  }, [user]);
}

// Mount once in root App.tsx
// <FCMProvider /> or call useFCM() in App component
```

#### Notification Types for EventPH
```tsx
// Notification payload conventions (set in Firebase Functions)
// These are the notification types you'll send from backend:

type NotificationType =
  | 'check_in_milestone'  // "50 guests checked in!"
  | 'capacity_warning'    // "90% capacity reached"
  | 'payment_confirmed'   // "₱2,500 ticket payment received"
  | 'guest_arrived'       // VIP guest arrival alert
  | 'event_starting'      // "Your event starts in 30 minutes"
  | 'staff_message';      // Team coordination message

// Payload structure
{
  notification: {
    title: 'EventPH',
    body: '50 guests have checked in! 🎉',
  },
  data: {
    type: 'check_in_milestone',
    eventId: 'evt_123',
    count: '50',
  }
}
```

#### Rules
```
✅ Always request permission after a user action (button tap) — never on page load
✅ Save FCM token to Firestore so backend can target specific users
✅ Handle both foreground (onMessage) and background (service worker) notifications
✅ Show in-app toast for foreground messages — don't let browser show duplicate
✅ Store VAPID key in .env as VITE_FCM_VAPID_KEY
✅ Put firebase-messaging-sw.js in /public — Vite serves it at root
❌ Never show notification permission prompt on first app load
❌ Never hard-code VAPID key in source code
❌ Never assume token is still valid — refresh on app resume
```

---

### 17.9 Workbox (PWA / Service Worker)

**Purpose:** Offline caching, background sync, and PWA install support via `vite-plugin-pwa`. Ensures EventPH works at event venues with poor connectivity — critical for Mindanao.

#### Installation
```bash
npm install -D vite-plugin-pwa
npm install workbox-window
```

#### Vite Config
```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',      // prompt user to update, don't auto-reload
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'EventPH',
        short_name: 'EventPH',
        description: 'Event management for Filipino organizers',
        theme_color: '#FF6B4A',
        background_color: '#FAFAF9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        // Cache strategies per asset type
        runtimeCaching: [
          {
            // App shell — cache first (always serve from cache)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            // API calls — network first, fallback to cache
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-cache', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 } },
          },
          {
            // Images — stale-while-revalidate
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            // Event data JSON — network first
            urlPattern: /^https:\/\/.*\/api\/events.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'events-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 } },
          },
        ],
        // Pre-cache app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        // Don't cache Firebase messaging SW (it manages itself)
        navigateFallbackDenylist: [/firebase-messaging-sw\.js/],
      },
    }),
  ],
});
```

#### PWA Install Prompt
```tsx
// src/hooks/usePWAInstall.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setInstallEvent(null);
  };

  return { canInstall: !!installEvent && !isInstalled, install, isInstalled };
}

// Usage — show install banner
export function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  if (!canInstall) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-surface-raised rounded-xl shadow-xl p-4 flex items-center gap-3 border border-neutral-200">
      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
        <span className="text-lg">📲</span>
      </div>
      <div className="flex-1">
        <p className="font-display font-semibold text-heading-sm text-neutral-900">Install EventPH</p>
        <p className="font-body text-caption-lg text-neutral-500">Works offline at your venue</p>
      </div>
      <button onClick={install} className="rounded-full bg-primary-400 text-white px-4 h-9 font-display font-semibold text-label-sm">
        Install
      </button>
    </div>
  );
}
```

#### Online/Offline Detection
```tsx
// src/hooks/useOnlineStatus.ts
import { useState, useEffect } from 'react';
import { syncToFirebase } from '@/lib/db';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const online  = () => { setIsOnline(true);  syncToFirebase(); };
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  return isOnline;
}

// Offline indicator banner
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 font-display font-semibold text-label-sm">
      📶 Offline mode — changes will sync when connected
    </div>
  );
}
```

#### Rules
```
✅ Use registerType: 'prompt' — never 'autoUpdate' (avoids data loss mid-event)
✅ Use NetworkFirst for all API/Firestore calls
✅ Use CacheFirst only for fonts and static assets that never change
✅ Always trigger syncToFirebase() when going back online
✅ Show OfflineBanner whenever isOnline is false
✅ Put firebase-messaging-sw.js in navigateFallbackDenylist
✅ Test offline mode in Chrome DevTools → Network → Offline before every release
❌ Never use autoUpdate during event-day — it can reload mid-check-in
❌ Never cache authentication tokens in Workbox — Firebase handles that
❌ Never skip the install prompt — it's a key onboarding moment for provincial users
```

---

## 18. Library Installation Summary

Run this once to install all EventPH libraries:

```bash
# Core
npm install react-router-dom@6

# State
npm install zustand

# Animation & Gesture
npm install framer-motion
npm install @react-spring/web
npm install @use-gesture/react

# UI Components
npm install vaul

# Offline Database
npm install dexie dexie-react-hooks

# PWA
npm install -D vite-plugin-pwa
npm install workbox-window

# Firebase (includes FCM)
npm install firebase

# Icons
npm install lucide-react
```

---

## 19. Library Interaction Map

```
User Action
    │
    ├─ Tap/Gesture ──→ @use-gesture/react ──→ Framer Motion (animate)
    │                                      └─→ Haptics (vibrate)
    │
    ├─ Navigation ──→ React Router v6 ──→ Framer Motion (page transition)
    │
    ├─ Data Change ──→ Zustand (state) ──→ Component re-render
    │              └─→ Dexie.js (offline DB) ──→ Firebase (sync when online)
    │
    ├─ Bottom Sheet ──→ Vaul ──→ Zustand (open/close state)
    │
    ├─ Push Notification ──→ FCM ──→ Zustand (showToast)
    │                             └─→ Haptics (success/info pulse)
    │
    └─ Offline / Online ──→ Workbox (serve cached) ──→ Dexie.js (sync dirty records)
```

---

*This design system is part of the EventPH PROJECT_CONTEXT. Reference this before writing any UI component, hook, or store. When in doubt about radius → Section 5. Typography → Section 3. Library patterns → Section 17.*
