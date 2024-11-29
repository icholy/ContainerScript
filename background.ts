/* eslint-disable no-undef */

interface ContainerInfo {
  name: string;
  icon?: string;
  color?: string;
}

type ContainerInfoFn = (url: URL) => string | ContainerInfo | undefined | null;

const fn: ContainerInfoFn = (url) => {
  if (
    url.hostname === "signin.aws.amazon.com" &&
    url.pathname === "/federation" &&
    url.searchParams.get("Action") === "login"
  ) {
    return url.searchParams.get("x-SessionName");
  }
};

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

  // get the container info
  const url = new URL(request.url);
  const info = toContainerInfo(fn(url));
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
