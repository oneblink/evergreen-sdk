'use strict'

import EvergreenUpdater from './evergreen-updater.js'

beforeEach(() => {
  global.fetch = {}
})

test('should throw if required arguments are missing', () => {
  expect(() => new EvergreenUpdater({})).toThrow('ionicDeploy Plugin is missing, did you wait for the deviceready event?')
  expect(() => new EvergreenUpdater({tenantId: 't', ionicDeploy: {}, platformId: 'android'})).toThrow('appId was not specified')
  expect(() => new EvergreenUpdater({appId: 't', ionicDeploy: {}, platformId: 'android'})).toThrow('tenantId was not specified')
  expect(() => new EvergreenUpdater({tenantId: 't', ionicDeploy: {}, appId: 'id'})).toThrow('Cordova is not initialized yet, did you wait for the deviceready event?')
})

test('should set the properties', () => {
  const expectedIonic = {init: () => true}
  const expectedAppId = 'appId'
  const expectedTenant = 'tenant'
  const expectedZipUrl = `https://evergreen.blinkm.io/${expectedTenant}/${expectedAppId}/www-platformId.zip`

  const eu = new EvergreenUpdater({ionicDeploy: expectedIonic, appId: expectedAppId, tenantId: expectedTenant, platformId: 'platformId'})

  expect(eu.ionicDeploy).toBe(expectedIonic)
  expect(eu.appId).toBe(expectedAppId)
  expect(eu.zipUrl).toBe(expectedZipUrl)
})

describe('eTag handling', () => {
  let eu
  let mockIonic = {init: () => true}

  beforeEach(() => {
    global.fetch = () => Promise.resolve({
      headers: {
        get: () => 'etag'
      }
    })

    mockIonic.parseUpdate = jest.fn((appId, options, onSuccess) => onSuccess('true'))

    eu = new EvergreenUpdater({ionicDeploy: mockIonic, appId: 'appId', tenantId: 'b', platformId: 'platformId'})
  })

  test('should return an eTag', (done) => {
    eu._getEtag().then((eTag) => {
      expect(eTag).toBe('etag')
      done()
    })
  })

  test('should pass the correct values to ionicDeploy.parseUpdate', (done) => {
    const expectedOptions = {
      data: {
        available: true,
        compatible: true,
        snapshot: 'etag',
        url: eu.zipUrl
      }
    }
    eu._parseUpdate('etag')
      .then(() => {
        expect(mockIonic.parseUpdate).toBeCalled()
        expect(mockIonic.parseUpdate.mock.calls[0][0]).toBe('appId')
        expect(mockIonic.parseUpdate.mock.calls[0][1]).toMatchObject(expectedOptions)
        done()
      })
  })
})

describe('downloading', () => {
  let eu
  let mockIonic = {init: () => true}

  beforeEach(() => {
    global.fetch = () => Promise.resolve({
      headers: {
        get: () => 'etag'
      }
    })

    mockIonic.parseUpdate = jest.fn()
    mockIonic.download = jest.fn()
    mockIonic.extract = jest.fn()
    eu = new EvergreenUpdater({ionicDeploy: mockIonic, appId: 'a', tenantId: 'b', platformId: 'platformId'})
  })

  test('should resolve with `done`', (done) => {
    mockIonic.parseUpdate.mockImplementation((appId, options, onSuccess) => onSuccess('true'))
    mockIonic.download.mockImplementation((appId, onSuccess) => onSuccess('true'))
    mockIonic.extract.mockImplementation((appId, onSuccess) => onSuccess('done'))

    eu.download().then(done)
  })

  test('should call the progress cb then finish', (done) => {
    mockIonic.parseUpdate.mockImplementation((appId, options, onSuccess) => onSuccess('true'))
    mockIonic.download.mockImplementation((appId, onSuccess) => onSuccess(1))
    mockIonic.extract.mockImplementation((appId, onSuccess) => onSuccess('done'))

    const progressCb = jest.fn((type, result) => {
      expect(result).toBe(1)
      expect(type).toBe('download')
      done()
    })

    eu.download(progressCb)
  })

})
