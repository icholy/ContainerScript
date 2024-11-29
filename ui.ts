import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

async function main() {
	// setup the div
	const div = document.createElement('div');
	div.id = 'root';
	// @ts-ignore
	div.style = 'width:800px; height:600px; border:1px solid #ccc;';
	document.body.appendChild(div);

	// setup the url parameter for auto-complete
	const libSource = [
		"/**",
		" * The URL we're finding a container for",
		" */",
		"declare const url: URL"
	].join("\n")
	const libUri = "ts:filename/ContainerScript.d.ts";
	monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
	monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

	// create the editor
	const editor = monaco.editor.create(document.getElementById('root')!, {
		language: 'javascript',
		automaticLayout: true,
	});

	// setup sync
	const { script } = await browser.storage.local.get("script");
	if (script) {
		editor.setValue(script);
	}

	let timeout: any;
	editor.onDidChangeModelContent(() => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			browser.storage.local.set({ script: editor.getValue() });
		}, 300);
	});
}


main();
