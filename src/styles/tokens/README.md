# Design Tokens System

This project uses a three-layer design token system following the CTI (Category-Type-Item) pattern with Sass maps and integrates with UnoCSS.

## Architecture

### 1. Reference Tokens (`_reference.scss`)
Base design primitives organized by category (following CTI structure):

- **$color**: Blue, gray, error, white, black
- **$font**: Family, size, weight, line-height
- **$elevation**: Shadow values (none, sm, md, lg)
- **$opacity**: Opacity values
- **$spacing**: Spacing scale
- **$radius**: Border radius values

### 2. System Tokens (`_system-light.scss`, `_system-dark.scss`)
Semantic tokens that map to reference colors for each theme:

- **$color**: bg, text, border, interactive, error, surface
- **$font**: body, heading, mono
- **$elevation**: none, sm, md, lg

### 3. Component Tokens (`_component.scss`)
Component-specific tokens organized at module level:

```scss
$home: (
  bg: sys-color-bg-primary,
  title: sys-color-text-brand,
  ...
)

$comment: (
  bg: ...,
  form: (
    border: ...,
    bg: ...
  )
)
```

## Usage

### In TSX Files (with UnoCSS)
Use dynamic utility classes with the token naming convention:

```tsx
// Component tokens
<div className="bg-comp-home-bg text-comp-home-title">

// System tokens
<div className="bg-sys-color-bg-primary text-sys-color-text-brand">
```

### In SCSS Files
Use the helper functions:

```scss
@use '../styles/tokens/functions' as fn;

.my-component {
  // Use component token
  background: fn.use-comp(comment, form, bg);
  
  // Use system token
  color: fn.use-sys(color, text, primary);
  
  // Use reference token
  border-color: fn.use-ref(color, gray, 200);
}
```

### Composite Font Tokens
Use the `apply-font` mixin:

```scss
@use '../styles/tokens/functions' as fn;

.heading {
  @include fn.apply-font((
    family: var(--sys-font-heading-family),
    size: var(--sys-font-size-2xl),
    weight: var(--sys-font-heading-weight),
    line-height: var(--sys-font-heading-line-height),
  ));
}
```

## CSS Variable Naming Convention

Follows CTI+namespace pattern:

- **Reference**: `--ref-{category}-{type}-{item}` (e.g., `--ref-color-blue-500`)
- **System**: `--sys-{category}-{type}-{item}` (e.g., `--sys-color-bg-primary`)
- **Component**: `--comp-{component}-{property}` (e.g., `--comp-home-bg`)

## How It Works

1. **Build Time**: Sass compiles token files and generates CSS custom properties
2. **Light Mode**: CSS variables set with light mode values in `:root`
3. **Dark Mode**: Media query `@media (prefers-color-scheme: dark)` overrides system tokens
4. **UnoCSS Integration**: Dynamic rules match token patterns to generate utility classes

## Adding New Tokens

1. Add reference values to appropriate category in `_reference.scss`
2. Map them in both `_system-light.scss` and `_system-dark.scss`
3. Create component tokens in `_component.scss` at module level
4. UnoCSS will automatically pick up new tokens via dynamic rules

## Benefits

- **CTI Structure**: Industry-standard token organization
- **Nested Maps**: Clean, maintainable Sass structure
- **Automatic Dark Mode**: Based on user preferences
- **Type Safety**: Token names validated at build time
- **Performance**: CSS variables are fast and efficient
- **Composite Tokens**: Support for complex token types like typography
