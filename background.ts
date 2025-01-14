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
  name: string | null;
  icon?: string;
  color?: string;
}

function toContainerInfo(value: any): ContainerInfo | undefined {
  if (typeof value !== "object" || value === null) {
    return toContainerInfo({ name: value });
  }
  if (typeof value.name === "string" || value.name === null) {
    return value;
  }
  return undefined;
}

const DEFAULT_COOKIE_STORE_ID = "firefox-default";

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
  if (!info) {
    return {};
  }

  const tab = await browser.tabs.get(request.tabId);

  // Open in the default container (no container) if name is null.
  if (info.name === null) {
    if (!tab.cookieStoreId || tab.cookieStoreId === DEFAULT_COOKIE_STORE_ID) {
      return {};
    }

    await browser.tabs.create({
      url: request.url,
      cookieStoreId: DEFAULT_COOKIE_STORE_ID,
    });

    await browser.tabs.remove(request.tabId);

    return { cancel: true };
  }

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
