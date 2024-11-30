import { build } from 'esbuild';

await build({
	entryPoints: ['monaco-editor/esm/vs/editor/editor.worker.js'],
	minify: true,
	bundle: true,
	outfile: './dist/editor.worker.js',
});

await build({
	entryPoints: ['monaco-editor/esm/vs/language/typescript/ts.worker.js'],
	minify: true,
	bundle: true,
	format: 'esm',
	outfile: './dist/ts.worker.js',
});
