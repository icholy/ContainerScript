import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

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

await build({
	entryPoints: [monacoPath('esm/vs/editor/editor.worker.js')],
	bundle: true,
	format: 'esm',
	minify: true,
	outfile: 'dist/editor.worker.js',
});

await build({
	entryPoints: [monacoPath('esm/vs/language/typescript/ts.worker.js')],
	bundle: true,
	format: 'esm',
	minify: true,
	outfile: 'dist/ts.worker.js',
	external: ['*/lib/typescriptServices.js'],
});

await build({
	entryPoints: [monacoPath('esm/vs/language/typescript/lib/typescriptServices.js')],
	bundle: true,
	format: 'esm',
	minify: true,
	outfile: 'dist/lib/typescriptServices.js',
});

await build({
	entryPoints: ['ui.ts'],
	bundle: true,
	format: 'iife',
	minify: true,
	outfile: './dist/ui.js',
	loader: { '.ttf': 'file' }
});

await build({
	entryPoints: ['background.ts'],
	bundle: true,
	format: 'iife',
	minify: true,
	outfile: './dist/background.js',
});
