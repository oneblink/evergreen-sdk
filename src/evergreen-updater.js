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
}

*/

export default class EvergreenUpdater {
  /*:: ionicDeploy: any */
  /*:: appId: string */
  /*:: tennant: string */
  /*:: zipUrl: string */

  constructor (
    ionicDeploy /*: any */,
    appId /*: string */,
    tennant /*: string */,
    platformId /*: string */
  ) /*:void */ {
    if (!ionicDeploy) {
      throw new Error('ionicDeploy Plugin is missing')
    }

    if (!appId) {
      throw new Error('appId was not specified')
    }

    if (!tennant) {
      throw new Error('tennant was not specified')
    }

    if (!platformId) {
      throw new Error('platformId was not specified')
    }

    this.ionicDeploy = ionicDeploy
    this.appId = appId
    this.tennant = tennant
    this.zipUrl = `https://evergreen.blinkm.io/${this.tennant}/${this.appId}/www-${platformId}.zip`

    this.ionicDeploy.init(this.appId, 'https://evergreen.blinkm.io/fake/deploy')
  }

  check () /*: Promise<boolean> */ {
    return this._getEtag()
      .then((etag) => this._parseUpdate(etag))
      .catch(() => false)
  }

  download (onProgressCb /*: function */ = () => true) {
    return new Promise((resolve, reject) => {
      const onSuccess = (result) => {
        if (result === 'true') {
          return this._extractUpdate(onProgressCb).then(resolve)
        }

        onProgressCb('download', result)
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

  _extractUpdate (onProgressCb /*: function */) /*: Promise<void | string> */ {
    return new Promise((resolve, reject) => {
      const onSuccess = (result) => result === 'done' ? resolve() : onProgressCb('extract', result)
      const onError = (err) => reject(err)

      this.ionicDeploy.extract(this.appId, onSuccess, onError)
    })
  }
}
