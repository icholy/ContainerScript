import * as monaco from 'monaco-editor';

const container = document.getElementById('container');
monaco.editor.create(container!, {
	value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
	language: 'javascript'
});
