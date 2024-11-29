/* eslint-disable no-undef */

import * as Sval from 'sval';

interface ContainerInfo {
  name: string;
  icon?: string;
  color?: string;
}

function toContainerInfo(value: any): ContainerInfo | undefined {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return { name: value };
  }
  if (typeof value === "object") {
    if (typeof value.name === "string") {
      return value;
    }
  }
  return undefined;
}

async function onBeforeRequest(
  request: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {

  const { script } = await browser.storage.local.get("script");
  if (!script) {
    return {};
  }

  // @ts-ignore
  const interpreter = new Sval({
    ecmaVer: 'latest',
    sourceType: 'script',
    sandBox: true,
  });
  interpreter.import({ url: new URL(request.url) });
  interpreter.run(`exports.end = (() => { ${script} })()`);

  const info = toContainerInfo(interpreter.exports.end);
  if (!info) {
    return {};
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

  // Check if it's already in the correct container
  const tab = await browser.tabs.get(request.tabId);
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
    url: browser.runtime.getURL("ui.html")
  });
});
