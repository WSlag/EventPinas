# EventPH Marketplace Wireframe Documentation

**Version:** 2.0 — Updated: Beautiful UI/UX redesign + typography system + all missing pages  
**Last Updated:** April 2026  
**File:** `eventph-marketplace-v3.jsx` *(v1: eventph-marketplace.jsx)*  
**Type:** React Interactive Wireframe — Public Marketplace + Payment  
**Owner:** Warlito "Lito" Lagbas · Davao City, Philippines

---

## Table of Contents

1. [Overview](#1-overview)
2. [App Architecture](#2-app-architecture)
3. [Navigation System](#3-navigation-system)
4. [Page Index](#4-page-index)
5. [Page-by-Page Specification](#5-page-by-page-specification)
   - 5B. [Authentication & Access Control](#5b-authentication--access-control)
6. [Monetization Model](#6-monetization-model)
7. [Pricing Tiers](#7-pricing-tiers)
8. [Paywall Strategy](#8-paywall-strategy)
9. [Payment Gateway — PayMongo](#9-payment-gateway--paymongo)
10. [Freelancer Payment Setup](#10-freelancer-payment-setup)
11. [Revenue Streams](#11-revenue-streams)
12. [Registration Roadmap](#12-registration-roadmap)
13. [Payment Methods Supported](#13-payment-methods-supported)
14. [Transaction Fees Reference](#14-transaction-fees-reference)
15. [Firebase + PayMongo Integration](#15-firebase--paymongo-integration)
16. [Design System (v2.0)](#16-design-system-v20)
    - 16A. [Color Tokens](#16a-color-tokens)
    - 16B. [Typography System](#16b-typography-system)
    - 16C. [CSS Variable System](#16c-css-variable-system)
    - 16D. [Border Radius & Spacing](#16d-border-radius--spacing)
    - 16E. [Shadow System](#16e-shadow-system)
    - 16F. [Animation & Micro-interactions](#16f-animation--micro-interactions)
    - 16G. [SVG Icon Library](#16g-svg-icon-library)
    - 16H. [Button Styles](#16h-button-styles)
17. [Data Models](#17-data-models)
18. [Do's and Don'ts](#18-dos-and-donts)

---

## 1. Overview

The EventPH Marketplace is the **public-facing front end** of the EventPH platform — a two-sided marketplace connecting:

- **Event Attendees** — discover and buy tickets for events in Mindanao and beyond
- **Event Suppliers** — caterers, florists, photographers, bands, AV rentals, etc. showcasing their services
- **Event Organizers** — professional coordinators available for hire
- **Advertisers** — suppliers and organizers paying for featured placement in the ad carousel

The homepage and all directory pages are **fully public** (no login required). The on-site Event Management App (all 19 screens in `eventph-wireframe.jsx`) is **exclusively for Event Organizers** and requires both **login and active payment**.

Suppliers and attendees cannot access the Event Management App — it is not their tool. They have their own flows (supplier profile creation, ticket purchasing) which are separate.

### Platform Type
Two-sided event marketplace + organizer-exclusive paid on-site management tool.

### Target Users

| User Type | Browse Marketplace | Use Event App | Login Required |
|---|---|---|---|
| Guest (not logged in) | ✅ Yes | ❌ No | ❌ |
| Logged-in Attendee | ✅ Yes | ❌ No | ✅ |
| Logged-in Supplier | ✅ Yes | ❌ No | ✅ |
| Logged-in Organizer (unpaid) | ✅ Yes | ❌ No (paywall shown) | ✅ |
| Logged-in Organizer (paid) | ✅ Yes | ✅ **Full access** | ✅ |

### Core Rule
> **The Event Management App is for Event Organizers only. Login is required. Payment is required. No exceptions.**

---

## 2. App Architecture

```
eventph-marketplace-v3.jsx
│
├── GlobalCSS()              — Injects Google Fonts + CSS variables + keyframes + utility classes
│
├── App()                    — Root component: page state, user state, favorites state
│
├── TopNav()                 — Sticky nav, scroll-reactive frosted glass
│   ├── Row 1 (ink dark)    — Role switcher + Login/Join buttons
│   └── Row 2 (cream)       — Logo + search input + notification bell
│
├── BottomNav()              — Fixed 5-tab bar with SVG icons + top-pip active indicator
│
├── Pages — Public (no auth)
│   ├── HomePage()           — Carousel, category chips, events grid, supplier row, organizer list
│   ├── EventsPage()         — Full event listing with filter chips
│   ├── SuppliersPage()      — 2-column supplier grid with favorites
│   ├── OrganizersPage()     — Full-width organizer list
│   ├── AppMarketingPage()   — Event app features landing page
│   ├── SearchPage()         — Tabbed results: All / Events / Suppliers
│   └── SavedPage()          — Favorites/wishlist page
│
├── Pages — Detail (no auth)
│   ├── EventDetail()        — Event hero, ticket bar, tabs (About / Venue)
│   ├── SupplierDetail()     — Profile hero, tabs (Portfolio / Packages / Reviews / Info)
│   └── OrganizerDetail()   — Profile hero, tabs (About / Past Events / Pricing)
│
├── Pages — Auth (no auth required to view)
│   ├── LoginPage()          — Phone + password + social login
│   └── RegisterPage()       — 2-step: role select → form
│
├── Pages — Authenticated / Paid
│   ├── PaywallPage()        — Plan selector + payment method picker
│   ├── AccountPage()        — Role-aware account hub
│   ├── MessagesPage()       — Inbox list
│   ├── NotifsPage()         — Notification feed
│   ├── SubscriptionPage()   — Current plan + history + cancel
│   ├── AdminPage()          — Platform metrics + action queue (organizer only in demo)
│   ├── ReportPage()         — Dispute / report submission
│   └── OnboardingPage()     — 4-step illustrated first-run walkthrough
│
└── Shared Components (31 total)
    ├── Section()            — Section wrapper with display headline + action link
    ├── PageHeader()         — Page title + subtitle (Fraunces display)
    ├── BackBtn()            — Back arrow with SVG icon
    ├── FilterChip()         — Pill filter button with active state
    ├── Badge()              — Color-coded label pill
    ├── FormInput()          — Focus-animated input field
    ├── EmptyState()         — Centered emoji + text + optional CTA
    ├── ErrorState()         — Not found screen
    ├── SkeletonList()       — Shimmer loading placeholder
    ├── HomeIcon()           — SVG nav icon
    ├── CalIcon()            — SVG nav icon
    ├── GridIcon()           — SVG nav icon
    ├── HeartIcon()          — SVG nav icon
    └── PersonIcon()         — SVG nav icon
```

### State Management
```js
const [page, setPage]     = useState("home");
const [detail, setDetail] = useState(null); // { type: "event"|"supplier"|"organizer", id }
const [user, setUser]     = useState(null); // null = guest
const [favorites, setFav] = useState([1,3]); // array of supplier IDs

// Navigation function — resets scroll on every page change
const go = (p, d = null) => { setPage(p); setDetail(d); window.scrollTo(0,0); };

// Favorites toggle
const toggleFav = id => setFav(f => f.includes(id) ? f.filter(x=>x!==id) : [...f,id]);
```

---

## 3. Navigation System

### Top Navigation — Row 1 (Ink Dark Bar, 34px height)

**Left side — Role Switcher:**
```
I am a  [🤝 Supplier]  [📋 Organizer]  [📱 Event App]
```
- Pill buttons; active = brand coral with shadow glow
- Font: Outfit 700, 11px
- Active pill: `background: T.brand, boxShadow: 0 2px 8px rgba(232,82,42,0.35)`

**Right side:**
```
[Log In]  [Join Free]
```
- Log In = ghost with `rgba(255,255,255,0.2)` border
- Join Free = coral filled pill

### Top Navigation — Row 2 (Warm Cream, 54px height, scroll-reactive)

```
[E logo] EventPH  |  [Search input]  |  [🔔 bell]
```
- Logo: gradient coral square (border-radius 10px), Fraunces display font
- Search: pill input with SVG search icon, coral border on focus
- Bell: square button (border-radius 10px) with red notification dot
- **Scroll reactive**: at scroll > 8px → `backdrop-filter: blur(12px)` + border bottom appears, `transition: all 250ms ease`

### Bottom Navigation (Fixed, SVG icons + top-pip active indicator)

```
[Home]  [Events]  [Suppliers]  [Saved]  [Account]
```
- 5 tabs using custom SVG icons (not emoji)
- Active state: icon + label both turn coral, 24×2.5px coral pip appears at top of tab
- Inactive: all elements use `T.text4` color
- Height: auto with `padding: 10px 0 12px` + `env(safe-area-inset-bottom)` for iOS notch
- Box shadow: `0 -4px 24px rgba(26,15,10,0.06)` — subtle warm lift

### Navigation Changes vs v1

| Element | v1 | v2/v3 |
|---|---|---|
| Logo font | Plus Jakarta Sans | **Fraunces display serif** |
| Logo shape | Circle | **Rounded square (border-radius 10px)** |
| Nav background | Pure white | **Warm cream (#FDF8F4)** |
| Bottom tabs | Emoji icons | **Custom SVG icons** |
| Active indicator | Underline bar | **Top-edge pip** |
| Scroll behavior | Static | **Frosted glass on scroll** |
| Search border | Cream | **Coral on focus with transition** |

---

## 4. Page Index

| Page ID | Component | URL Path | Auth Required | Role Required |
|---|---|---|---|---|
| `home` | `HomePage` | `/` | ❌ Public | Any |
| `events` | `EventsPage` | `/events` | ❌ Public | Any |
| `events` + detail | `EventDetail` | `/events/:id` | ❌ Public | Any |
| `suppliers` | `SuppliersPage` | `/suppliers` | ❌ Public | Any |
| `suppliers` + detail | `SupplierDetail` | `/suppliers/:id` | ❌ Public | Any |
| `organizers` | `OrganizersPage` | `/organizers` | ❌ Public | Any |
| `organizers` + detail | `OrganizerDetail` | `/organizers/:id` | ❌ Public | Any |
| `apppage` | `AppMarketingPage` | `/app` | ❌ Public (marketing) | Any |
| `search` | `SearchPage` | `/search?q=…` | ❌ Public | Any |
| `saved` | `SavedPage` | `/saved` | ❌ Public | Any |
| `login` | `LoginPage` | `/login` | ❌ Public | Any |
| `register` | `RegisterPage` | `/register` | ❌ Public | Any |
| `paywall` | `PaywallPage` | `/subscribe` | ✅ Must be logged in | Organizer only |
| `account` | `AccountPage` | `/account` | ✅ Must be logged in | Any |
| `messages` | `MessagesPage` | `/messages` | ✅ Must be logged in | Any |
| `notifs` | `NotifsPage` | `/notifications` | ✅ Must be logged in | Any |
| `subscrip` | `SubscriptionPage` | `/subscription` | ✅ Must be logged in | Organizer |
| `admin` | `AdminPage` | `/admin` | ✅ Must be logged in | Organizer (demo) |
| `report` | `ReportPage` | `/report` | ❌ Public | Any |
| `onboard` | `OnboardingPage` | `/welcome` | ✅ Post-payment | Organizer |
| Event App screens | `eventph-wireframe.jsx` | `/manage/*` | ✅ Login + Payment | **Organizer only** |

### Page Access Summary

```
PUBLIC (no login required)
  Home · Events · Event Detail · Suppliers · Supplier Profile
  Organizers · Organizer Profile · App Marketing · Search · Saved
  Login · Register · Report

AUTHENTICATED (any logged-in user)
  Account · Messages · Notifications

ORGANIZER + PAID ONLY
  Paywall (for new payment) · Subscription Management
  Onboarding · Event App (/manage/*)
```

---

## 5. Page-by-Page Specification

---

### Page 1 — Homepage 🏠

**Component:** `HomePage`  
**Access:** Public (no login)  
**Purpose:** Discovery hub for events, featured suppliers, and organizers. Revenue-generating via ad carousel.

#### Layout Structure
```
┌─────────────────────────────────────────┐
│  Top Navigation (sticky)                │
│  Role switcher + Search                 │
├─────────────────────────────────────────┤
│  AD CAROUSEL (paid advertisements)      │
│  [Slide] [Slide] [Slide]               │
│  ← ●○○ →                              │
├─────────────────────────────────────────┤
│  Category Filter Chips (horizontal)     │
│  All | Wedding | Reunion | Festival...  │
├─────────────────────────────────────────┤
│  Upcoming Events — 2-column grid        │
│  [Card] [Card]                          │
│  [Card] [Card]                          │
├─────────────────────────────────────────┤
│  Featured Suppliers — horizontal scroll │
│  → [Card] [Card] [Card] [Card] →        │
├─────────────────────────────────────────┤
│  Top Organizers — vertical list         │
│  [Row] [Row] [Row]                      │
├─────────────────────────────────────────┤
│  CTA Banner: "Are you a Supplier?"      │
├─────────────────────────────────────────┤
│  Bottom Navigation (fixed)              │
└─────────────────────────────────────────┘
```

#### Ad Carousel Component

**Purpose:** Paid advertisement slots for suppliers and organizers.  
**Behavior:**
- Auto-advances every 3,500ms (3.5 seconds)
- Manual override via dot indicators (tap to jump to slide)
- ◀ ▶ arrow buttons on left and right
- CSS transition: `transform 400ms cubic-bezier(0.4,0,0.2,1)`

**Best Practices Applied (from UX research):**
- Each slide has one clear visual focus and one CTA button
- Short copy only — headline + subtitle + single button
- Dot indicators show total count and current position
- Manual controls prevent auto-advance frustration
- High-contrast CTA button per slide's brand color

**Ad Slot Data Structure:**
```js
{
  id: 1,
  brand: "Blooms & Petals",          // Advertiser name
  tag: "FEATURED SUPPLIER",          // Badge label (top-left of slide)
  headline: "Transform Your Event…", // Max 8 words
  sub: "Weddings · Debuts · Corporate", // Short descriptor
  cta: "View Packages",              // CTA button text
  gradient: "linear-gradient(…)",    // Slide background
  accent: "#FF6B4A",                 // CTA button + tag color
}
```

**Ad Pricing (for advertisers):**

| Slot | Duration | Price |
|---|---|---|
| Standard (1 slide) | 1 week | ₱500 |
| Standard (1 slide) | 1 month | ₱1,500 |
| Premium (1 slide, always first) | 1 week | ₱1,000 |
| Premium (1 slide, always first) | 1 month | ₱3,000 |

**Default Slides (3):**

| # | Brand | Tag | CTA |
|---|---|---|---|
| 1 | Blooms & Petals | FEATURED SUPPLIER | View Packages |
| 2 | Chef Reyes Catering | PROMOTED | Get Quote |
| 3 | Snap & Click Studio | TOP RATED ⭐ 4.9 | Book Now |

#### Category Filter Chips
Horizontal scrollable pill bar below the carousel.

```
[All] [Wedding] [Reunion] [Festival] [Concert] [Corporate] [Community] [Debut] [Expo]
```

- Active chip = coral background + white text
- Inactive chip = white background + border + dark gray text
- Filters the Upcoming Events grid below it
- All chips use `rounded-full` (9999px) — consistent with design system

#### Upcoming Events Grid
2-column grid showing up to 4 events by default. "See All →" links to Events page.

**Event Card Structure:**
```
┌──────────────────────────┐
│  [Hero image / emoji]    │  ← 90px height, gradient dark bg
│  [Badge — Hot/Free/New]  │  ← Positioned top-right
├──────────────────────────┤
│  Event Title (2 lines max)│
│  📅 Date · 📍 Venue      │
│  ₱250    [sold% bar]     │
└──────────────────────────┘
```

**Badge Colors:**
| Badge | Color |
|---|---|
| Hot | Red |
| Free | Green |
| New | Teal |
| Selling Fast | Brand coral |
| Limited | Brand coral |

#### Featured Suppliers Row
Horizontal scroll row (overflow-x: auto). Shows featured suppliers first, then non-featured.

**Supplier Mini-Card:**
```
┌───────────────┐
│  [Emoji icon] │  ← 48x48 rounded-lg
│  Name         │
│  Category     │
│  ★ 4.9 (128) │
│  ✓ Verified   │
└───────────────┘
```

- Tap → navigates to `SupplierProfile`
- Featured cards have coral border accent

#### Top Organizers List
Vertical list of top 3 organizers. "View All →" links to Organizers page.

**Organizer Row:**
```
[52px icon] Name                    ₱15,000+
            Specialty · City        ✓ Verified
            ⭐ 4.9 (87) · 📅 134 events
```

#### CTA Banner
Teal gradient banner at bottom of homepage:
```
📣 Are you an Event Supplier?
   Join 500+ verified suppliers reaching
   thousands of event hosts across Mindanao.
   [List Your Services →]
```

---

### Page 2 — Events Page 🎉

**Component:** `EventsPage`  
**Access:** Public  
**Purpose:** Full listing of all events with category filtering.

#### Layout
```
┌─────────────────────────────────────────┐
│  "🎉 Events Near You" heading           │
│  Category filter chips (horizontal)     │
├─────────────────────────────────────────┤
│  Event List (full-width horizontal cards)│
│  [Image] Title + Badge                  │
│           Date · Venue                  │
│           [Category pill]    ₱Price     │
│           [Progress bar]               │
│           X% sold                       │
└─────────────────────────────────────────┘
```

**Event Card (list format):**
- Left: 90px emoji/image area
- Right: Full details with sold percentage progress bar
- Tapping a card → future: Event Detail page (not yet in wireframe)

**Default Events (6):**

| Title | Date | Venue | Price | Category | Badge |
|---|---|---|---|---|---|
| Davao Food & Wine Festival | Jul 5 | People's Park | ₱350 | Festival | Hot |
| Santos Family Reunion 2026 | Jun 15 | SMX Convention | ₱250 | Reunion | Selling Fast |
| Mindanao Tech Summit | Jul 22 | SM Mall of Davao | Free | Corporate | Free |
| Davao City Fiesta Night | Aug 2 | Magsaysay Park | ₱150 | Festival | — |
| Wedding Expo 2026 | Aug 10 | Abreeza Mall | Free | Expo | New |
| OPM Acoustic Night | Aug 18 | Jack's Ridge | ₱400 | Concert | Limited |

---

### Page 3 — Suppliers Page 🤝

**Component:** `SuppliersPage`  
**Access:** Public  
**Purpose:** Directory of all verified event suppliers.

#### Layout
```
┌─────────────────────────────────────────┐
│  "🤝 Event Suppliers" heading + desc   │
├─────────────────────────────────────────┤
│  JOIN CTA Banner (supplier acquisition) │
│  "List Your Services for Free →"        │
├─────────────────────────────────────────┤
│  Category filter chips                  │
│  Sort dropdown                          │
│  X suppliers found                      │
├─────────────────────────────────────────┤
│  2-column supplier card grid            │
└─────────────────────────────────────────┘
```

#### Join CTA Banner
Light coral gradient banner to recruit new suppliers:
```
📣 List Your Services for Free
   Get discovered by thousands of event organizers
   [Join Now]
```

#### Category Filters (11)
All | Florist | Catering | Photography | AV/Sound | Live Band | DJ | Party Rental | Event Styling | Transport | Decoration

#### Sort Options
- Featured First (default)
- Top Rated
- Most Reviews
- Most Booked

#### Supplier Card (2-column grid)
```
┌──────────────────────┐
│  FEATURED badge      │  ← Absolute positioned, top-left
│  [80px hero area]    │  ← Emoji icon, light background
├──────────────────────┤
│  Supplier Name       │
│  Category · City     │
│  ★ 4.9 (128 reviews)│
│  ₱3,500+  ✓Verified  │
└──────────────────────┘
```

- Featured cards have coral border (1.5px)
- Tap → `SupplierProfile` page

#### Default Suppliers (8)

| Name | Category | City | Rating | Reviews | Price | Verified | Featured |
|---|---|---|---|---|---|---|---|
| Blooms & Petals | Florist | Davao City | 4.9 | 128 | ₱3,500+ | ✅ | ✅ |
| Chef Reyes Catering | Catering | Davao City | 4.8 | 214 | ₱280/head | ✅ | ✅ |
| Snap & Click Studio | Photography | Davao City | 4.9 | 176 | ₱15,000+ | ✅ | ❌ |
| Soundwave AV Rentals | AV/Sound | Davao City | 4.7 | 93 | ₱8,500+ | ✅ | ❌ |
| Luna & The Moons | Live Band | Davao City | 4.8 | 62 | ₱12,000+ | ✅ | ❌ |
| DJ Mike Torino | DJ | Davao City | 4.6 | 44 | ₱3,500+ | ❌ | ❌ |
| Party Palace Rentals | Party Rental | Tagum City | 4.5 | 31 | ₱5,000+ | ✅ | ❌ |
| Elegant Occasions | Event Styling | CDO City | 4.7 | 55 | ₱8,000+ | ✅ | ❌ |

---

### Page 4 — Organizers Page 📋

**Component:** `OrganizersPage`  
**Access:** Public  
**Purpose:** Directory of professional event organizers available for hire.

#### Layout
Same structure as Suppliers page but with teal accent color.

```
┌─────────────────────────────────────────┐
│  "📋 Event Organizers" heading + desc  │
├─────────────────────────────────────────┤
│  JOIN CTA (teal) — "Are You an Organizer?" │
├─────────────────────────────────────────┤
│  Specialty filter chips                 │
│  X organizers found                     │
├─────────────────────────────────────────┤
│  Full-width organizer list cards        │
└─────────────────────────────────────────┘
```

#### Organizer Card (Full-width list)
```
[TOP RATED badge — absolute]
[52px icon]  Name                    ₱15,000+
             Specialty · 📍 City     ✓ Verified
             ⭐ 4.9 (87) · 📅 134 events
             [Tag] [Tag] [Tag]
```

#### Default Organizers (6)

| Name | Specialty | City | Rating | Events | Price | Verified |
|---|---|---|---|---|---|---|
| Lito Lagbas Events | Reunions & Fiestas | Davao City | 4.9 | 134 | ₱15,000+ | ✅ |
| Ana Events Co. | Weddings & Debuts | Davao City | 4.9 | 89 | ₱25,000+ | ✅ |
| Mindanao MICE Group | Corporate & MICE | Davao City | 4.8 | 58 | ₱50,000+ | ✅ |
| Celebration Heroes | Children & Birthdays | Tagum City | 4.7 | 212 | ₱8,000+ | ✅ |
| Grand Fiesta Co. | Fiestas & Community | CDO City | 4.6 | 76 | ₱12,000+ | ❌ |
| Elite Corporate PH | Corporate Events | Davao City | 4.8 | 44 | ₱35,000+ | ✅ |

---

### Page 5 — Event App Page 📱

**Component:** `EventAppPage`  
**Access:** Public (marketing/landing page)  
**Purpose:** Showcase the on-site event management app and drive conversions to the paywall.

#### Layout
```
┌─────────────────────────────────────────┐
│  Dark hero card                         │
│  [E icon] EventPH App                  │
│  Tagline + description                  │
│  [Open Event App →] CTA                │
├─────────────────────────────────────────┤
│  "Key Features" heading                 │
│  2-column feature grid (8 features)    │
├─────────────────────────────────────────┤
│  Offline capability banner (green)      │
└─────────────────────────────────────────┘
```

#### Feature Grid (8 cards)
| Icon | Feature | Description |
|---|---|---|
| ✅ | QR Check-in | Scan guests in seconds at the gate |
| 🪑 | Seating Manager | Drag-and-drop floor plan builder |
| 📊 | Live Analytics | Real-time attendance and revenue data |
| 📲 | Walk-in Reg | Register guests on-site in 4 steps |
| 📣 | Announcements | Push SMS and notifications to guests |
| 🎬 | Program Rundown | Live event timeline with NOW/NEXT |
| 🤝 | Vendor Tracker | Manage all suppliers and payments |
| ⬛ | QR Generator | Generate and print guest QR badges |

**[Open Event App →] CTA** triggers the paywall (user must pay to access).

#### Offline Banner
```
✓ Works Offline
EventPH App works even without internet at your venue.
All check-ins sync automatically when connectivity is restored.
```

---

### Page 6 — Supplier Profile Page 👤

**Component:** `SupplierProfile`  
**Access:** Public  
**Purpose:** Individual supplier showcase with portfolio, packages, reviews, and contact info.

#### Navigation
"← Back to Suppliers" button at top → returns to `/suppliers`

#### Hero Card
Dark gradient card showing:
- Supplier emoji icon (64x64, rounded-lg)
- Name + Verified badge + Featured badge
- Category · City
- Star rating with review count
- 3 stat chips: Events Done | Starting At | Location

#### CTA Buttons (below hero)
```
[📩 Get Quote]  [💬 Message]  [❤️]
```

#### Tag Pills
Specialty tags in coral background (e.g., Wedding, Debut, Corporate)

#### 4-Tab Content Area

**Tab 1: Portfolio**
- 3×2 photo grid (emoji placeholder photos)
- Bio paragraph
- Specializations tag cloud

**Tab 2: Packages**
3 pricing tiers:

| Package | Price | Notable |
|---|---|---|
| Basic | ₱3,500 | 3 inclusions |
| Standard | ₱7,500 | Popular badge |
| Premium | ₱15,000 | Full service |

Each package shows:
- Package name + price
- Checkmark list of inclusions
- [Select This Package] button

**Tab 3: Reviews**
- Overall rating summary (star breakdown bars 5→1)
- Individual review cards:
  - Avatar initial + name + event type + date
  - Star rating
  - Comment text

**Tab 4: Info**
Key-value info table:
- Business Type, Operating Since, Coverage Area
- Response Time, Payment Methods, Contact, Email, Facebook
- DTI verification notice (green banner)

#### Example Supplier: Blooms & Petals
- Category: Florist
- Rating: 4.9 (128 reviews)
- Events Done: 89 bookings
- Coverage: Davao City, Davao del Norte, Davao del Sur, Sarangani
- Payment Methods: GCash, Bank Transfer, Cash
- Response Time: Within 2 hours

---

### Page 7 — Organizer Profile Page 👤

**Component:** `OrganizerProfile`  
**Access:** Public  
**Purpose:** Individual organizer showcase with experience, past events, reviews, and pricing.

#### Hero Card
Teal gradient card (same structure as Supplier Profile but teal theme).

#### CTA Buttons
```
[📩 Hire This Organizer]  [💬 Message]  [❤️]
```

#### 4-Tab Content Area

**Tab 1: About**
- Bio paragraph
- 4 stat cards: Events Managed | Avg Rating | Coverage | Years Active
- "What We Handle" tag cloud (10 services)

**Tab 2: Past Events**
List of recent events with:
- Event emoji by type (Wedding 💍, Reunion 👨‍👩‍👧‍👦, Corporate 🏢, Community 🎉)
- Event title, guest count, event type, year
- Star rating

**Tab 3: Reviews**
Same star breakdown + review cards format as Supplier Profile.

**Tab 4: Pricing**
3 packages:
| Package | Price | Description |
|---|---|---|
| Day-of Coordination | ₱15,000 | 8 hours on event day |
| Full Event Package | ₱35,000 | Best Value badge — planning to execution |
| Corporate Premium | ₱50,000+ | 200+ pax, full logistics |

---

## 5B. Authentication & Access Control

### Access Architecture

```
EventPH Platform
│
├── PUBLIC — No login, no payment
│   ├── Homepage (carousel, events, suppliers, organizers)
│   ├── Events listing page
│   ├── Suppliers directory + individual profiles
│   ├── Organizers directory + individual profiles
│   └── Event App marketing/features page
│
└── PRIVATE — Login + Payment + Organizer Role Required
    └── Event Management App (all 19 screens)
        ├── Dashboard, Planner, Check-in Scanner
        ├── Seating & Tables, Guest Management
        ├── Staff, Analytics, QR Generator
        ├── Program Rundown, Vendors, Catering
        ├── Feedback, Payments, Incident Log
        ├── Waitlist, Announcements, My Events
        └── ← ONLY Event Organizers can access any of this
```

---

### Auth Flow Diagram

```
User taps [Open Event App →] or [📱 App] tab
                    │
                    ▼
         ┌─── Is user logged in? ───┐
         │                         │
         NO                       YES
         │                         │
         ▼                         ▼
   ┌─────────────┐        Is role = "organizer"?
   │  Login Page │                 │
   │             │          NO     │     YES
   └─────────────┘          │      │      │
         │                  ▼      │      ▼
         │        ┌──────────────┐ │  Has active
         │        │ "This tool   │ │  subscription?
         │        │ is for Event │ │      │
         │        │ Organizers   │ │  NO  │  YES
         │        │ only"        │ │  │   │   │
         │        │              │ │  ▼   │   ▼
         │        │ [Become an   │ │ Paywall  App
         │        │  Organizer→] │ │ Screen   Unlocked
         │        └──────────────┘ │          │
         │                         │          ▼
         ▼                         │       Dashboard
   ┌─────────────────┐             │
   │  Register Page  │             │
   │                 │             │
   │  Choose role:   │             │
   │  ○ Organizer ← │─── Only     │
   │  ○ Supplier     │    this     │
   │  ○ Attendee     │    leads    │
   └─────────────────┘    to app   │
         │                         │
         ▼ (if Organizer)          │
   ┌─────────────────┐             │
   │  Paywall Screen │─────────────┘
   │  Choose plan    │
   │  Pay via GCash  │
   └─────────────────┘
```

---

### Login Page Specification

**Component:** `LoginPage`  
**URL:** `/login`  
**Access:** Public  
**Purpose:** Authenticate existing users of any role.

#### Layout
```
┌─────────────────────────────────────────┐
│  [E]  EventPH                           │
│                                         │
│  Welcome back                           │
│  Log in to your account                 │
│                                         │
│  Phone Number                           │
│  [+63 ____________]                     │
│                                         │
│  Password                               │
│  [••••••••••••]  [Show]                 │
│                                         │
│  [Forgot Password?]                     │
│                                         │
│  [Log In]  ← full width coral button   │
│                                         │
│  ─────────── or ───────────            │
│                                         │
│  [🇬 Continue with Google]              │
│  [📘 Continue with Facebook]            │
│                                         │
│  Don't have an account?                 │
│  [Sign up as Organizer]                 │
│  [Sign up as Supplier]                  │
│  [Sign up as Attendee]                  │
└─────────────────────────────────────────┘
```

#### Field Specifications
| Field | Type | Validation | Notes |
|---|---|---|---|
| Phone Number | tel | +63 format, 10 digits | Pre-filled +63 country code |
| Password | password | Min 8 characters | Toggle show/hide |

#### Login Flow
1. User submits phone + password
2. Firebase Auth `signInWithPhoneNumber` or `signInWithEmailAndPassword`
3. On success → read `users/{uid}.role` from Firestore
4. Route based on role:
   - `organizer` with active sub → `/manage/dashboard`
   - `organizer` without sub → `/subscribe` (paywall)
   - `supplier` → `/suppliers/profile` (their own profile)
   - `attendee` → `/` (homepage, logged in state)

---

### Registration Page Specification

**Component:** `RegisterPage` + `RoleSelectPage`  
**URL:** `/register`  
**Access:** Public  
**Purpose:** Create a new account. Role determines what the user can access.

#### Step 1 — Role Selection

```
┌─────────────────────────────────────────┐
│  [E]  EventPH                           │
│                                         │
│  Join EventPH                           │
│  Choose how you'll use the platform     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📋 Event Organizer              │   │
│  │ Plan and manage events using    │   │  ← HIGHLIGHTED / DEFAULT
│  │ professional on-site tools.     │   │
│  │ Requires payment to use app.    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🤝 Event Supplier               │   │
│  │ List your services and get      │   │
│  │ discovered by organizers.       │   │
│  │ Free to list, paid upgrades.    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎉 Event Attendee               │   │
│  │ Discover and buy tickets for    │   │
│  │ events near you.                │   │
│  │ Always free to browse.          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Continue →]  ← active after selection │
└─────────────────────────────────────────┘
```

#### Step 2 — Registration Form (Organizer path)

```
┌─────────────────────────────────────────┐
│  ← Back    Step 2 of 3                  │
│  ●●○                                    │
│                                         │
│  Create your Organizer account          │
│                                         │
│  Full Name *                            │
│  [________________________]             │
│                                         │
│  Phone Number *                         │
│  [+63 ____________]                     │
│                                         │
│  Email Address                          │
│  [________________________]             │
│                                         │
│  City / Province *                      │
│  [________________________]             │
│                                         │
│  Password *                             │
│  [••••••••••]                           │
│                                         │
│  Confirm Password *                     │
│  [••••••••••]                           │
│                                         │
│  ☐ I agree to Terms & Conditions       │
│    and Privacy Policy                   │
│                                         │
│  [Create Account →]                     │
└─────────────────────────────────────────┘
```

#### Step 3 — Phone Verification

```
┌─────────────────────────────────────────┐
│  ← Back    Step 3 of 3                  │
│  ●●●                                    │
│                                         │
│  Verify your phone number               │
│  We sent a 6-digit code to             │
│  +63 912 *** *456                       │
│                                         │
│  [_] [_] [_] [_] [_] [_]              │
│                                         │
│  Resend code in 0:45                    │
│                                         │
│  [Verify & Continue →]                  │
│                                         │
│  ─────── After verification ───────    │
│                                         │
│  → Goes to Paywall Screen              │
│    (must pay before using the app)      │
└─────────────────────────────────────────┘
```

#### Registration Step Summary

| Step | Organizer | Supplier | Attendee |
|---|---|---|---|
| 1 | Choose role | Choose role | Choose role |
| 2 | Fill registration form | Fill registration form | Fill registration form |
| 3 | Phone OTP verification | Phone OTP verification | Phone OTP verification |
| 4 | **→ Paywall (must pay)** | → Supplier profile setup | → Homepage |

---

### Paywall Screen Specification

**Component:** `PaywallPage`  
**URL:** `/subscribe`  
**Access:** Must be logged in as an Organizer  
**Purpose:** Show pricing plans and collect payment before granting app access.

#### Layout
```
┌─────────────────────────────────────────┐
│  🎉 Unlock EventPH App                  │
│  The complete on-site event management  │
│  toolkit for Filipino organizers        │
│                                         │
│  ─────── Pay Per Event ────────        │
│                                         │
│  ○ Small   up to 50 guests    ₱299     │
│  ○ Medium  51–200 guests      ₱499     │
│  ○ Large   201–500 guests     ₱799     │
│  ○ XL      500+ guests        ₱999     │
│                                         │
│  Valid: 7 days before + 2 days after   │
│  your event date                        │
│                                         │
│  ─────── Subscriptions ─────────      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⭐ Pro Monthly   ₱1,499/month   │   │  ← POPULAR badge
│  │    Unlimited events             │   │
│  │    Up to 3 staff per event      │   │
│  │    Analytics export             │   │
│  │    Priority support             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏆 Annual Plan   ₱7,999/year    │   │
│  │    Save ₱4,000 vs monthly       │   │
│  │    Everything in Pro Monthly    │   │
│  │    5 staff accounts             │   │
│  │    API access                   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ────────── Pay With ───────────       │
│                                         │
│  [📱 GCash]  ← First, largest button  │
│  [💸 Maya]                             │
│  [💳 Credit / Debit Card]              │
│  [⬛ QRPh / Scan to Pay]              │
│                                         │
│  🔒 Secured by PayMongo · BSP licensed │
│  PCI DSS Level 1 · No hidden fees      │
│                                         │
│  Already subscribed? [Log in here →]   │
└─────────────────────────────────────────┘
```

#### Paywall Rules
- **Only shown to logged-in Organizers** — other roles see a "not available" message
- If a Supplier tries to access `/subscribe` → redirect to supplier dashboard
- If an Attendee tries to access `/subscribe` → redirect to homepage
- If an Organizer with active subscription tries to access → redirect to `/manage/dashboard`

#### What Happens After Payment
```
Payment confirmed by PayMongo webhook
          ↓
Firebase Function updates Firestore:
users/{uid}.subscription = {
  status: "active",
  type: "pay-per-event" | "monthly" | "annual",
  expiresAt: Timestamp,
  planId: "small" | "medium" | "large" | "xl" | "pro" | "annual"
}
          ↓
Firebase Auth custom claim set:
{ role: "organizer", subscribed: true }
          ↓
User redirected to /manage/dashboard
          ↓
Confirmation SMS sent via Firebase + Semaphore PH:
"Your EventPH App is now active! Go to eventph.app/manage"
```

---

### Non-Organizer Blocked Screen

When a Supplier or Attendee somehow reaches `/manage` or taps "Open Event App":

```
┌─────────────────────────────────────────┐
│                                         │
│             📋                          │
│                                         │
│   This tool is for Event Organizers     │
│                                         │
│   The EventPH App is exclusively for   │
│   event organizers who plan and manage  │
│   events — from guest check-in to       │
│   seating charts and live analytics.   │
│                                         │
│   [📋 Register as Organizer →]         │
│                                         │
│   ─────────────────────────────        │
│                                         │
│   Looking for something else?           │
│   [🤝 Browse Suppliers]                 │
│   [🎉 Browse Events]                    │
│                                         │
└─────────────────────────────────────────┘
```

---

### Route Guard Implementation

```tsx
// src/components/OrganizerGuard.tsx
// Wraps all Event App routes

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export function OrganizerGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore(s => ({ user: s.user, isLoading: s.isLoading }));

  if (isLoading) return <SplashScreen />;

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → show blocked screen
  if (user.role !== "organizer") return <NotOrganizerScreen />;

  // Organizer but no active subscription → go to paywall
  if (user.subscription?.status !== "active") return <Navigate to="/subscribe" replace />;

  // All checks pass → show app
  return <>{children}</>;
}

// Usage in App.tsx React Router config:
<Route path="/manage/*" element={
  <OrganizerGuard>
    <EventManagementApp />
  </OrganizerGuard>
} />
```

---

### Zustand Auth Store (Updated)

```tsx
// src/stores/useAuthStore.ts

interface User {
  uid: string;
  name: string;
  phone: string;
  email?: string;
  role: "organizer" | "supplier" | "attendee";  // ← Role is critical
  city?: string;
  subscription?: {
    status: "active" | "expired" | "cancelled";
    type: "pay-per-event" | "monthly" | "annual";
    expiresAt: number; // Unix timestamp
    planId: string;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  // Computed helpers
  isOrganizer: () => boolean;
  hasAppAccess: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      logout: () => set({ user: null }),
      isOrganizer: () => get().user?.role === "organizer",
      hasAppAccess: () =>
        get().user?.role === "organizer" &&
        get().user?.subscription?.status === "active",
    }),
    { name: "eventph-auth" }
  )
);
```

---

### Firestore User Schema (Updated)

```js
// users/{userId}
{
  uid: "abc123",
  name: "Lito Lagbas",
  phone: "+63912345678",
  email: "lito@eventph.app",
  city: "Davao City",
  createdAt: Timestamp,

  // ROLE — determines platform access
  role: "organizer",  // "organizer" | "supplier" | "attendee"

  // SUBSCRIPTION — only meaningful for organizers
  subscription: {
    status: "active",          // "active" | "expired" | "cancelled"
    type: "pay-per-event",     // "pay-per-event" | "monthly" | "annual"
    planId: "medium",          // "small"|"medium"|"large"|"xl"|"pro"|"annual"
    expiresAt: Timestamp,      // When access ends
    paymongoCustomerId: "cus_xxx",
    paymongoSubscriptionId: "sub_xxx",  // null for pay-per-event
    eventId: "evt_123",        // Only for pay-per-event — which event
  }
}
```

---

## 6. Monetization Model

### Hybrid: Pay-Per-Event + Optional Subscription

EventPH uses a **hybrid monetization model** based on 2025 industry research:

- **Public marketplace** (homepage, events, suppliers, organizers, profiles) = **always free** — builds trust and organic traffic
- **On-site Event App** (all 19 management screens) = **gated behind login + payment + organizer role**
- **Advertising** (carousel slots, featured listings) = **paid by suppliers/organizers**

#### Why This Model Works for Philippines

Filipino event organizers planning a barangay fiesta or family reunion once a year would resist a monthly subscription. A one-time payment at the moment of **peak intent** (a week before the event) converts far better.

Research findings applied:
- Hard paywalls convert at **12.11% median** vs 2.18% for freemium
- **80–90% of conversions happen on Day 0** — the moment of highest intent
- Hybrid models that combine selective free access with usage-based gating perform best in 2025

---

## 7. Pricing Tiers

### Tier 0 — Public (Free, No Login)
**What's free:**
- Browse all events
- View all supplier profiles and reviews
- View all organizer profiles
- Read event listings
- Search and filter

**What's blocked:**
- On-site event management app (all 19 screens)
- QR scanner, check-in, seating, analytics, etc.

---

### Tier 1 — Pay-Per-Event ₱299–₱999

**Best for:** Organizers planning 1–3 events per year (barangay fiestas, family reunions, school programs, birthdays)

| Event Size | Price | Duration |
|---|---|---|
| Small (up to 50 guests) | ₱299 | 7 days before + 2 days after event |
| Medium (51–200 guests) | ₱499 | 7 days before + 2 days after event |
| Large (201–500 guests) | ₱799 | 7 days before + 2 days after event |
| Extra Large (500+ guests) | ₱999 | 7 days before + 2 days after event |

**Unlocks (for that event only):**
- All 19 on-site management screens
- QR scanner and check-in
- Seating and floor plan builder
- Walk-in registration
- Guest management
- Live analytics
- QR generator and badge printing
- Program rundown
- Vendor tracker
- Catering management
- Announcements / push notifications

---

### Tier 2 — Monthly Subscription ₱999–₱1,499/month

**Best for:** Active organizers running 3+ events/month (wedding coordinators, corporate event firms)

| Plan | Price | Events |
|---|---|---|
| Starter | ₱999/month | Up to 5 events |
| Pro | ₱1,499/month | Unlimited events |

**Unlocks everything in Tier 1 plus:**
- Analytics export (CSV, PDF, Excel)
- Priority customer support
- Custom event branding (logo on QR badges)
- Team accounts (up to 3 staff per event)
- Bulk QR printing

---

### Tier 3 — Annual Plan ₱7,999/year

**Best for:** Professional organizers running 10+ events/year

- Equivalent to ₱667/month (save ₱332/month vs Pro Monthly)
- Everything in Pro Monthly
- Team accounts (up to 5 staff per event)
- API access (for developers)
- Bulk QR printing — unlimited
- Dedicated account support
- Early access to new features

---

### Supplier Listing Tiers

| Plan | Price | Features |
|---|---|---|
| Basic (Free) | ₱0 | Profile listing, basic info, reviews |
| Verified Badge | ₱199 one-time | ✓ Verified badge, priority in search |
| Featured Listing | ₱499/month | Featured card in directory, higher placement |
| Ad Carousel Slot | ₱500–₱3,000/week | Paid advertisement in homepage carousel |

---

### Organizer Listing Tiers

| Plan | Price | Features |
|---|---|---|
| Basic (Free) | ₱0 | Profile listing, basic info, reviews |
| Verified Badge | ₱199 one-time | ✓ Verified badge, "Top Rated" marker |
| Featured Profile | ₱699/month | Featured in organizer directory, homepage |

---

## 8. Paywall Strategy

### Where the Paywall Appears

The paywall appears **only when a user tries to access the Event App** — not before. Visitors browse freely, building trust and intent.

**Trigger points:**
1. Tapping **[Open Event App →]** on the Event App page
2. Tapping **[📱 App]** tab in bottom navigation when not authenticated
3. Tapping **[Check-in Scanner]** or any on-site tool from a shared link

### Paywall Screen Flow

```
User taps "Open Event App"
         ↓
[Paywall Screen — Choose Your Plan]
         ↓
┌──────────────────────────────────────┐
│  🎉 Unlock EventPH App               │
│  The complete on-site event toolkit  │
│                                      │
│  ○ Pay Per Event                     │
│    Small (up to 50)    ₱299          │
│    Medium (51–200)     ₱499          │
│    Large (201–500)     ₱799          │
│    Extra Large (500+)  ₱999          │
│                                      │
│  ○ Monthly — Pro                     │
│    Unlimited events    ₱1,499/month  │
│    [MOST POPULAR]                    │
│                                      │
│  ○ Annual Plan                       │
│    Best value          ₱7,999/year   │
│    Save ₱4,000 vs monthly            │
│                                      │
│  [📱 Pay with GCash]                 │
│  [💳 Pay with Card]                  │
│  [💸 Pay with Maya]                  │
│                                      │
│  Powered by PayMongo · Secure · BSP  │
└──────────────────────────────────────┘
         ↓
[Payment Processing — PayMongo Checkout]
         ↓
[Success → App Unlocked → Dashboard]
```

### Best Practice: Value-First Gate

Show the paywall **after** the user has:
1. Browsed the marketplace freely
2. Seen the Event App features page
3. Clicked a specific tool they want to use

This is called a "value-triggered payment moment" — users pay after experiencing desire, not before.

---

## 9. Payment Gateway — PayMongo

### Why PayMongo

| Factor | PayMongo | Reason |
|---|---|---|
| GCash support | ✅ Native | #1 e-wallet in PH, 76M+ users |
| Maya support | ✅ Native | 47M+ users |
| Cards | ✅ Visa/Mastercard | |
| QRPh | ✅ | Universal QR standard |
| Bank transfer | ✅ BDO, BPI, Unionbank | |
| Recurring billing | ✅ Built-in | Needed for monthly subscriptions |
| No setup fee | ✅ | Pay-per-transaction only |
| No monthly fee | ✅ | Ideal for pre-revenue stage |
| PCI DSS Level 1 | ✅ | Highest security certification |
| BSP regulated | ✅ | Required for trust |
| Filipino-built | ✅ | Local support, understands PH market |
| Subscription API | ✅ | Handles recurring billing automatically |
| Freelancer accounts | ✅ | No DTI required to start |

### PayMongo Account Types

| Type | Requirement | Bank Account Type | Best For |
|---|---|---|---|
| **Freelancer** | Government ID only (no DTI) | Personal bank account | Starting now |
| Sole Proprietor | DTI Certificate | Personal or business bank | After DTI registration |
| Partnership | SEC + Articles of Partnership | Corporate bank account | — |
| Corporation | SEC + Articles of Incorporation | Corporate bank account | Later stage |

**Lito's current status: Freelancer account** — can start accepting payments immediately.

### What Freelancer Account Can Do

| Feature | Available |
|---|---|
| Accept GCash payments | ✅ |
| Accept Maya payments | ✅ |
| Accept cards (Visa/Mastercard) | ✅ Limited |
| Accept QRPh | ✅ |
| Payout to personal bank account | ✅ |
| Use PayMongo Wallet | ✅ |
| Recurring/subscription billing | ✅ |
| Payment links (no website needed) | ✅ |
| Higher transaction limits | ❌ (upgrade after DTI) |

---

## 10. Freelancer Payment Setup

### Current Situation
- No company registered (no DTI, no SEC)
- Has personal GCash number
- Has personal bank account

### Stage 1 — Start Now (No Registration Needed)

**Option A: GCash Business QR (Immediate, Zero Fee)**
- Upgrade your personal GCash to GCash Business
- Get a Business QR code linked to your personal GCash wallet
- Transaction fee: **₱0 (waived for individual merchants)**
- Limitation: Manual payment confirmation, no automated receipt

**Option B: PayMongo Freelancer Account**
- Sign up at paymongo.com
- Select account type: **Freelancer / Social Seller**
- Submit: Government-issued ID (passport or driver's license)
- Payout to: Personal bank account (BDO, BPI, Metrobank, etc.)
- Time to activate: 1–3 business days

**What you need for PayMongo Freelancer:**
```
✅ Valid government-issued ID
   (passport, driver's license, PRC ID — retired judges have PRC)
✅ Personal bank account
   (BDO, BPI, Metrobank, Landbank, Unionbank)
✅ Personal email address
✅ Philippine mobile number
✅ Website or online presence
   (even a Facebook page is accepted)
```

### Stage 2 — Register DTI (This Week, ₱30 Only)

Register EventPH as a business name with DTI. As of 2025, the annual registration fee has been abolished. You only pay a ₱30 documentary stamp tax.

**How to register DTI online:**
1. Go to: **bnrs.dti.gov.ph**
2. Choose business name: "EventPH" or "EventPH by Lito Lagbas"
3. Select sole proprietorship
4. Pay ₱30 documentary stamp via GCash or credit card
5. Download DTI Certificate immediately
6. Valid for **5 years**

**After DTI registration:**
- Upgrade PayMongo from Freelancer → Sole Proprietor
- Unlocks higher transaction limits
- Unlocks full card processing capabilities
- Faster payout settlement

**Documents for PayMongo Sole Proprietor upgrade:**
```
✅ DTI Certificate
✅ Government-issued ID of the person registered with DTI
✅ Personal bank account (can remain personal at this stage)
```

### Stage 3 — Register BIR (After First Revenue)

- Get a Certificate of Registration (COR) from BIR
- Required to issue official receipts (OR)
- Needed for GCash Business merchant account
- Choose 8% flat income tax (available if annual gross ≤ ₱3M)
- Registration fee: ₱500 (one-time)

### Stage 4 — Open Business Bank Account

When monthly revenue consistently exceeds ₱20,000:
- Open a BDO or BPI business account
- Separate business and personal finances
- Faster PayMongo payouts
- Required eventually for DTI-registered business

---

## 11. Revenue Streams

### Primary Revenue

| Stream | Who Pays | Rate | Frequency |
|---|---|---|---|
| Pay-Per-Event | Event organizers | ₱299–₱999/event | Per event |
| Monthly Subscription | Active organizers | ₱999–₱1,499/month | Monthly |
| Annual Plan | Pro organizers | ₱7,999/year | Yearly |

### Secondary Revenue

| Stream | Who Pays | Rate | Frequency |
|---|---|---|---|
| Ad Carousel — Standard | Suppliers/Organizers | ₱500–₱1,500/week | Weekly |
| Ad Carousel — Premium (first slot) | Suppliers/Organizers | ₱1,000–₱3,000/week | Weekly |
| Supplier Verified Badge | Suppliers | ₱199 | One-time |
| Organizer Verified Badge | Organizers | ₱199 | One-time |
| Supplier Featured Listing | Suppliers | ₱499/month | Monthly |
| Organizer Featured Profile | Organizers | ₱699/month | Monthly |

### Future Revenue (Phase 2+)

| Stream | Rate | Notes |
|---|---|---|
| Booking Commission | 5–10% of booking | When in-app booking goes live |
| Ticketing Commission | 3–5% per ticket | When e-ticketing launches |
| SMS/Push Credits | ₱1/SMS | For announcements beyond free tier |
| White-label App | ₱15,000+/event | For large corporate clients |

### Revenue Projection (Conservative)

| Month | Pay-Per-Event | Subscriptions | Ads | Total |
|---|---|---|---|---|
| Month 1 | 10 × ₱499 = ₱4,990 | 0 | ₱1,000 | ₱5,990 |
| Month 3 | 25 × ₱499 = ₱12,475 | 2 × ₱999 = ₱1,998 | ₱3,000 | ₱17,473 |
| Month 6 | 50 × ₱599 = ₱29,950 | 5 × ₱999 = ₱4,995 | ₱5,000 | ₱39,945 |
| Month 12 | 100 × ₱599 = ₱59,900 | 12 × ₱999 = ₱11,988 | ₱10,000 | ₱81,888 |

---

## 12. Registration Roadmap

```
TODAY
│
├── Sign up PayMongo as Freelancer
│   paymongo.com → Get Started → Freelancer
│   Submit: Government ID
│   Payout: Personal bank account
│   Time: 1–3 business days
│
├── Activate GCash Business QR
│   GCash app → GCash Business → Get QR
│   Link: Personal GCash number
│   Fee: ₱0 for individual merchants
│   Time: Same day
│
THIS WEEK
│
├── Register DTI Online
│   bnrs.dti.gov.ph → Register Business Name
│   Name: "EventPH" or "EventPH by Warlito Lagbas"
│   Fee: ₱30 documentary stamp only
│   Time: 1 day (online, instant certificate)
│
├── Upgrade PayMongo to Sole Proprietor
│   Dashboard → Settings → Business Type
│   Submit: DTI Certificate + Government ID
│   Time: Up to 14 business days
│
AFTER FIRST PAYING CUSTOMERS
│
├── Register BIR
│   Local BIR RDO office
│   Get Certificate of Registration (COR)
│   Fee: ₱500
│   Choose: 8% flat tax (if income ≤ ₱3M/year)
│   Time: 1–2 weeks
│
├── Open Business Bank Account
│   BDO or BPI business savings account
│   Separate from personal finances
│   Link to PayMongo for payouts
│
WHEN REVENUE EXCEEDS ₱50,000/MONTH
│
└── Consider SEC Registration
    Register as One Person Corporation (OPC)
    Unlocks corporate bank account
    Full PayMongo verified merchant
    Unlocks higher transaction limits
```

---

## 13. Payment Methods Supported

### Via PayMongo (Freelancer Account)

| Method | Users in PH | Fee |
|---|---|---|
| GCash | 76 million | 3% |
| Maya | 47 million | 3% |
| Visa/Mastercard | Wide coverage | 3.5% + ₱15 |
| QRPh | All banks + e-wallets | 2% |
| GrabPay | 10+ million | 3% |
| ShopeePay | Growing | 3% |
| BillEase (BNPL) | Buy now pay later | ~3% |
| Online banking | BDO, BPI, Unionbank, Metrobank | 2% |

### Priority for EventPH Users

Given EventPH's target market (provincial, mobile-first Filipinos):
1. **GCash first** — 76M users, most common in Mindanao
2. **Maya second** — 47M users, growing fast
3. **QRPh third** — universal, works with any bank/e-wallet
4. **Cards last** — less common in provincial market

### Checkout UI Priority Order
```
[📱 Pay with GCash]      ← Show first, largest button
[💸 Pay with Maya]       ← Second
[⬛ QRPh / Scan to Pay]  ← Third
[💳 Credit / Debit Card] ← Last, collapsible
```

---

## 14. Transaction Fees Reference

### PayMongo Fees

| Method | Fee | Example on ₱499 |
|---|---|---|
| GCash | 3% | ₱14.97 |
| Maya | 3% | ₱14.97 |
| QRPh / Bank transfer | 2% | ₱9.98 |
| Visa/Mastercard | 3.5% + ₱15 | ₱32.47 |
| GrabPay | 3% | ₱14.97 |

**Net Revenue Example (₱499 Pay-Per-Event via GCash):**
```
Gross charge:     ₱499.00
PayMongo fee:     ₱499 × 3% = ₱14.97
Net to EventPH:   ₱484.03
```

**Payout Schedule:** 2–7 business days (standard) | Instant (PayMongo Wallet)

### GCash Business QR Fees
- Individual merchant: **₱0** (waived MDR)
- Business merchant (after DTI): varies by agreement
- Limitation: Manual confirmation, no automated receipt generation

### Cheapest Route for MVP Launch
Use **GCash Business QR** for the first paying customers:
- Zero transaction fees
- Instant receipt via GCash notification
- Manual order fulfillment (acceptable at low volume)
- Switch to PayMongo API once volume grows

---

## 15. Firebase + PayMongo Integration

### Full Architecture — Organizer-Only Payment Flow

```
[1] User taps "Open Event App" or "📱 App" tab
               ↓
[2] OrganizerGuard checks:
    ├── Not logged in? → /login
    ├── Wrong role (supplier/attendee)? → NotOrganizerScreen
    └── Organizer but no active sub? → /subscribe (paywall)
               ↓
[3] Organizer on paywall selects plan + taps "Pay with GCash"
               ↓
[4] Client calls Firebase Function: createPaymentIntent
               ↓
[5] Firebase Function (server-side only) calls PayMongo API:
    POST https://api.paymongo.com/v1/payment_intents
    {
      amount: 49900,         // ₱499 in centavos
      currency: "PHP",
      payment_method_allowed: ["gcash","maya","card","qrph"],
      metadata: {
        userId: "abc123",
        planId: "medium",
        type: "pay-per-event"
      }
    }
               ↓
[6] PayMongo returns checkout URL → sent to client
               ↓
[7] User completes payment in PayMongo hosted checkout
               ↓
[8] PayMongo sends webhook to Firebase Function endpoint
    Event: payment.paid
               ↓
[9] Firebase Function verifies webhook signature
               ↓
[10] Firestore updated:
     users/{uid}.subscription = {
       status: "active",
       type: "pay-per-event",
       planId: "medium",
       expiresAt: now + 9 days,
       paymongoPaymentId: "pay_xxx"
     }
               ↓
[11] Firebase Auth custom claims set:
     { role: "organizer", subscribed: true }
               ↓
[12] Confirmation SMS sent via Semaphore PH:
     "EventPH App unlocked! Access at eventph.app/manage"
               ↓
[13] User redirected to /manage/dashboard
     ← OrganizerGuard now passes all checks ✅
```

---

### Firestore Collections

```js
// ── users/{userId} ──────────────────────────────────────────
{
  uid: "abc123",
  name: "Lito Lagbas",
  phone: "+63912345678",
  email: "lito@eventph.app",
  city: "Davao City",
  createdAt: Timestamp,

  // ROLE — the most important field for access control
  role: "organizer",   // "organizer" | "supplier" | "attendee"

  // SUBSCRIPTION — only populated for organizers
  subscription: {
    status: "active",          // "active" | "expired" | "cancelled"
    type: "pay-per-event",     // "pay-per-event" | "monthly" | "annual"
    planId: "medium",          // "small"|"medium"|"large"|"xl"|"pro"|"annual"
    expiresAt: Timestamp,
    paymongoCustomerId: "cus_xxx",
    paymongoSubscriptionId: "sub_xxx",  // null for pay-per-event
    eventId: "evt_123",                 // only for pay-per-event
  }
}

// ── payments/{paymentId} ────────────────────────────────────
{
  userId: "abc123",
  amount: 49900,              // In centavos (₱499.00)
  currency: "PHP",
  method: "gcash",            // gcash | maya | card | qrph
  status: "paid",             // paid | failed | pending | refunded
  paymongoPaymentId: "pay_xxx",
  type: "pay-per-event",      // pay-per-event | monthly | annual
  planId: "medium",
  eventId: "evt_123",         // null for subscriptions
  createdAt: Timestamp
}

// ── events/{eventId} ────────────────────────────────────────
// Event data — only organizers with active subscriptions can write
{
  organizerUid: "abc123",
  title: "Santos Family Reunion 2026",
  date: Timestamp,
  venue: "SMX Davao",
  guests: [],
  checkins: [],
  tables: [],
  createdAt: Timestamp
}
```

---

### Firebase Security Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper functions ─────────────────────────────────────

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOrganizer() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.role == "organizer";
    }

    function hasActiveSubscription() {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return user.subscription.status == "active" &&
             user.subscription.expiresAt > request.time;
    }

    function canAccessEventApp() {
      return isOrganizer() && hasActiveSubscription();
    }

    function ownsEvent(eventId) {
      return get(/databases/$(database)/documents/events/$(eventId))
             .data.organizerUid == request.auth.uid;
    }

    // ── Public data (anyone can read) ───────────────────────

    match /publicEvents/{doc} {
      allow read: if true;
      allow write: if canAccessEventApp();
    }

    match /suppliers/{doc} {
      allow read: if true;
      allow write: if isAuthenticated() &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid))
                      .data.role == "supplier";
    }

    match /organizers/{doc} {
      allow read: if true;
      allow write: if isAuthenticated() &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid))
                      .data.role == "organizer";
    }

    // ── Event app data (organizer + paid only) ──────────────

    match /events/{eventId} {
      allow read, write: if canAccessEventApp() && ownsEvent(eventId);
      allow create: if canAccessEventApp();
    }

    match /events/{eventId}/guests/{guestId} {
      allow read, write: if canAccessEventApp() && ownsEvent(eventId);
    }

    match /events/{eventId}/checkins/{checkinId} {
      allow read, write: if canAccessEventApp() && ownsEvent(eventId);
    }

    // ── User profiles ────────────────────────────────────────

    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      // Subscription updates come from Firebase Functions only (not client)
      allow write: if request.auth.uid == userId &&
                      !("subscription" in request.resource.data);
    }

    // ── Payments (server-side write only) ────────────────────

    match /payments/{paymentId} {
      allow read: if isAuthenticated() &&
                     resource.data.userId == request.auth.uid;
      allow write: if false; // Only Firebase Functions can write
    }
  }
}
```

---

### Firebase Functions (Key Endpoints)

```ts
// functions/src/index.ts

// 1. Create PayMongo payment intent (called by client)
export const createPaymentIntent = functions.https.onCall(
  async (data, context) => {
    // Verify caller is authenticated organizer
    if (!context.auth) throw new HttpsError("unauthenticated", "Login required");

    const user = await admin.firestore()
      .collection("users").doc(context.auth.uid).get();

    if (user.data()?.role !== "organizer") {
      throw new HttpsError("permission-denied",
        "Event App is for organizers only");
    }

    // Create PayMongo payment intent
    const response = await fetch("https://api.paymongo.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY!).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: data.amount,  // centavos
            currency: "PHP",
            payment_method_allowed: ["gcash", "maya", "card", "qrph"],
            metadata: {
              userId: context.auth.uid,
              planId: data.planId,
              type: data.type,
            },
          },
        },
      }),
    });

    const result = await response.json();
    return { clientKey: result.data.attributes.client_key };
  }
);

// 2. PayMongo webhook (receives payment confirmation)
export const paymongoWebhook = functions.https.onRequest(
  async (req, res) => {
    // Verify webhook signature
    const signature = req.headers["paymongo-signature"] as string;
    const isValid = verifyPaymongoSignature(
      req.rawBody, signature, process.env.PAYMONGO_WEBHOOK_SECRET!
    );
    if (!isValid) { res.status(401).send("Invalid signature"); return; }

    const event = req.body.data;

    if (event.attributes.type === "payment.paid") {
      const metadata = event.attributes.data.attributes.metadata;
      const userId = metadata.userId;
      const planId = metadata.planId;
      const type = metadata.type;

      // Calculate expiry
      const now = admin.firestore.Timestamp.now();
      const expiryDays = type === "annual" ? 365 : type === "monthly" ? 30 : 9;
      const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + expiryDays * 24 * 60 * 60 * 1000
      );

      // Update Firestore subscription
      await admin.firestore().collection("users").doc(userId).update({
        "subscription.status": "active",
        "subscription.type": type,
        "subscription.planId": planId,
        "subscription.expiresAt": expiresAt,
        "subscription.paymongoPaymentId": event.attributes.data.id,
      });

      // Set Firebase Auth custom claim
      await admin.auth().setCustomUserClaims(userId, {
        role: "organizer",
        subscribed: true,
      });

      // Send confirmation SMS via Semaphore PH
      await sendSMS(metadata.phone,
        `EventPH App unlocked! Go to eventph.app/manage to start. Valid until ${expiresAt.toDate().toLocaleDateString("en-PH")}.`
      );
    }

    res.status(200).send("OK");
  }
);
```

---

### PayMongo Webhook Events

| Event | Trigger | Firebase Action |
|---|---|---|
| `payment.paid` | User completes payment | Activate subscription, set custom claim, send SMS |
| `payment.failed` | Payment declined | Log to Firestore, notify user to retry |
| `payment.expired` | Checkout link expired | Log, show "Try again" in app |
| `subscription.payment.paid` | Monthly auto-renewal | Extend `expiresAt` by 30 days |
| `subscription.payment.failed` | Auto-renewal failed | Set status to `expired`, notify user |
| `subscription.cancelled` | User cancels | Set status to `cancelled`, allow until current period ends |

---

## 16. Design System (v2.0)

### Design Direction: "Warm Filipino Celebration"

EventPH v2 moved from a cold dark palette to a **warm, editorial aesthetic** inspired by:
- **Eventbrite's 2025 rebrand** — vibrant gradients, expressive typography, emotion-first design
- **Airbnb DLS** — generous white space, rounded warmth, flat modern UI
- **Grab Philippines** — mobile-first, familiar, provincial-market friendly

The single most important feeling the design must evoke: **anticipation of a Filipino celebration**.

---

### 16A. Color Tokens

```js
// v2 Token System — object: T (replaces old C object)
const T = {

  // ── Brand — Sunrise Coral ────────────────────────────────
  brand:    "#E8522A",  // Primary CTA, active states (richer than v1 #FF6B4A)
  brandDk:  "#C23A10",  // Hover, gradient end
  brandLt:  "#FFF0EB",  // Tag/chip light backgrounds
  brandMid: "#F47A55",  // Mid-tone for illustrations

  // ── Deep Cacao (replaces cold black) ─────────────────────
  ink:      "#1A0F0A",  // Primary text, nav background (warm near-black)
  inkDk:    "#0D0704",  // Deepest dark, hero card bg
  ink2:     "#2D1E16",  // Secondary dark card bg
  ink3:     "#3D2A1F",  // Tertiary dark bg

  // ── Warm Cream (replaces cold white) ─────────────────────
  cream:    "#FDF8F4",  // Page background (not pure white — warm)
  cream2:   "#F7F0E9",  // Card backgrounds
  cream3:   "#EFE5DA",  // Dividers, borders
  cream4:   "#E5D8CC",  // Stronger border, focus rings

  // ── Text Hierarchy ────────────────────────────────────────
  text1:    "#1A0F0A",  // Primary text (same as ink)
  text2:    "#3D2A1F",  // Secondary — headings, labels
  text3:    "#7A5C4A",  // Tertiary — meta, subtitles
  text4:    "#B8967F",  // Placeholder, ghost text

  // ── Celebration Accent Palette ────────────────────────────
  gold:     "#D4920A",  goldLt:"#FDF3DC",  // VIP, ratings, top badges
  jade:     "#0F7A6E",  jadeLt:"#E0F5F2",  // Success, verified, organizer accent
  plum:     "#6B2D7A",  plumLt:"#F5E8F8",  // Photography, creative suppliers
  sky:      "#1A6BB5",  skyLt: "#E3F0FB",  // Corporate, tech events
  rose:     "#C2335A",  roseLt:"#FCEEF2",  // Romance, wedding-specific
  sage:     "#4A7C59",  sageLt:"#EBF4EE",  // Community, eco, nature events

  // ── Semantic ──────────────────────────────────────────────
  success:  "#2E7D52",  successLt:"#E8F5EE",  // Payment success, verified badge
  warning:  "#B8720A",  warningLt:"#FEF3DC",  // Pending, near capacity
  error:    "#C22525",  errorLt:  "#FDEAEA",  // Error, sold out, cancel
};
```

#### Color Philosophy vs v1

| Role | v1 | v2 | Why changed |
|---|---|---|---|
| Brand | `#FF6B4A` | `#E8522A` | Richer terracotta — more celebration energy |
| Background | `#FAFAF9` | `#FDF8F4` | Warmer cream — feels like event invitation paper |
| Primary text | `#1C1917` | `#1A0F0A` | Deep cacao — warm vs cold black |
| Borders | `#E8E6E1` | `#EFE5DA` | Warmer beige — part of cream palette |
| Cards | `#FFFFFF` | `#FDF8F4` / `#F7F0E9` | Warm white — no cold pure white |
| Success/Verified | `#16A34A` | `#0F7A6E` (jade) | Teal-green — more Filipino feel |
| Teal accent | `#1FA8A5` | `#0F7A6E` | Consolidated into jade for organizer |

#### 60-30-10 Color Rule (applied throughout)
- **60%** — Warm cream tones (`cream`, `cream2`, `cream3`) — backgrounds, cards
- **30%** — Deep cacao tones (`ink`, `text1`, `text2`) — text, nav, dark sections
- **10%** — Brand coral + accent colors — CTAs, badges, highlights

---

### 16B. Typography System

#### Font Pairing: Fraunces + Outfit

```css
/* Google Fonts import — included in GlobalCSS() */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,800;0,9..144,900;1,9..144,700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
```

| Font | Role | Why |
|---|---|---|
| **Fraunces** | Display / Headings / Prices | Optical-size aware serif with personality — warm, editorial, Filipino celebration energy. Used on all `h1`, `h2`, event titles, prices, brand logo |
| **Outfit** | Body / UI / Labels | Geometric, clean, highly legible at small sizes — perfect for form fields, meta text, navigation, body paragraphs |

#### Replaced Fonts

| v1 | v2 | Reason |
|---|---|---|
| Plus Jakarta Sans | Fraunces (display) | Too generic — Fraunces has soul |
| DM Sans | Outfit | More personality while staying clean |

#### Type Scale

```
Display XL:  Fraunces 900, 28–32px, letterSpacing -0.03em → Hero headlines
Display L:   Fraunces 800, 22–26px, letterSpacing -0.03em → Page titles, event names
Display M:   Fraunces 800, 18–20px, letterSpacing -0.02em → Section titles
Display S:   Fraunces 700, 16–17px, letterSpacing -0.02em → Card titles, prices

Body L:      Outfit 500, 15px, letterSpacing -0.01em → Primary body copy
Body M:      Outfit 400, 14px, letterSpacing -0.01em → Descriptions, form labels
Body S:      Outfit 400, 13px, letterSpacing -0.01em → Secondary info, addresses
Caption:     Outfit 400, 12px, letterSpacing 0em    → Meta, timestamps, cities
Micro:       Outfit 700, 10–11px, letterSpacing 0.04–0.08em → Badges, tags, ALL CAPS labels
```

#### Using Fraunces in JSX

```jsx
// Apply display font with className="display"
// The CSS class is defined in GlobalCSS:
// .display { font-family: var(--font-d); font-optical-sizing: auto; }

<h1 className="display" style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.03em" }}>
  Santos Family Reunion 2026
</h1>

// Prices always use Fraunces
<span className="display" style={{ fontSize:22, fontWeight:800, color:T.brand, letterSpacing:"-0.02em" }}>
  ₱499
</span>
```

#### ALL CAPS Labels
Used for category labels, section overlines, and badge text:
```css
font: Outfit 700–800, 9–11px, letterSpacing: 0.05–0.08em, textTransform: uppercase
```

---

### 16C. CSS Variable System

All design tokens are available as CSS custom properties, injected by `GlobalCSS()`:

```css
:root {
  /* Brand */
  --brand:    #E8522A;
  --ink:      #1A0F0A;
  --cream:    #FDF8F4;

  /* Fonts */
  --font-d:   'Fraunces', Georgia, serif;       /* display */
  --font-b:   'Outfit', system-ui, sans-serif;  /* body */

  /* Border radius scale */
  --r-xs:   6px;    /* micro chips, tiny badges */
  --r-sm:   10px;   /* small cards, icon containers */
  --r-md:   16px;   /* standard cards */
  --r-lg:   20px;   /* large cards, bottom sheets */
  --r-xl:   28px;   /* hero cards, modals */
  --r-full: 9999px; /* pills, all buttons, chips */

  /* Shadow scale */
  --shadow-sm: 0 1px 3px rgba(26,15,10,0.08), 0 1px 2px rgba(26,15,10,0.06);
  --shadow-md: 0 4px 16px rgba(26,15,10,0.10), 0 2px 6px rgba(26,15,10,0.07);
  --shadow-lg: 0 12px 40px rgba(26,15,10,0.14), 0 4px 12px rgba(26,15,10,0.08);
  --shadow-xl: 0 24px 64px rgba(26,15,10,0.18);
}
```

**Usage in JSX:**
```jsx
// Use CSS var() in style props
<div style={{ borderRadius:"var(--r-md)", boxShadow:"var(--shadow-sm)" }}>

// Or reference T object for color
<div style={{ background:T.brand, color:"#fff" }}>
```

---

### 16D. Border Radius & Spacing

#### Border Radius Rules

| Element | Value | CSS Var | Notes |
|---|---|---|---|
| All buttons | `9999px` | `--r-full` | Pills — no exceptions |
| Filter chips / tags | `9999px` | `--r-full` | Pills |
| Badges / labels | `9999px` | `--r-full` | Pills |
| Avatars | `9999px` | `--r-full` | Full circles |
| Bottom nav | — | — | No radius (flush to edge) |
| Search bar input | `9999px` | `--r-full` | Exception — pill shape |
| All other inputs | `14px` | — | NOT pill — approachable rounded rect |
| Standard cards | `16px` | `--r-md` | Was 14px in v1 |
| Hero cards / modal | `20–28px` | `--r-lg / --r-xl` | Large radius for depth |
| Icon containers | `10–14px` | `--r-sm` | Small square with radius |
| Image thumbnails | `12–14px` | — | Consistent with cards |

#### Spacing System
Consistent multiples of 4px:
```
4px  — micro gap (icon + label)
8px  — tight gap (chip row, small card padding)
10px — card gap in grid
12px — standard icon + text gap
14px — card padding (compact)
16px — standard section padding
20px — section header padding
24px — hero section padding
32px — large hero padding
```

---

### 16E. Shadow System

All shadows use warm brown `rgba(26,15,10,X)` — never cold grey. This makes shadows feel like they belong in warm cream surfaces.

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 3px …0.08` | Default card lift |
| `--shadow-md` | `0 4px 16px …0.10` | Hovered card, popular package |
| `--shadow-lg` | `0 12px 40px …0.14` | Ad carousel, detail hero |
| `--shadow-xl` | `0 24px 64px …0.18` | App marketing hero |

**Brand glow shadows** (for CTAs and colored elements):
```css
/* Brand button */
box-shadow: 0 4px 12px rgba(232,82,42,0.35);

/* Jade/organizer */
box-shadow: 0 8px 24px rgba(15,122,110,0.30);

/* Logo mark */
box-shadow: 0 8px 24px rgba(232,82,42,0.50);
```

---

### 16F. Animation & Micro-interactions

All animations are defined in `GlobalCSS()` as CSS keyframes and utility classes.

#### Keyframe Animations

| Name | Effect | Usage |
|---|---|---|
| `fadeUp` | Opacity 0→1 + translateY 12px→0 | Page entry, staggered lists |
| `fadeIn` | Opacity 0→1 only | Tab switches, detail panels |
| `pulse` | Opacity 1→0.45→1 | Skeleton shimmer, loading states |
| `shimmer` | translateX -100%→100% | Skeleton loading effect |
| `scanLine` | top 15%→78%→15% | QR scanner scan line |
| `spin` | rotate 0→360deg | Loading spinners |
| `ripple` | scale 0→4, opacity 0.5→0 | Button tap ripple |
| `bounceSoft` | translateY 0→-4px→0 | Gentle attention bounce |

#### Utility Classes

```css
/* Staggered entry — apply to parent, children auto-animate */
.stagger > *          { animation: fadeUp 500ms cubic-bezier(.22,1,.36,1) both; }
.stagger > *:nth-child(1) { animation-delay: 0ms }
.stagger > *:nth-child(2) { animation-delay: 60ms }
.stagger > *:nth-child(3) { animation-delay: 120ms }
/* ...up to nth-child(6) at 300ms */

/* Tap feedback — scales down on press */
.pressable { transition: transform 120ms ease, box-shadow 120ms ease; cursor: pointer; }
.pressable:active { transform: scale(0.97); }

/* Card hover lift */
.card-lift { transition: transform 200ms ease, box-shadow 200ms ease; cursor: pointer; }
.card-lift:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }

/* Skeleton shimmer loading */
.skeleton {
  background: linear-gradient(90deg, #F7F0E9 25%, #EFE5DA 50%, #F7F0E9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--r-sm);
}

/* Instant page animation — apply to page root */
.fade-in { animation: fadeIn 300ms ease both; }
.fade-up { animation: fadeUp 400ms cubic-bezier(.22,1,.36,1) both; }

/* Hide scrollbar but keep scroll — horizontal chip rows */
.no-scroll { -ms-overflow-style: none; scrollbar-width: none; }
.no-scroll::-webkit-scrollbar { display: none; }
```

#### Usage Patterns

```jsx
// Page entry — apply to page root div
<div className="stagger"> ... children auto-stagger </div>

// Individual item animation
<div className="fade-in"> ... </div>

// Loading skeleton
<div className="skeleton" style={{ height:14, width:"70%" }} />

// Pressable card
<div className="pressable card-lift" onClick={...}>
  ... taps scale down, hover lifts up ...
</div>
```

#### Scroll-reactive TopNav
```js
// TopNav detects scroll > 8px and switches to frosted glass
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 8);
  window.addEventListener("scroll", handler);
  return () => window.removeEventListener("scroll", handler);
}, []);

// Applied style
style={{
  background: scrolled ? "rgba(253,248,244,0.92)" : T.cream,
  backdropFilter: scrolled ? "blur(12px)" : "none",
  borderBottom: `1px solid ${scrolled ? T.cream4 : "transparent"}`,
  transition: "all 250ms ease"
}}
```

---

### 16G. SVG Icon Library

v2 replaced emoji nav icons with clean SVG icons for a professional, consistent look. All icons use `stroke="currentColor"` so they automatically inherit the active/inactive color from the parent.

```jsx
// Bottom nav icons — 20×20px, strokeWidth 2
const HomeIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CalIcon    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const GridIcon   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const HeartIcon  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const PersonIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

// Inline SVG icons used in buttons/UI
// Search: 14×14, strokeWidth 2.5
// Bell: 16×16, strokeWidth 2
// Chevron right: 16×16, strokeWidth 2
// Check: 10×10 (in verified badges), strokeWidth 3
// Share: 18×18, strokeWidth 2
// Chat bubble: 18×18, strokeWidth 2
// Back arrow: 16×16, strokeWidth 2.5
```

---

### 16H. Button Styles

```js
// Three standard button styles
const btnPrimary = {
  background: T.brand,
  color: "#fff",
  border: "none",
  borderRadius: 9999,
  padding: "11px 22px",
  fontFamily: FONT.body,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  letterSpacing: "-0.01em",
  boxShadow: `0 4px 12px ${T.brand}35`,  // ← brand glow shadow
  transition: "all 150ms",
};

const btnOutline = {
  background: "transparent",
  color: T.brand,
  border: `2px solid ${T.brand}`,
  borderRadius: 9999,
  padding: "11px 22px",
  fontFamily: FONT.body,
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  letterSpacing: "-0.01em",
  transition: "all 150ms",
};

const btnSm = {
  borderRadius: 9999,
  padding: "7px 16px",
  fontFamily: FONT.body,
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  letterSpacing: "-0.01em",
};

// Jade variant (for organizer-themed actions)
const btnJade = {
  ...btnPrimary,
  background: T.jade,
  boxShadow: `0 4px 12px ${T.jade}35`,
};
```

#### Button Rules
- All buttons: `border-radius: 9999px` — **pill shape, no exceptions**
- All primary buttons: brand glow `box-shadow`
- Colored icon buttons: square with `border-radius: 10–14px`, NOT pill
- Danger actions (cancel, report): border coral-red, filled red background on confirm

---

## 17. Data Models

### Events (v2 — added color, accent, sold as number)
```js
{
  id:     1,
  title:  "Davao Food & Wine Festival",
  date:   "Jul 5",
  venue:  "People's Park",
  price:  "₱350",
  cat:    "Festival",              // category key (was 'category')
  emoji:  "🍷",                    // placeholder for real image URL
  badge:  "Hot",                   // Hot | Selling Fast | Free | New | Limited | ""
  sold:   82,                      // NUMBER 0–100, not string (was "82%")
  color:  "#7A1E10",               // ← NEW: deep bg color for hero gradient
  accent: "#E8522A",               // ← NEW: accent color for price, badge, progress
}
```

### Suppliers (v2 — added color, tag)
```js
{
  id:       1,
  name:     "Blooms & Petals",
  cat:      "Florist",             // was 'category'
  city:     "Davao",               // shorter city name
  rating:   4.9,
  reviews:  128,
  price:    "₱3,500+",
  verified: true,
  featured: true,
  emoji:    "🌸",                  // was 'img'
  color:    "#C2335A",             // ← NEW: accent color for card bg tint
  tag:      "Wedding specialist",  // ← NEW: one-line specialty tag shown on profile
}
```

### Organizers (v2 — added badge)
```js
{
  id:       1,
  name:     "Lito Lagbas Events",
  spec:     "Reunions & Community", // was 'specialty'
  city:     "Davao",
  rating:   4.9,
  reviews:  87,
  events:   134,
  verified: true,
  emoji:    "⚡",                   // was 'img'
  price:    "₱15,000+",
  badge:    "Top Rated",            // ← NEW: "Top Rated" | "" for featured indicator
}
```

### Ads / Carousel (v2 — simplified gradient, added pattern)
```js
{
  id:      1,
  sponsor: "Blooms & Petals",        // was 'brand'
  tag:     "✦ Featured Supplier",    // includes decorative character
  headline:"Flowers That\nStories",  // supports \n for line break
  sub:     "Weddings · Debuts · Corporate",
  cta:     "View Packages",
  bg:      "#1A0A08",               // was 'gradient' — now flat dark bg color
  accent:  "#E8522A",               // CTA button + tag color
  pattern: "🌸",                    // ← NEW: large decorative emoji (opacity 0.06)
}
```

### Key Schema Changes v1 → v2

| Field | v1 | v2 |
|---|---|---|
| Event category | `category: "Festival"` | `cat: "Festival"` |
| Sold % | `sold: "82%"` (string) | `sold: 82` (number) |
| Event image | `img: "🍷"` | `emoji: "🍷"` |
| Supplier image | `img: "🌸"` | `emoji: "🌸"` |
| Supplier category | `category:` | `cat:` |
| Ad background | `gradient: "linear-gradient(…)"` | `bg: "#1A0A08"` (flat color) |
| Event color | ❌ | `color: "#7A1E10"` ✅ |
| Event accent | ❌ | `accent: "#E8522A"` ✅ |
| Supplier color | ❌ | `color: "#C2335A"` ✅ |
| Supplier tag | ❌ | `tag: "Wedding specialist"` ✅ |
| Organizer badge | ❌ | `badge: "Top Rated"` ✅ |
| Ad pattern | ❌ | `pattern: "🌸"` ✅ |

---

## 18. Do's and Don'ts

### ✅ DO — Auth & Access

- Keep homepage, events, suppliers, organizer pages **100% public** — never gate discovery
- Show the paywall **only when an organizer tries to open the Event App**
- Always check **both** role (`organizer`) AND subscription status (`active`) before granting app access
- Store all PayMongo secret keys in **Firebase Functions environment** — never in the client
- Verify PayMongo webhook signatures **server-side** before processing any payment event
- Always show **GCash first** in the payment method list — most common in Mindanao
- Show a friendly "This tool is for Event Organizers only" message — never a generic 403
- Use **Firebase Auth custom claims** to validate access — don't rely on Firestore reads alone

### ✅ DO — Design System (v2)

- Use **Fraunces** for ALL display text: `h1`, `h2`, event titles, prices, logo, section headers
- Use **Outfit** for ALL UI text: form labels, body, captions, navigation, buttons
- Apply `className="display"` in JSX to activate the Fraunces font family
- Use **warm cream backgrounds** (`#FDF8F4`) — never pure white for page backgrounds
- Use **warm shadows** (`rgba(26,15,10,X)`) — never cold grey shadows
- Apply **brand glow shadows** on primary buttons: `boxShadow: 0 4px 12px rgba(232,82,42,0.35)`
- Use `className="stagger"` on page root divs for automatic child stagger animations
- Use `className="pressable card-lift"` on clickable cards for tap + hover feedback
- Use `className="skeleton"` for all loading placeholders — shimmer animation
- Apply `className="fade-in"` on tab content switches and detail panels
- Use `className="no-scroll"` on horizontal chip rows to hide scrollbar
- Apply the scroll-reactive TopNav pattern (`useEffect` scroll listener → `backdropFilter`)
- Use the **60-30-10 color rule**: 60% cream, 30% cacao/dark, 10% coral/accent

### ✅ DO — Typography Rules

- Letter-spacing for display text: `-0.02em` to `-0.03em` (tighter = more modern)
- Letter-spacing for ALL CAPS labels: `0.04em` to `0.08em` (wider = more readable)
- Letter-spacing for body text: `-0.01em` (slightly tighter = more refined)
- Always use `font-optical-sizing: auto` on Fraunces to get correct optical sizing
- Prices always use Fraunces bold — never Outfit for prices

### ❌ DON'T — Auth

- Don't allow Suppliers or Attendees to access `/manage/*` routes
- Don't let the client app call PayMongo directly — all calls via Firebase Functions
- Don't skip PayMongo webhook signature verification
- Don't write `subscription` status from the client — Firebase Functions only
- Don't require login to browse the public marketplace

### ❌ DON'T — Design

- Don't use `Plus Jakarta Sans` or `DM Sans` — replaced by Fraunces + Outfit in v2
- Don't use pure white `#FFFFFF` for page background — use warm cream `#FDF8F4`
- Don't use cold grey shadows — all shadows use `rgba(26,15,10,X)` warm cacao tint
- Don't use `border-radius: md (8px)` on inputs — use `14px` for rounded-rect fields
- Don't use emoji as bottom nav icons — use the SVG icon components
- Don't use the old `C = {}` color object — use the new `T = {}` token system
- Don't use `rounded-md` on buttons — all buttons must be `border-radius: 9999px` (pill)
- Don't skip `className="stagger"` on page roots — it makes the app feel alive
- Don't put card payment first in the paywall — GCash must be the first and largest option
- Don't use `sold: "82%"` (string) in event data — use `sold: 82` (number) for progress bars

---

## Quick Reference Checklist

### Auth & Access Control
- [ ] Firebase Auth with phone number authentication
- [ ] `role` field written to Firestore on every new user registration
- [ ] `OrganizerGuard` component wrapping all `/manage/*` routes
- [ ] `NotOrganizerScreen` for wrong-role access attempts
- [ ] Login routes correctly by role after sign-in
- [ ] Registration: role select (step 1) → form (step 2) — no separate OTP screen in v3 demo
- [ ] Organizer registration redirects to `/subscribe` (paywall) after account creation

### Design Implementation
- [ ] Google Fonts `@import` for Fraunces + Outfit in `GlobalCSS()` component
- [ ] `GlobalCSS()` rendered as first child of App
- [ ] CSS variables `--brand`, `--ink`, `--cream`, `--font-d`, `--font-b`, `--r-*`, `--shadow-*` all defined in `:root`
- [ ] All CSS keyframe animations defined: `fadeUp`, `fadeIn`, `pulse`, `shimmer`, `scanLine`
- [ ] Utility classes active: `.stagger`, `.pressable`, `.card-lift`, `.skeleton`, `.fade-in`, `.no-scroll`
- [ ] `className="display"` applied to all Fraunces headlines and prices
- [ ] `className="stagger"` applied to all page root divs
- [ ] `className="pressable card-lift"` on all clickable cards
- [ ] Scroll-reactive TopNav `useEffect` + `setScrolled` logic in place
- [ ] TopNav `backdrop-filter: blur(12px)` activates on scroll > 8px
- [ ] SVG icon components (`HomeIcon`, `CalIcon`, `GridIcon`, `HeartIcon`, `PersonIcon`) used in BottomNav
- [ ] Bottom nav active indicator: top-edge pip (2.5px coral bar at top of active tab)
- [ ] Ad carousel swipe gesture handlers (`onTouchStart` + `onTouchEnd`)
- [ ] Ad carousel auto-advance `useEffect` with 4000ms interval
- [ ] `FilterChip` component used for all category filter rows
- [ ] `EmptyState` component used for all empty pages
- [ ] `SkeletonList` component used in `SearchPage` while loading
- [ ] `FormInput` with `onFocus`/`onBlur` border color animation
- [ ] `BackBtn` with SVG arrow icon used on all detail pages
- [ ] Warm cacao box shadows everywhere — no grey shadows

### Payment Setup
- [ ] Sign up PayMongo Freelancer at paymongo.com
- [ ] Activate GCash Business QR (free, same-day MVP option)
- [ ] Register DTI at bnrs.dti.gov.ph (₱30, 1 day)
- [ ] Create Facebook page for EventPH (PayMongo online presence requirement)
- [ ] PayMongo secret key in Firebase Functions config — not in repo
- [ ] `createPaymentIntent` Firebase Function built and tested
- [ ] `paymongoWebhook` Firebase Function endpoint registered in PayMongo dashboard
- [ ] Webhook signature verification implemented
- [ ] `payment.paid` event correctly updates Firestore subscription
- [ ] Firebase Auth custom claims set after payment (`role`, `subscribed`)
- [ ] Confirmation SMS sent via Semaphore PH after payment
- [ ] End-to-end test in PayMongo test mode

### Firestore Security
- [ ] Rules block client writes to `subscription` field
- [ ] Rules block non-organizers from `/events/*`
- [ ] Rules block non-authenticated reads from `/payments/*`
- [ ] `canAccessEventApp()` checks both role AND expiry timestamp

### After First Revenue
- [ ] Upgrade PayMongo to Sole Proprietor (submit DTI cert)
- [ ] Register BIR (COR, official receipts)
- [ ] Open BDO or BPI business savings account
- [ ] Link business bank to PayMongo for payouts
- [ ] Monitor failed webhook events in Firebase Functions logs

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | Apr 2026 | Initial documentation — 7 pages, basic design tokens |
| 1.1 | Apr 2026 | Added organizer-only access control, full auth flow (Section 5B), updated Firebase integration |
| 2.0 | Apr 2026 | Complete UI/UX redesign — Fraunces + Outfit fonts, warm cacao color system, CSS variable system, animation library, SVG icons, scroll-reactive nav, all missing pages added (20 gaps resolved), updated data models |

---

*This document is part of the EventPH PROJECT_CONTEXT suite. Keep alongside:*
- *`DESIGN_SYSTEM.md` — On-site app UI tokens, fonts, radius rules (separate from marketplace)*
- *`PROJECT_CONTEXT.md` — Competitive intelligence and SWOT*
- *`WIREFRAME_DOCUMENTATION.md` — On-site event management app (19 screens)*
- *`eventph-marketplace-v3.jsx` — **Current** marketplace wireframe source (v2.0)*
- *`eventph-wireframe.jsx` — On-site event management app wireframe*

