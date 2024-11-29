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

monaco.editor.create(document.getElementById('root')!, {
	value: `const foo = () => 0;`,
	language: 'javascript',
	automaticLayout: true,
});
