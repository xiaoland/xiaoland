import { defineConfig } from 'unocss'
import { presetWind3 } from 'unocss'
import type { Rule } from '@unocss/core'

// Dynamic rules to use design token CSS variables
// Pattern: <type>-<sys|comp>-<*keys>
// Type refers to CTI's type: bg, color, border, shadow, font
const tokenRules: Rule[] = [
  // Background: bg-sys-* or bg-comp-*
  // e.g., bg-sys-bg-primary, bg-comp-home-bg
  [/^bg-sys-(.+)$/, ([, token]) => ({ 'background-color': `var(--sys-color-${token})` })],
  [/^bg-comp-(.+)$/, ([, token]) => ({ 'background-color': `var(--comp-${token})` })],
  
  // Text color: color-sys-* or color-comp-*
  // e.g., color-sys-text-primary, color-comp-home-title
  [/^color-sys-(.+)$/, ([, token]) => ({ color: `var(--sys-color-${token})` })],
  [/^color-comp-(.+)$/, ([, token]) => ({ color: `var(--comp-${token})` })],
  
  // Border: border-sys-* or border-comp-*
  // e.g., border-sys-border-default, border-comp-article-entry-border
  [/^border-sys-(.+)$/, ([, token]) => ({ 'border-color': `var(--sys-color-${token})` })],
  [/^border-comp-(.+)$/, ([, token]) => ({ 'border-color': `var(--comp-${token})` })],
  
  // Shadow: shadow-sys-*
  // e.g., shadow-sys-sm, shadow-sys-md, shadow-sys-lg
  [/^shadow-sys-(.+)$/, ([, token]) => ({ 'box-shadow': `var(--sys-elevation-${token})` })],
  
  // Font (composite token): font-sys-*
  // Sets font-family, font-size, font-weight, line-height all at once
  // e.g., font-sys-body, font-sys-heading, font-sys-mono
  [/^font-sys-(.+)$/, ([, token]) => ({
    'font-family': `var(--sys-font-${token}-family)`,
    'font-size': `var(--sys-font-${token}-size)`,
    'font-weight': `var(--sys-font-${token}-weight)`,
    'line-height': `var(--sys-font-${token}-line-height)`,
  })],
]

export default defineConfig({
    presets: [presetWind3()],
    rules: tokenRules,
    cli: {
        entry: [
            {
                patterns: ['src/**/*.{tsx,ts,jsx,js,html}'],
                outFile: 'dist/uno.css'
            }
        ]
    }
})