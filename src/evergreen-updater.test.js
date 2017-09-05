'use strict'

import EvergreenUpdater from './evergreen-updater.js'

beforeEach(() => {
  global.fetch = {}
})

test('should throw if required arguments are missing', () => {
  expect(() => new EvergreenUpdater()).toThrow('ionicDeploy Plugin is missing')
  expect(() => new EvergreenUpdater({})).toThrow('appId was not specified')
  expect(() => new EvergreenUpdater({}, 'appId')).toThrow('tennant was not specified')
  expect(() => new EvergreenUpdater({}, 'appId', 'tennant')).toThrow('platformId was not specified')
})

test('should set the properties', () => {
  const expectedIonic = {}
  const expectedAppId = 'appId'
  const expectedTennant = 'tennant'
  const expectedZipUrl = `https://evergreen.blinkm.io/${expectedTennant}/${expectedAppId}/www-platformId.zip`

  const eu = new EvergreenUpdater(expectedIonic, expectedAppId, expectedTennant, 'platformId')

  expect(eu.ionicDeploy).toBe(expectedIonic)
  expect(eu.appId).toBe(expectedAppId)
  expect(eu.tennant).toBe(expectedTennant)
  expect(eu.zipUrl).toBe(expectedZipUrl)
})

describe('eTag handling', () => {
  let eu
  let mockIonic = {}

  beforeEach(() => {
    global.fetch = () => Promise.resolve({
      headers: {
        get: () => 'etag'
      }
    })

    mockIonic.parseUpdate = jest.fn((appId, options, onSuccess) => onSuccess('true'))

    eu = new EvergreenUpdater(mockIonic, 'appId', 'tennant', 'platformId')
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
  let mockIonic = {}

  beforeEach(() => {
    global.fetch = () => Promise.resolve({
      headers: {
        get: () => 'etag'
      }
    })

    mockIonic.parseUpdate = jest.fn()
    mockIonic.download = jest.fn()
    mockIonic.extract = jest.fn()
    eu = new EvergreenUpdater(mockIonic, 'appId', 'tennant', 'platformId')
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
