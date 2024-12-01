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
* Select the `dist/manifest.json` file.

### Notes

We're forced to vendor the monaco-editor repository until the following PR is merged: https://github.com/microsoft/monaco-editor/pull/4765
