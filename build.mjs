import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

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
	entryPoints: ['ui.js'],
	bundle: true,
	format: 'iife',
	minify: true,
	outfile: './dist/ui.js',
	loader: { '.ttf': 'file' }
});

await fs.promises.copyFile('ui.html', './dist/ui.html');
