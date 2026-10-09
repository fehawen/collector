import { build } from 'esbuild'

build({
    entryPoints: ['src/main.js'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: 'dist/collector.js'
}).catch(() => process.exit(1))
