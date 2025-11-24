import { defineConfig } from 'unocss'
import { presetWind3 } from 'unocss'

export default defineConfig({
    presets: [presetWind3()],
    theme: {
        colors: {
            // Reference design token CSS variables
            'home-bg': 'var(--bg-primary)',
            'home-title': 'var(--text-brand)',
            'home-text': 'var(--text-primary)',
            'home-tags': 'var(--text-primary)',
            'article-list-title': 'var(--text-heading)',
            'article-list-empty': 'var(--text-tertiary)',
            'article-entry-bg': 'var(--bg-elevated)',
            'article-entry-border': 'var(--border-strong)',
            'article-entry-title': 'var(--text-primary)',
            'article-entry-description': 'var(--text-secondary)',
            'article-entry-date': 'var(--text-tertiary)',
            // System tokens
            'bg-primary': 'var(--bg-primary)',
            'bg-secondary': 'var(--bg-secondary)',
            'bg-tertiary': 'var(--bg-tertiary)',
            'bg-elevated': 'var(--bg-elevated)',
            'text-primary': 'var(--text-primary)',
            'text-secondary': 'var(--text-secondary)',
            'text-tertiary': 'var(--text-tertiary)',
            'text-brand': 'var(--text-brand)',
            'text-heading': 'var(--text-heading)',
            'border-default': 'var(--border-default)',
            'border-subtle': 'var(--border-subtle)',
            'border-strong': 'var(--border-strong)',
        }
    },
    cli: {
        entry: [
            {
                patterns: ['src/**/*.{tsx,ts,jsx,js,html}'],
                outFile: 'dist/uno.css'
            }
        ]
    }
})