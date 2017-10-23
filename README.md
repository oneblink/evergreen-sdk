# Evergreen updater [![npm](https://img.shields.io/npm/v/@blinkmobile/evergreen-sdk.svg?maxAge=2592000)](https://www.npmjs.com/package/@blinkmobile/evergreen-sdk) [![AppVeyor Status](https://ci.appveyor.com/api/projects/status/github/blinkmobile/evergreen-sdk?branch=master&svg=true)](https://ci.appveyor.com/project/blinkmobile/evergreen-sdk) [![Travis CI Status](https://travis-ci.org/blinkmobile/evergreen-sdk.svg?branch=master)](https://travis-ci.org/blinkmobile/evergreen-sdk) [![Greenkeeper badge](https://badges.greenkeeper.io/blinkmobile/evergreen-sdk.svg)](https://greenkeeper.io/)

A Module to handle getting and using an evergreen update made with the [Blink Buildbots](https://github.com/blinkmobile/buildbot-cli)

## Installation

`npm i --save @blinkmobile/evergreen-sdk`

## Prerequisites

-   Apache Cordova
-   [ionic-plugin-deploy](https://www.npmjs.com/package/ionic-plugin-deploy)

## Usage

For iOS < 10 and older Android projects `dist/bm-evergreen-updater-legacy.js` should be used. This includes the [WhatWG fetch pollyfil](https://github.com/github/fetch) and is transpiled from ES6 to ES5. ES6 builds using `import` will include `src/evergreen-updater.js`

You must make sure the `deviceready` event from cordova has fired before using this plugin

```javascript
const EvergreenUpdater = require('@blinkmobile/evergreen-sdk')

document.addEventListener('deviceready', function () {
  const eu = new EvergreenUpdater({ appId: 'appId', tenantId: 'blinkTenantId' })

  eu.check().then((updateAvailable) => {
    if (updateAvailable) {
      return eu.download().then(() => eu.restart())
    }
  })
})
```

## API

### Constructor (options: object)

-   `options.appId`: Your Cordova app id from `config.xml`
-   `options.tenantId`: Your Blink Mobile Tenant Id
-   `options.ionicDeploy`: The Ionic Deploy plugin (optional, will use window.IonicDeploy if not specified)
-   `options.platformId`: The cordova platform id (optional, will use cordova.platformId if not specified)


### check `() => Promise<boolean>`

Resolves with `true` if an update is available, `false` if not

### download `(progressCB: function(stage: string, progress: number)) => Promise<void>`

-   `progressCB`: called whenever Ionic Deploy reports progress. `stage` will be one of 'download' or 'extract', `progress` is the percent complete for that particular stage

Resolves on successful download, rejects if an error occurred

### restart `() => void`

Applies the update and restarts the app
