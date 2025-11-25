import { defineConfig } from 'unocss'
import { presetWind3 } from 'unocss'
import type { Rule } from '@unocss/core'

// Dynamic rules to use design token CSS variables
// This allows any token to be used without explicit declaration
const tokenRules: Rule[] = [
  // Background colors using system tokens: bg-sys-color-bg-primary
  [/^bg-sys-color-(.+)$/, ([, token]) => ({ 'background-color': `var(--sys-color-${token})` })],
  // Background colors using component tokens: bg-comp-home-bg
  [/^bg-comp-(.+)$/, ([, token]) => ({ 'background-color': `var(--comp-${token})` })],
  
  // Text colors using system tokens: text-sys-color-text-primary
  [/^text-sys-color-(.+)$/, ([, token]) => ({ color: `var(--sys-color-${token})` })],
  // Text colors using component tokens: text-comp-home-title
  [/^text-comp-(.+)$/, ([, token]) => ({ color: `var(--comp-${token})` })],
  
  // Border colors using system tokens: border-sys-color-border-default
  [/^border-sys-color-(.+)$/, ([, token]) => ({ 'border-color': `var(--sys-color-${token})` })],
  // Border colors using component tokens
  [/^border-comp-(.+)$/, ([, token]) => ({ 'border-color': `var(--comp-${token})` })],
  
  // Font family using system tokens: font-sys-font-body-family
  [/^font-sys-font-(.+)-family$/, ([, token]) => ({ 'font-family': `var(--sys-font-${token}-family)` })],
  // Font size using system tokens: text-sys-font-body-size
  [/^text-sys-font-(.+)-size$/, ([, token]) => ({ 'font-size': `var(--sys-font-${token}-size)` })],
  // Font weight using system tokens: font-sys-font-body-weight
  [/^font-sys-font-(.+)-weight$/, ([, token]) => ({ 'font-weight': `var(--sys-font-${token}-weight)` })],
  
  // Elevation/shadow using system tokens: shadow-sys-elevation-md
  [/^shadow-sys-elevation-(.+)$/, ([, token]) => ({ 'box-shadow': `var(--sys-elevation-${token})` })],
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