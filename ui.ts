// @ts-ignore
import * as monaco from "./monaco-editor/out/monaco-editor/esm/vs/editor/editor.main.js";

async function main() {
  self.MonacoEnvironment = {
    getWorkerUrl(moduleId, label) {
      if (label === "typescript" || label === "javascript") {
        return "ts.worker.js";
      }
      return "editor.worker.js";
    },
  };

  // setup the url parameter for auto-complete
  const libSource = [
    "/**",
    " * The URL we're finding a container for",
    " */",
    "declare const url: URL",
  ].join("\n");
  const libUri = "ts:filename/ContainerScript.d.ts";
  monaco.languages.typescript.javascriptDefaults.addExtraLib(libSource, libUri);
  monaco.editor.createModel(libSource, "typescript", monaco.Uri.parse(libUri));

  // setup keepTab checkbox
  const keepTabCheckbox = document.getElementById("keepTab") as HTMLInputElement;
  const { keepTab } = await browser.storage.local.get("keepTab");
  keepTabCheckbox.checked = keepTab === true;
  keepTabCheckbox.addEventListener("change", () => {
    browser.storage.local.set({ keepTab: keepTabCheckbox.checked });
  });

  const { script } = await browser.storage.local.get("script");

  // create the editor
  const editor = monaco.editor.create(document.getElementById("root")!, {
    value: script || "// Write JavaScript code here",
    language: "javascript",
    automaticLayout: true,
  });

  let timeout: any;
  editor.onDidChangeModelContent(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      browser.storage.local.set({ script: editor.getValue() });
    }, 300);
  });
}

main();
