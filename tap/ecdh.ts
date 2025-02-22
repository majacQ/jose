import type QUnit from 'qunit'
import * as env from './env.js'
import type * as jose from '../src/index.js'
import * as roundtrip from './encrypt.js'

export default (
  QUnit: QUnit,
  lib: typeof jose,
  keys: Pick<typeof jose, 'exportJWK' | 'generateKeyPair' | 'generateSecret' | 'importJWK'>,
) => {
  const { module, test } = QUnit
  module('ecdh.ts')

  const kps: Record<string, jose.GenerateKeyPairResult> = {}

  type Vector = [string, boolean] | [string, boolean, jose.GenerateKeyPairOptions]
  const algorithms: Vector[] = [
    ['ECDH-ES', true],
    ['ECDH-ES', true, { crv: 'P-384' }],
    ['ECDH-ES', !env.isDeno, { crv: 'P-521' }],
    [
      'ECDH-ES',
      env.isNode ||
        env.isDeno ||
        env.isElectron ||
        env.isWorkerd ||
        env.isEdgeRuntime ||
        (env.isGecko && env.isBrowserVersionAtLeast(132)) ||
        (env.isBlink && env.isBrowserVersionAtLeast(133)),
      { crv: 'X25519' },
    ],
  ]

  function title(vector: Vector) {
    const [alg, works, options] = vector
    let result = ''
    if (!works) {
      result = '[not supported] '
    }
    result += `${alg} ${options?.crv || 'P-256'}`
    return result
  }

  for (const vector of algorithms) {
    const [alg, works, options] = vector
    const k = options?.crv || alg

    const execute = async (t: typeof QUnit.assert) => {
      if (!kps[k]) {
        kps[k] = await keys.generateKeyPair(alg, { ...options, extractable: true })
      }
      await roundtrip.jwe(t, lib, keys, alg, 'A128GCM', kps[k])
    }

    const jwt = async (t: typeof QUnit.assert) => {
      if (!kps[k]) {
        kps[k] = await keys.generateKeyPair(alg, { ...options, extractable: true })
      }
      await roundtrip.jwt(t, lib, keys, alg, 'A128GCM', kps[k])
    }

    if (works) {
      test(title(vector), execute)
      test(`${title(vector)} JWT`, jwt)
    } else {
      test(title(vector), async (t) => {
        await t.rejects(execute(t))
      })
    }
  }
}
