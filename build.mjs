import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

await fs.promises.rm('dist', { recursive: true, force: true });

const assets = [
	'manifest.json',
	'ui.html',
	'icon/icon-16.png',
	'icon/icon-32.png',
	'icon/icon-48.png',
	'icon/icon-128.png',
	'icon/icon-512.png',
];

for (const src of assets) {
	const dst = path.join('dist', src);
	await fs.promises.mkdir(path.dirname(dst), { recursive: true });
	await fs.promises.copyFile(src, dst);
}

function monacoPath(name) {
	return path.join('./monaco-editor/out/monaco-editor', name);
}

await Promise.all([
	build({
		entryPoints: [monacoPath('esm/vs/editor/editor.worker.js')],
		bundle: true,
		format: 'esm',
		minify: true,
		outfile: 'dist/editor.worker.js',
	}),
	build({
		entryPoints: [monacoPath('esm/vs/language/typescript/ts.worker.js')],
		bundle: true,
		format: 'esm',
		minify: true,
		outfile: 'dist/ts.worker.js',
		external: ['*/lib/typescriptServices.js'],
	}),
	build({
		entryPoints: [monacoPath('esm/vs/language/typescript/lib/typescriptServices.js')],
		bundle: true,
		format: 'esm',
		minify: true,
		outfile: 'dist/lib/typescriptServices.js',
	}),
	build({
		entryPoints: ['ui.ts'],
		bundle: true,
		format: 'iife',
		minify: true,
		outdir: 'dist',
		loader: { '.ttf': 'file' }
	}),
	build({
		entryPoints: ['background.ts'],
		bundle: true,
		format: 'iife',
		minify: true,
		outfile: './dist/background.js',
	}),
]);
