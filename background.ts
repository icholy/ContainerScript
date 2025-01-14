import Sval from "sval";
import * as acorn from "acorn";

let program: acorn.Program | undefined;

async function onScriptChanged() {
  program = undefined;
  const { script } = await browser.storage.local.get("script");
  if (!script) {
    return;
  }
  program = acorn.parse(`exports.end = (() => { ${script} })()`, {
    ecmaVersion: "latest",
    sourceType: "script",
  });
}

onScriptChanged();
browser.storage.local.onChanged.addListener(onScriptChanged);

interface ContainerInfo {
  name: string;
  icon?: string;
  color?: string;
}

function toContainerInfo(value: any): ContainerInfo | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return { name: value };
  }
  if (typeof value === "object") {
    if (value.name && typeof value.name === "string") {
      return value;
    }
  }
  return undefined;
}

async function onBeforeRequest(
  request: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
  if (!program) {
    return {};
  }

  const interpreter = new Sval({
    ecmaVer: "latest",
    sourceType: "script",
    sandBox: true,
  });
  interpreter.import({ url: new URL(request.url) });
  interpreter.run(program);

  const info = toContainerInfo(interpreter.exports.end);
  if (info === undefined) {
    return {};
  }

  const tab = await browser.tabs.get(request.tabId);

  if (info === null) {
    // Open in the default container (no container)
    if (!tab.cookieStoreId || tab.cookieStoreId === "firefox-default") {
      return {};
    }

    await browser.tabs.create({
      url: request.url,
      cookieStoreId: "firefox-default", // Default container
    });

    await browser.tabs.remove(request.tabId);

    return { cancel: true };
  }

  // Existing logic to handle opening in specified containers
  // Get or create the container
  const containers = await browser.contextualIdentities.query({
    name: info.name,
  });
  const container =
    containers[0] ??
    (await browser.contextualIdentities.create({
      name: info.name,
      color: info.color ?? "blue",
      icon: info.icon ?? "fingerprint",
    }));

  if (tab.cookieStoreId === container.cookieStoreId) {
    return {};
  }

  // Create new tab in container
  await browser.tabs.create({
    url: request.url,
    cookieStoreId: container.cookieStoreId,
  });

  // Close the old tab
  await browser.tabs.remove(request.tabId);

  return { cancel: true };
}

// Listen for web requests
browser.webRequest.onBeforeRequest.addListener(
  onBeforeRequest,
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking"],
);

browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: browser.runtime.getURL("ui.html"),
  });
});
