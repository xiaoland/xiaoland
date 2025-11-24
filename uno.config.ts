import { defineConfig } from 'unocss'
import { presetWind3 } from 'unocss'

export default defineConfig({
    presets: [presetWind3()],
    cli: {
        entry: [
            {
                patterns: ['src/**/*.{tsx,ts,jsx,js,html}'],
                outFile: 'dist/uno.css'
            }
        ]
    }
})