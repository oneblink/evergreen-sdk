// @flow
'use strict'

/*::

export type ParseUpdateOptions = {
  data: {
    available: boolean,
    compatible: boolean,
    snapshot: string,
    url: string
  }
}

export type IonicDeploy = {
  download: (string, Function, Function) => void,
  redirect: (string) => void,
  parseUpdate: (string, ParseUpdateOptions, Function, Function) => void,
  deploy: (string, Function, Function) => void,
  extract: (string, Function, Function) => void,
  init: (string, string) => void
}

export type EvergreenUpdaterOptions = {
  appId: string,
  tennantId: string,
  ionicDeploy: ?IonicDeploy,
  platformId: ?string
}

*/

export default class EvergreenUpdater {
  /*:: ionicDeploy: IonicDeploy */
  /*:: appId: string */
  /*:: zipUrl: string */

  constructor ({
    appId,
    tennantId,
    ionicDeploy,
    platformId
  } /*: EvergreenUpdaterOptions */) /*: void */ {
    if (!ionicDeploy && !window.IonicDeploy) {
      throw new Error('ionicDeploy Plugin is missing, did you wait for the deviceready event?')
    }

    if (!platformId && !window.cordova) {
      throw new Error('Cordova is not initialized yet, did you wait for the deviceready event?')
    }

    if (!appId) {
      throw new Error('appId was not specified')
    }

    if (!tennantId) {
      throw new Error('tennantId was not specified')
    }

    this.ionicDeploy = ionicDeploy || window.IonicDeploy
    platformId = platformId || window.cordova.platformId.toLowerCase()
    this.appId = appId
    this.zipUrl = `https://evergreen.blinkm.io/${tennantId}/${this.appId}/www-${platformId}.zip`

    this.ionicDeploy.init(this.appId, 'https://evergreen.blinkm.io/fake/deploy')
  }

  check () /*: Promise<boolean> */ {
    return this._getEtag()
      .then((etag) => this._parseUpdate(etag))
      .catch(() => false)
  }

  download (onProgressCb /*: ?function */ = () => true) {
    if (typeof onProgressCb !== 'function') {
      throw new Error('progress call back must be a function')
    }

    return new Promise((resolve, reject) => {
      const onSuccess = (result) => {
        if (result === 'true') {
          return this._extractUpdate(onProgressCb).then(resolve)
        }

        onProgressCb && onProgressCb('download', result)
      }

      const onError = (err) => reject(err)

      this.ionicDeploy.download(this.appId, onSuccess, onError)
    })
  }

  restart () /*:void */ {
    this.ionicDeploy.redirect(this.appId)
  }

// private functions
  _getEtag () /*: Promise<string> */ {
    const url = `${this.zipUrl}?time=${(new Date()).getTime()}`
    const cfg = {
      method: 'HEAD',
      mode: 'cors'
    }

    return fetch(url, cfg)
      .then((response) => {
        const eTag = response.headers.get('etag')

        if (!eTag) {
          return Promise.reject(new Error('No eTag Found'))
        }

        return eTag
      })
  }

  _parseUpdate (eTag /*: string */) /*: Promise<boolean> */ {
    return new Promise((resolve, reject) => {
      const options = {
        data: {
          available: true,
          compatible: true,
          snapshot: eTag,
          url: this.zipUrl
        }
      }
      const onSuccess = (result) => resolve(result === 'true')
      const onError = (err) => reject(err)
      this.ionicDeploy.parseUpdate(this.appId, options, onSuccess, onError)
    })
  }

  _extractUpdate (onProgressCb /*: ?function */ = () => true) /*: Promise<void | string> */ {
    return new Promise((resolve, reject) => {
      const onSuccess = (result) => result === 'done' ? resolve() : (onProgressCb && onProgressCb('extract', result))
      const onError = (err) => reject(err)

      this.ionicDeploy.extract(this.appId, onSuccess, onError)
    })
  }
}
