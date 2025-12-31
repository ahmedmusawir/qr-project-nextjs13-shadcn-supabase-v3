# Design System

This document describes the design system used in QR Project V3, including color palette, typography, spacing, and layout conventions.

---

## Overview

The design system is built using **Tailwind CSS** with custom configurations for colors, fonts, and spacing. All components follow a consistent design language for visual cohesion.

---

## Color Palette

### Primary Colors

```css
/* Red (Primary Brand Color) */
--red-500: #ef4444;    /* Border accents */
--red-600: #dc2626;    /* Hover states */
--red-700: #b91c1c;    /* Buttons */

/* Slate (Neutral) */
--slate-50: #f8fafc;   /* Backgrounds */
--slate-100: #f1f5f9;  /* Light backgrounds */
--slate-600: #475569;  /* Secondary buttons */
--slate-900: #0f172a;  /* Text */

/* White/Black */
--white: #ffffff;
--black: #000000;
```

### Usage Examples

```typescript
// Red accent border
<div className="border-b-4 border-red-500">

// Red button
<Button className="bg-red-700 hover:bg-red-600">

// Slate secondary button
<Button className="bg-slate-600 hover:bg-slate-500">
```

### Semantic Colors

| Purpose | Color | Class |
|---------|-------|-------|
| Success | Green | `bg-green-500` |
| Error/Destructive | Red | `bg-red-500` |
| Warning | Yellow | `bg-yellow-500` |
| Info | Blue | `bg-blue-500` |

---

## Typography

### Font Family

```css
/* Tailwind Default Font Stack */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Font Sizes

```typescript
// Headings
<h1 className="text-4xl font-extrabold">     // 36px
<h2 className="text-3xl font-extrabold">     // 30px
<h3 className="text-2xl font-bold">          // 24px
<h4 className="text-xl font-semibold">       // 20px

// Body text
<p className="text-base">                    // 16px (default)
<p className="text-sm">                      // 14px
<p className="text-xs">                      // 12px

// Large text
<p className="text-lg">                      // 18px
```

### Font Weights

```typescript
className="font-light"        // 300
className="font-normal"       // 400 (default)
className="font-medium"       // 500
className="font-semibold"     // 600
className="font-bold"         // 700
className="font-extrabold"    // 800
```

### Text Alignment

```typescript
className="text-left"         // Left align
className="text-center"       // Center align
className="text-right"        // Right align
```

### Example: Typography Hierarchy

```typescript
<div>
  <h1 className="text-4xl font-extrabold text-slate-900">
    Main Page Title
  </h1>

  <h2 className="text-3xl font-bold text-slate-800 mt-8">
    Section Title
  </h2>

  <h3 className="text-2xl font-semibold text-slate-700 mt-6">
    Subsection Title
  </h3>

  <p className="text-base text-slate-600 mt-4">
    Body text with normal weight and default size.
  </p>

  <p className="text-sm text-slate-500 mt-2">
    Small supporting text.
  </p>
</div>
```

---

## Spacing

### Padding

```typescript
// Standard spacing scale (4px base unit)
className="p-1"    // 4px
className="p-2"    // 8px
className="p-4"    // 16px (common)
className="p-6"    // 24px
className="p-8"    // 32px
className="p-10"   // 40px
className="p-12"   // 48px

// Directional padding
className="pt-4"   // Padding top
className="pb-4"   // Padding bottom
className="pl-4"   // Padding left
className="pr-4"   // Padding right
className="px-4"   // Padding horizontal (left + right)
className="py-4"   // Padding vertical (top + bottom)
```

### Margin

```typescript
// Same scale as padding
className="m-4"    // 16px all sides
className="mt-8"   // Margin top 32px
className="mb-16"  // Margin bottom 64px
className="mx-auto" // Horizontal centering
```

### Gap (Flex/Grid)

```typescript
// Flex gap
<div className="flex space-x-4">        // Horizontal gap
<div className="flex space-y-4">        // Vertical gap

// Grid gap
<div className="grid gap-4">            // 16px gap
<div className="grid gap-6">            // 24px gap
```

---

## Layout

### Container

```typescript
// Page container with responsive padding
<div className="p-2 sm:p-10">
  {/* Content */}
</div>
```

### Responsive Grid

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Flexbox Layouts

```typescript
// Horizontal layout with centering
<div className="flex justify-center items-center">

// Horizontal layout with space between
<div className="flex justify-between items-center">

// Vertical stack
<div className="flex flex-col space-y-4">

// Responsive flex direction
<div className="flex flex-col sm:flex-row">
```

---

## Borders

### Border Width

```typescript
className="border"       // 1px
className="border-2"     // 2px
className="border-4"     // 4px (accent borders)
```

### Border Color

```typescript
className="border-slate-200"    // Light border
className="border-slate-300"    // Default border
className="border-red-500"      // Accent border
```

### Border Radius

```typescript
className="rounded"        // 4px
className="rounded-md"     // 6px
className="rounded-lg"     // 8px (cards)
className="rounded-full"   // Fully rounded (badges)
```

### Example: Card Border

```typescript
<div className="border border-slate-200 rounded-lg shadow-md p-6">
  <h3 className="text-xl font-bold">Card Title</h3>
  <p>Card content</p>
</div>
```

---

## Shadows

```typescript
className="shadow-sm"      // Small shadow
className="shadow"         // Default shadow
className="shadow-md"      // Medium shadow (cards)
className="shadow-lg"      // Large shadow
className="shadow-xl"      // Extra large shadow
```

### Example: Elevated Card

```typescript
<div className="bg-white shadow-lg rounded-lg p-6">
  <h3>Elevated Card</h3>
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Min Width | Prefix |
|------------|-----------|--------|
| Mobile | 0px | (none) |
| Small | 640px | `sm:` |
| Medium | 768px | `md:` |
| Large | 1024px | `lg:` |
| Extra Large | 1280px | `xl:` |

### Responsive Examples

```typescript
// Responsive padding
<div className="p-2 sm:p-10">

// Responsive text size
<h1 className="text-2xl sm:text-4xl">

// Responsive grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive visibility
<div className="hidden sm:block">  // Hidden on mobile, visible on desktop
```

---

## Component Patterns

### Page Layout Pattern

```typescript
export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-2 sm:p-10">
        {children}
      </div>
    </div>
  );
}
```

### Section Pattern

```typescript
<section className="mt-16">
  <h2 className="text-3xl font-extrabold text-center mb-8">
    Section Title
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Section content */}
  </div>
</section>
```

### Card Pattern

```typescript
<div className="bg-white border border-slate-200 rounded-lg shadow-md p-6">
  <h3 className="text-xl font-bold mb-4">Card Title</h3>
  <p className="text-slate-600">Card content</p>
</div>
```

---

## Form Styling

### Form Container

```typescript
<form className="space-y-4 max-w-md mx-auto">
  {/* Form fields */}
</form>
```

### Form Field

```typescript
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input
    id="field"
    className="w-full"
    placeholder="Enter value"
  />
</div>
```

### Form Actions

```typescript
<div className="flex justify-end space-x-3 mt-6">
  <Button variant="outline">Cancel</Button>
  <Button type="submit">Submit</Button>
</div>
```

---

## Table Styling

### Standard Table

```typescript
<Table className="mb-8">
  <TableHeader className="border-b-4 border-red-500">
    <TableRow>
      <TableHead className="font-bold text-sm sm:text-xl">
        Column 1
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-slate-50">
      <TableCell>Data</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Status Indicators

### Status Badges

```typescript
// Live (green)
<Badge className="bg-green-500 text-white">Live</Badge>

// Validated (red)
<Badge className="bg-red-500 text-white">Validated</Badge>

// Cancelled (gray)
<Badge className="bg-gray-500 text-white">Cancelled</Badge>

// Paid (blue)
<Badge className="bg-blue-500 text-white">Paid</Badge>
```

---

## Animation

### Transitions

```typescript
// Hover effects
className="transition-colors duration-200 hover:bg-red-600"

// Transform
className="transform hover:scale-105 transition-transform"

// Spin animation (loading)
className="animate-spin"
```

### Loading States

```typescript
<div className="flex justify-center items-center">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
</div>
```

---

## Dark Mode Support

The application currently uses a light theme. To add dark mode:

```typescript
// Tailwind config (tailwind.config.js)
module.exports = {
  darkMode: 'class',
  // ...
}

// Usage
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
```

---

## Accessibility

### Focus States

```typescript
className="focus:outline-none focus:ring-2 focus:ring-red-500"
```

### Skip to Content

```typescript
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0"
>
  Skip to content
</a>
```

---

## Design Tokens

### Custom CSS Variables

```css
/* In globals.css or tailwind config */
:root {
  --primary: #b91c1c;        /* Red 700 */
  --secondary: #475569;       /* Slate 600 */
  --background: #ffffff;
  --foreground: #0f172a;     /* Slate 900 */
}
```

### Usage

```typescript
className="bg-[var(--primary)]"
className="text-[var(--foreground)]"
```

---

## Best Practices

### 1. Consistent Spacing

Use the spacing scale consistently (4, 8, 16, 24, 32, etc.):

```typescript
// ✅ Good
<div className="p-4 mt-8 mb-16">

// ❌ Bad (arbitrary values)
<div className="p-3 mt-7 mb-15">
```

### 2. Semantic Color Usage

Use colors semantically:

```typescript
// ✅ Good
<Badge variant="destructive">Error</Badge>

// ❌ Bad
<Badge className="bg-red-500">Error</Badge>
```

### 3. Responsive First

Always consider mobile first:

```typescript
// ✅ Good
<div className="text-sm sm:text-base md:text-lg">

// ❌ Bad (desktop first)
<div className="text-lg md:text-sm">
```

---

## Related Documentation

- [Component Library](/docs/ui-components/component-library.md) - Shadcn components
- [Admin Portal](/docs/ui-components/admin-portal.md) - Admin UI
- [SuperAdmin Portal](/docs/ui-components/superadmin-portal.md) - SuperAdmin UI
- [Forms and Validation](/docs/ui-components/forms-and-validation.md) - Form patterns

---

**Last Updated:** December 31, 2025
