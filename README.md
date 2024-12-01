# WIP: Container Script

> Firefox Addon for programatically assigning URLs to containers.

### Build

``` sh
npm ci
npm run build:monaco
npm run package
```

### Install

* Open firefox to `about:debugging#/runtime/this-firefox`
* Click "Load Temporary Add-on..."
* Select the `manifest.json` file.
