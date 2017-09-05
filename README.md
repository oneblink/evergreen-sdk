# Evergreen updater [![npm](https://img.shields.io/npm/v/@blinkmobile/evergreen.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/evergreen)

A Module to handle getting and using an evergreen update made with the [Blink Buildbots](https://github.com/blinkmobile/buildbot-cli)

## Installation

`npm i --save @blinkmobile/evergreen`

## Prerequisites

- Apache Cordova
- [ionic-plugin-deploy](https://www.npmjs.com/package/ionic-plugin-deploy)

## Usage

For iOS < 10 and older Android projects `dist/bm-evergreen-updater-legacy.js` should be used. This includes the [WhatWG fetch pollyfil](https://github.com/github/fetch) and is transpiled from ES6 to ES5. ES6 builds using `import` will include `src/evergreen-updater.js`

You must make sure the deviceready event from cordova has fired before using this plugin

```javascript
const EvergreenUpdater = require('@blinkmobile/evergreen')

document.addEventListener('deviceready', function () {
  const eu = new EvergreenUpdater(window.IonicDeploy, 'appId', 'blinkTennantId', window.cordova.platformId.toLowerCase())

  eu.check().then((updateAvailable) => {
    if (updateAvailable) {
      return eu.download().then(() => eu.restart())
    }
  })
})
```

## API

### Constructor (IonicDeploy: Object, appId: string, tennantId: string, platformId: string)

- IonicDeploy - The Ionic Deploy plugin instance
- appId - Your Cordova app id from `config.xml`
- tennantId - Your Blink Mobile Tennant Id
- platform Id - the cordova platform Id

### check () : Promise<boolean>

Resolves with `true` if an update is available, `false` if not

### download (progressCB: function(stage: string, progress: number)): Promise<void>

- progressCB - called whenever Ionic Deploy reports progress. `stage` will be one of 'download' or 'extract'

Resolves on successful download, rejects if an error occured

### restart () : void

Applies the update and restarts the app
