import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

(function () {
	// create div to avoid needing a HtmlWebpackPlugin template
	const div = document.createElement('div');
	div.id = 'root';
	// @ts-ignore
	div.style = 'width:800px; height:600px; border:1px solid #ccc;';

	document.body.appendChild(div);
})();

const libSource = [
	"/**",
	" * The URL we're finding a container for",
	" */",
	"declare const url: URL"
].join("\n")
const libUri = "ts:filename/ContainerScript.d.ts";
monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

const editor = monaco.editor.create(document.getElementById('root')!, {
	language: 'javascript',
	automaticLayout: true,
});

browser.storage.local.get("script").then((value) => {
	editor.setValue(value.script);
});

let timeout: number | undefined;
editor.onDidChangeModelContent(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
	browser.storage.local.set({ script: editor.getValue() });
  }, 300);
});
