# Design Tokens System

This project uses a three-layer design token system to manage colors and styles consistently across the application with support for both light and dark modes.

## Architecture

### 1. Reference Tokens (`_reference.scss`)
Base color palette - foundation colors that don't change between themes.

Example:
- `blue-50`: #eaeffa
- `blue-500`: #2f65f7
- `gray-600`: #555

### 2. System Tokens (`_system-light.scss`, `_system-dark.scss`)
Semantic tokens that map to reference colors for each theme.

Example:
- `bg-primary`: blue-50 (light) / gray-900 (dark)
- `text-brand`: blue-500 (light) / blue-700 (dark)

### 3. Component Tokens (`_component.scss`)
Component-specific semantic tokens that reference system tokens.

Example:
- `home-bg`: bg-primary
- `article-entry-border`: border-strong

## Usage

### In TSX Files (with UnoCSS)
Use the token names directly as utility classes:

```tsx
<div className="bg-home-bg text-home-title">
  Content
</div>
```

### In SCSS Files
Use the `use-token` function:

```scss
@use '../styles/tokens/functions' as fn;

.my-component {
  background: fn.use-token('comments-form-bg');
  color: fn.use-token('text-primary');
}
```

## How It Works

1. **Build Time**: Sass compiles the token files and generates CSS custom properties (CSS variables)
2. **Light Mode**: CSS variables are set with light mode values by default in `:root`
3. **Dark Mode**: A media query `@media (prefers-color-scheme: dark)` overrides the CSS variables with dark mode values
4. **UnoCSS Integration**: The `uno.config.ts` references these CSS variables in the theme configuration

## Adding New Tokens

1. Add reference colors to `_reference.scss` if needed
2. Map them in both `_system-light.scss` and `_system-dark.scss`
3. Create component tokens in `_component.scss`
4. Add to UnoCSS theme in `uno.config.ts` if you need utility classes

## Benefits

- **Consistency**: Single source of truth for design values
- **Maintainability**: Easy to update colors across the entire app
- **Dark Mode**: Automatic theme switching based on user preferences
- **Type Safety**: Token names are validated at build time
- **Performance**: CSS variables are fast and efficient
