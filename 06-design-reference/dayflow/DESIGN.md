---
name: DayFlow
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3.5rem
---

## Brand & Style

This design system embodies a calm, motivating, simple, and premium SaaS aesthetic tailored for a personal productivity and wellness web application. The emotional response is centered around mental clarity, effortless organization, and gentle encouragement. 

We embrace a refined **Corporate / Modern** style infused with soft tactile warmth. The visual language relies on generous whitespace, high-fidelity typography, and low-contrast structuring to ensure users feel focused rather than overwhelmed.

## Colors

The palette is anchored by a soft off-white canvas (`#F8FAFC`) that reduces eye strain during extended use. Deep navy (`#0F172A`) drives structural typography, offering high legibility without the harshness of pure black. 

Royal blue (`#2563EB`) serves as the primary action color, signaling focus and dependability, while subtle mint-green (`#10B981`) acts as a restorative accent for completed milestones and wellness check-ins.

## Typography

Typography balances approachable geometry with utilitarian clarity. Plus Jakarta Sans drives all headings, imparting a soft, welcoming, yet professional tone. Inter handles body copy and interface labels, ensuring high scanability and crisp rendering at small sizes. 

On mobile viewports, scale down headline sizes proportionally (`headline-xl` collapses to 28px) to maintain balanced optical hierarchy within constrained viewports.

## Layout & Spacing

This design system uses a **Fluid grid** layout with a 12-column structure optimized for expansive desktop dashboards while gracefully collapsing down to single-column flows on mobile devices. 

Spacing is governed by an 8pt baseline rhythm, translated into organic token scales. Generous outer canvas margins (`2rem` desktop, `1rem` mobile) preserve the calm, uncluttered atmosphere essential for productivity software.

## Elevation & Depth

Visual hierarchy relies on a hybrid approach of **tonal layering** and **ambient shadows**. 

Surfaces are constructed by lifting white cards off the off-white background using ultra-soft, diffused shadows (`0px 4px 20px -2px rgba(15, 23, 42, 0.05)`). Delicate, low-contrast borders (`rgba(15, 23, 42, 0.08)`) reinforce structural boundaries without creating visual friction or heavy contrast.

## Shapes

The shape language employs a **Rounded** philosophy (`roundedness: 2`). Default UI containers feature `0.5rem` border-radius, scaling up to `1rem` for major cards and `1.5rem` for prominent modals. 

This friendly geometry eliminates sharp corners across the interface, fostering a frictionless, nurturing environment for daily task management and wellness tracking.

## Components

### Buttons
Primary buttons utilize the royal blue fill (`#2563EB`) with subtle hover elevation and high-contrast white text. Secondary actions use ghost styles with delicate borders and deep navy labels. All buttons maintain generous horizontal padding and a medium rounded profile.

### Chips & Tags
Compact pill-shaped containers used for task categorization and mood statuses. They feature soft neutral backgrounds with mint-green or royal blue subtle text accents.

### Lists
Task and habit lists incorporate generous vertical spacing, clean dividers, and smooth inline micro-interactions for completion states.

### Checkboxes & Radio Buttons
Custom geometric inputs featuring soft rounded borders. Checked states fill smoothly with mint-green (`#10B981`) or royal blue, paired with subtle checkmark iconography.

### Input Fields
Form fields feature an off-white or pure white background set against delicate borders. Focus states transition smoothly to the primary royal blue with a subtle matching ring shadow.

### Cards
Core structural containers featuring rounded corners, soft ambient shadows, and delicate borders. Ideal for grouping daily schedule blocks, wellness summaries, and reflection prompts.

### Additional Components
- **Progress Rings:** Circular visual indicators using mint-green accents to track daily habit completion and mindfulness streaks.
- **Timeline Dividers:** Clean chronological markers designed to structure the user's daily flow without visual clutter.