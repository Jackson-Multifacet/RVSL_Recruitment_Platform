# Visual Polish & Micro-Interactions Guide

*Last Updated: April 2026*

## Overview

This guide documents all micro-interactions, animations, and visual polish features available in the RVSL Recruitment Platform. These enhancements improve user experience by providing visual feedback, maintaining user interest, and making the interface feel more responsive and alive.

## Table of Contents

1. [Animations](#animations)
2. [Transitions & Micro-Interactions](#transitions--micro-interactions)
3. [Glass Morphism Effects](#glass-morphism-effects)
4. [Component-Specific Polish](#component-specific-polish)
5. [Accessibility Considerations](#accessibility-considerations)
6. [Implementation Examples](#implementation-examples)
7. [Performance Guidelines](#performance-guidelines)

---

## Animations

All animations are defined in `src/index.css` with 200-300ms durations for optimal perceived responsiveness.

### 1. **Fade In** (`fade-in`)
- **Duration:** 0.3s
- **Function:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Effect:** Smoothly fades element from 0 to full opacity while sliding up 10px
- **Use Cases:** Page transitions, component reveals, modal entrances
- **Example:**
  ```jsx
  <div className="fade-in">Content appears with smooth fade</div>
  ```

### 2. **Slide In Up** (`slide-in-up`)
- **Duration:** 0.4s
- **Function:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Effect:** Elements slide from bottom (20px) to normal position
- **Use Cases:** Entrance animations, card reveals, footer transitions
- **Example:**
  ```jsx
  <div className="slide-in-up">Slides in from bottom</div>
  ```

### 3. **Slide In Down** (`slide-in-down`)
- **Duration:** 0.4s
- **Function:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Effect:** Elements slide from top (20px) to normal position
- **Use Cases:** Header reveals, notification drops, menu slides down
- **Example:**
  ```jsx
  <div className="slide-in-down">Slides in from top</div>
  ```

### 4. **Pulse Glow** (`pulse-glow`)
- **Duration:** 2s (infinite loop)
- **Effect:** Creates expanding glow ring around element
- **Use Cases:** Call-to-action buttons, important notifications, status indicators
- **Example:**
  ```jsx
  <button className="pulse-glow">Important Action</button>
  ```

### 5. **Shimmer** (`shimmer`)
- **Duration:** 2s (infinite loop)
- **Effect:** Sweeping light gradient across element
- **Use Cases:** Skeleton loading screens, image placeholders, data loading states
- **Example:**
  ```jsx
  <div className="shimmer h-12 rounded-lg"></div>
  ```

### 6. **Float** (`float`)
- **Duration:** 3s (infinite loop)
- **Effect:** Gentle up-down floating motion (±10px)
- **Use Cases:** Hover states, idle animations, floating UI elements
- **Example:**
  ```jsx
  <div className="float">Floats gently up and down</div>
  ```

### 7. **Bounce Soft** (`bounce-soft`)
- **Duration:** 2s (infinite loop)
- **Effect:** Subtle bounce motion (±5px)
- **Use Cases:** Attention-grabbing without being distracting, icon animations
- **Example:**
  ```jsx
  <div className="bounce-soft">Subtle bounce effect</div>
  ```

---

## Transitions & Micro-Interactions

### 1. **Smooth Transition** (`transition-smooth`)
- **Class:** `transition-smooth`
- **Duration:** 250ms
- **Easing:** `ease-in-out`
- **Properties:** All
- **Use:** Replace `transition-all duration-300` for consistent pacing
- **Example:**
  ```jsx
  <div className="transition-smooth hover:bg-slate-100">Smooth hover</div>
  ```

### 2. **Button Scale** (`btn-scale`)
- **Hover:** Scale up to 105% with 200ms transition
- **Active:** Scale down to 95% with instant feedback
- **Use:** All interactive buttons
- **Example:**
  ```jsx
  <button className="btn-scale px-6 py-2 bg-blue-500">Click me</button>
  ```

### 3. **Card Lift** (`card-lift`)
- **Hover:** 
  - Scale maintained
  - Shadow enhanced (xl)
  - Translate up 4px (-translate-y-1)
  - Duration: 300ms
- **Use:** Card components, content containers, clickable cards
- **Example:**
  ```jsx
  <div className="card-lift p-6 bg-white rounded-lg">Card content</div>
  ```

### 4. **Input Glow** (`input-glow`)
- **Focus State:**
  - Shadow enhances with orange tint
  - Shadow color: `shadow-orange-500/20`
  - Size: `shadow-lg`
- **Use:** Form inputs, text areas, search fields
- **Example:**
  ```jsx
  <input className="input-glow" type="text" />
  ```

### 5. **Gradient Text** (`gradient-text`)
- **Effect:** Orange gradient from primary to secondary
- **Use:** Headlines, important text, brand statements
- **Example:**
  ```jsx
  <h1 className="gradient-text">Beautiful gradient heading</h1>
  ```

---

## Glass Morphism Effects

### Glass Card (`.glass-card`)

**Properties:**
- Background: `bg-white/10 dark:bg-black/20`
- Blur: `backdrop-blur-3xl`
- Border: `border border-white/20 dark:border-white/10`
- Transition: All properties, 300ms ease

**Hover State:**
- Background: `bg-white/20 dark:bg-black/30`
- Border: `border-white/30 dark:border-white/20`
- Shadow: Enhanced with `box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37)`

**Use Cases:**
- Newsletter subscription cards (see [Newsletter component](#newsletter-component))
- Modal overlays
- Notification cards
- Feature highlights

**Example:**
```jsx
<div className="glass-card p-6 rounded-lg">
  <h3 className="text-lg font-semibold">Glass Effect Card</h3>
  <p>Frosted glass appearance with blur backdrop</p>
</div>
```

### Atmosphere Background (`.atmosphere-bg`)

**Purpose:** Subtle gradient background for hero sections and large containers

**Light Mode:**
- Radial gradients at strategically positioned points
- Color scheme: Orange, blue, with transparency
- Blur: 80px for soft transitions

**Dark Mode:**
- Higher opacity for contrast
- Same gradient positions but darker colors

**Example:**
```jsx
<div className="atmosphere-bg absolute inset-0"></div>
```

---

## Component-Specific Polish

### Newsletter Component

**Enhancements:**
1. **Card Animations:** Each card fades in with 100ms stagger delay
   ```jsx
   style={{ animationDelay: `${index * 100}ms` }}
   ```

2. **Button Interactions:**
   - Hover: `btn-scale` (105% scale)
   - Active: Gradient background appears
   - Icon animate to colored state on selection

3. **Frequency Selector:**
   - Buttons use `transition-smooth`
   - Selected state: Scale 105% + shadow
   - Unselected: Scale 102% on hover

4. **Save Button:**
   - Full `btn-scale` effect
   - Gradient animation overlay on hover
   - Spinning loader indicator while saving
   - Shadow glow enhancement on hover

**Complete Implementation:**
```jsx
{/* Card with animations */}
<button className="fade-in btn-scale rounded-2xl">
  <div className="glass-card p-6">
    <IconComponent />
    <h3>{label}</h3>
    <p>{description}</p>
    <Badge>{status}</Badge>
  </div>
</button>

{/* Save button with polish */}
<button className="btn-scale relative group">
  <div className="absolute inset-0 transition-smooth group-hover:shadow-xl" />
  Update Preferences
</button>
```

---

## Accessibility Considerations

### Animation Preference Respecting

For users with `prefers-reduced-motion`, animations should be disabled:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

*(Add this to `src/index.css` to fully support motion-sensitive users)*

### Focus States

All interactive elements include focus rings:
```css
focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
```

### Keyboard Navigation

All animations work with keyboard navigation:
- Tab to element → Focus ring visible
- Space/Enter → Button scale effect triggers
- Escape → Modal closes with reverse animation

---

## Implementation Examples

### Example 1: Interactive Card with Full Polish

```jsx
import { useState } from 'react';

export function PolishedCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fade-in btn-scale rounded-2xl focus:ring-2 focus:ring-orange-500"
    >
      <div className="glass-card p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Interactive Card</h3>
        <p className="text-sm mb-4 line-clamp-2">
          This card has full visual polish with animations
        </p>
        <div className="flex gap-2">
          <span className="gradient-text font-semibold">Learn More →</span>
        </div>
      </div>
    </button>
  );
}
```

### Example 2: Loading State with Shimmer

```jsx
export function LoadingCard() {
  return (
    <div className="space-y-3 p-6 bg-white rounded-lg">
      <div className="shimmer h-6 w-3/4 rounded"></div>
      <div className="shimmer h-4 w-full rounded"></div>
      <div className="shimmer h-4 w-5/6 rounded"></div>
    </div>
  );
}
```

### Example 3: CTA Button with Glow

```jsx
function CallToActionButton() {
  return (
    <button className="pulse-glow px-6 py-3 bg-orange-500 text-white rounded-lg font-bold">
      Get Started
    </button>
  );
}
```

### Example 4: Staggered List Entrance

```jsx
function StaggeredList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="slide-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## Performance Guidelines

### Animation Best Practices

1. **Use `transform` and `opacity` only** - These properties don't trigger repaints
   - ✅ Good: `scale`, `translate`, `rotate`, `opacity`
   - ❌ Avoid: `width`, `height`, `top`, `left`

2. **Keep durations short** - 200-400ms feels responsive
   - ✅ Entrance: 300-400ms
   - ✅ Hover: 200ms
   - ✅ Looping: 2-3s

3. **Use `ease-out` for entrances** - Feels snappier
4. **Use `ease-in-out` for loops** - Feels natural

### GPU Acceleration

All animations use properties that trigger GPU acceleration:
- `transform` (scale, translate, rotate)
- `opacity`

This means they run at 60fps with minimal CPU impact.

### Testing Performance

```bash
# Build and check bundle impact
npm run build

# Check Lighthouse performance
npm run audit:a11y

# Profile in Chrome DevTools
# 1. Open DevTools → Performance tab
# 2. Record interaction
# 3. Check for smooth 60fps (< 3ms per frame render)
```

---

## Utility Classes Reference

| Class | Purpose | Duration | Use Case |
|-------|---------|----------|----------|
| `.fade-in` | Smooth entrance | 0.3s | Page load, reveals |
| `.slide-in-up` | Bottom entrance | 0.4s | Cards, modals |
| `.slide-in-down` | Top entrance | 0.4s | Headers, menus |
| `.pulse-glow` | Expanding glow | 2s loop | CTAs, alerts |
| `.shimmer` | Loading sweep | 2s loop | Skeletons |
| `.float` | Floating motion | 3s loop | Idle animation |
| `.bounce-soft` | Subtle bounce | 2s loop | Attention |
| `.btn-scale` | Click feedback | 0.2s | Buttons |
| `.card-lift` | Hover lift | 0.3s | Cards |
| `.input-glow` | Focus glow | Instant | Inputs |
| `.gradient-text` | Orange gradient | N/A | Headlines |
| `.transition-smooth` | Smooth all | 0.25s | General |
| `.glass-card` | Glass effect | 0.3s | Containers |
| `.scroll-smooth` | Smooth scroll | Instant | Full page |

---

## Storybook Documentation

View all component styles and interactions:

```bash
npm run storybook
```

Then navigate to:
- **Micro-Interactions/Transitions** - See all animations
- **Components/Button** - See button variants
- **Components/Card** - See card variants
- **Components/Input** - See form polish
- **Components/Badge** - See badge variants

---

## Browser Support

All animations and transitions are supported in:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+

For older browsers, animations gracefully degrade (element appears without animation).

---

## Future Enhancements

Potential additions to visual polish:

1. **Parallax Scrolling** - Hero sections
2. **SVG Animations** - Logo, icons
3. **Page Transition** - Route animations
4. **Gesture Animations** - Mobile swipes
5. **Sound Effects** - Optional audio feedback
6. **Theme Transition** - Dark/light mode switch animation
7. **Advanced Easing** - Spring physics, ease-back
8. **3D Transforms** - Perspective effects

---

## Questions or Issues?

See [ACCESSIBILITY_AUDIT.md](../ACCESSIBILITY_AUDIT.md) for testing guidelines and [tokens.ts](../theme/tokens.ts) for design token consistency.
