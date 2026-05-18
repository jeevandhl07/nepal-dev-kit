# @jeevandhl07/nepal-dev-kit

Nepal-focused developer utilities for JavaScript, TypeScript, React, React Native, Expo, and Next.js.

> **Current focus:** Nepali Calendar (Bikram Sambat) — other utilities coming soon.

## Installation

```bash
npm install @jeevandhl07/nepal-dev-kit
```

React and React Native are **peer dependencies** — install them separately if needed:

```bash
npm install react react-native
```

## Core Usage

```ts
import {
  getBSMonthDays,
  getBSYears,
  isValidBSDate,
  getCalendarMonthGrid,
  convertADToBS,
  convertBSToAD,
  formatWithDevanagariDigits,
} from "@jeevandhl07/nepal-dev-kit/core";

getBSMonthDays(2080, 1); // days in Baisakh 2080
getBSYears(); // [2000, 2001, ..., 2100]
isValidBSDate(2080, 1, 15); // true
convertADToBS({ year: 2026, month: 5, day: 18 }); // { year: 2083, month: 2, day: 4 }
convertBSToAD({ year: 2083, month: 2, day: 4 }); // { year: 2026, month: 5, day: 18 }
formatWithDevanagariDigits(2083, true); // "२०८३"
```

## React / Next.js

```tsx
import { NepaliCalendar } from "@jeevandhl07/nepal-dev-kit/react";

function App() {
  return (
    <NepaliCalendar
      devanagari
      onChange={(date, info) => console.log(date, info)}
    />
  );
}
```

## React Native / Expo

```tsx
import { NepaliCalendar } from "@jeevandhl07/nepal-dev-kit/react-native";

function App() {
  return (
    <NepaliCalendar
      devanagari
      onChange={(date, info) => console.log(date, info)}
    />
  );
}
```

## Import Guide

| Environment              | Import path                              |
| ------------------------ | ---------------------------------------- |
| Core (any project)       | `@jeevandhl07/nepal-dev-kit/core`          |
| Calendar core            | `@jeevandhl07/nepal-dev-kit/core/calendar` |
| React / Next.js          | `@jeevandhl07/nepal-dev-kit/react`         |
| React Native / Expo      | `@jeevandhl07/nepal-dev-kit/react-native`  |
| Root (core utilities)    | `@jeevandhl07/nepal-dev-kit`               |

## Calendar Feature List

- [x] Bikram Sambat years 2000–2100
- [x] Lookup-based month lengths (no fake formula)
- [x] Month navigation (previous / next)
- [x] Year selector picker
- [x] Day selection with visual highlight
- [x] Today highlight
- [x] React web component (plain HTML elements)
- [x] React Native component (View, Text, Pressable, StyleSheet)
- [x] TypeScript-first with full type declarations
- [x] Tree-shakable ESM + CJS builds
- [x] Works with Next.js (`"use client"` directive)
- [x] Accurate AD-to-BS and BS-to-AD conversion
- [x] Exact weekday alignment
- [x] Optional Devanagari digits and Nepali labels with `devanagari`
- [ ] Holidays
- [ ] Range picker
- [ ] Date picker modal

> **Note:** Bikram Sambat month lengths require lookup data; they are not calculated by a fixed Gregorian-style formula. The included data should be cross-verified against official Nepali calendar sources before production use.

## Roadmap

- Holiday data
- Range picker
- Date picker modal

## License

MIT
