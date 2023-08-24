import * as checksums from '../src/checksums'
import nock from 'nock'
import {afterEach, describe, expect, test, jest} from '@jest/globals'

jest.setTimeout(30000)

test('fetches wrapper jars checksums', async () => {
  const validChecksums = await checksums.fetchValidChecksums(false, false, [])
  expect(validChecksums.length).toBeGreaterThan(10)
})

test('fetches wrapper jars checksums only for detected versions', async () => {
  const validChecksums = await checksums.fetchValidChecksums(false, true, [
    '8.2.1'
  ])
  expect(validChecksums.length).toBe(1)
})

describe('retry', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('for /versions/all API', () => {
    test('retry three times', async () => {
      nock('https://services.gradle.org', {allowUnmocked: true})
        .get('/versions/all')
        .times(3)
        .replyWithError({
          message: 'connect ECONNREFUSED 104.18.191.9:443',
          code: 'ECONNREFUSED'
        })

      const validChecksums = await checksums.fetchValidChecksums(
        false,
        false,
        []
      )
      expect(validChecksums.length).toBeGreaterThan(10)
      nock.isDone()
    })
  })
})
