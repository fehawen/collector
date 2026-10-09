import { build } from 'esbuild'

build({
    entryPoints: ['src/main.js'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: 'dist/collector.js',
    banner: {
        js: '#!/usr/bin/env node'
    }
}).catch(() => process.exit(1))
