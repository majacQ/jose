import type QUnit from 'qunit'
import type * as jose from '../src/index.js'
import * as roundtrip from './sign.js'

export default (
  QUnit: QUnit,
  lib: typeof jose,
  keys: Pick<typeof jose, 'exportJWK' | 'generateKeyPair' | 'generateSecret' | 'importJWK'>,
) => {
  const { module, test } = QUnit
  module('hmac.ts')

  const algorithms = ['HS256', 'HS384', 'HS512']

  function digestSizeSecretsFor(alg: string) {
    return [
      keys.generateSecret(alg, { extractable: true }),
      crypto.getRandomValues(new Uint8Array(parseInt(alg.slice(2, 5), 10) >> 3)),
    ]
  }

  function nonDigestSizeSecretFor(alg: string) {
    const length = parseInt(alg.slice(2, 5), 10) >> 3
    return [
      crypto.getRandomValues(new Uint8Array(length - 1)),
      crypto.getRandomValues(new Uint8Array(length + 1)),
    ]
  }

  for (const alg of algorithms) {
    test(alg, async (t) => {
      for await (const secret of digestSizeSecretsFor(alg)) {
        await roundtrip.jws(t, lib, keys, alg, secret)
      }
    })

    test(`${alg} w/ non-digest output length secrets`, async (t) => {
      for await (const secret of nonDigestSizeSecretFor(alg)) {
        await roundtrip.jws(t, lib, keys, alg, secret)
      }
    })

    test(`${alg} JWT`, async (t) => {
      await roundtrip.jwt(t, lib, keys, alg, await digestSizeSecretsFor(alg)[0])
    })
  }
}
