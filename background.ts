/* eslint-disable no-undef */

import Sval from 'sval';

interface ContainerInfo {
  name: string;
  icon?: string;
  color?: string;
}

type ContainerInfoFn = (url: URL) => string | ContainerInfo | undefined | null;

let fn: ContainerInfoFn = () => null;

async function main() {
  const { script } = await browser.storage.local.get("script");
  if (script) {
    try {
      fn = new Function("url", script) as ContainerInfoFn;
    } catch (err) {
      console.error('Failed to update fn:', err);
    }
  }

  browser.storage.local.onChanged.addListener(changes => {
    if (changes.script) {
      try {
        fn = new Function("url", script) as ContainerInfoFn;
      } catch (err) {
        console.error('Failed to update fn:', err);
      }
    }
  });
};

main();

browser.storage.local.get("script").then((value) => {
  try {
    fn = new Function("url", value.script) as ContainerInfoFn;
  } catch (err) {
    console.error('Failed to update fn:', err);
  }
});

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

  const interpreter = new Sval({
    ecmaVer: 'latest',
    sourceType: 'script',
    sandBox: true,
  });

  interpreter.import({ url: new URL(request.url) });
  interpreter.run(`exports.end = (() => { ${script} })()`);

  // get the container info
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
    urls: ["*://signin.aws.amazon.com/federation*"],
    types: ["main_frame"],
  },
  ["blocking"],
);

browser.browserAction.onClicked.addListener(async () => {
  await browser.tabs.create({
    url: browser.runtime.getURL("ui.html")
  });
});
