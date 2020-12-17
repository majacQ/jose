import type { KeyObject } from 'crypto'

import type { AesGcmKwWrapFunction, AesGcmKwUnwrapFunction } from '../interfaces.d'
import encrypt from './encrypt.js'
import decrypt from './decrypt.js'
import ivFactory from '../../lib/iv.js'
import random from './random.js'
import { encode as base64url } from './base64url.js'

const generateIv = ivFactory(random)

export const wrap: AesGcmKwWrapFunction = async (
  alg: string,
  key: KeyObject | Uint8Array,
  cek: Uint8Array,
  iv?: Uint8Array,
) => {
  const jweAlgorithm = alg.substr(0, 7)
  // eslint-disable-next-line no-param-reassign
  iv ||= generateIv(jweAlgorithm)

  const { ciphertext: encryptedKey, tag } = await encrypt(
    jweAlgorithm,
    cek,
    key instanceof Uint8Array ? key : key.export(),
    iv,
    new Uint8Array(),
  )

  return { encryptedKey, iv: base64url(iv), tag: base64url(tag) }
}

export const unwrap: AesGcmKwUnwrapFunction = async (
  alg: string,
  key: KeyObject | Uint8Array,
  encryptedKey: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
) => {
  const jweAlgorithm = alg.substr(0, 7)

  return decrypt(
    jweAlgorithm,
    key instanceof Uint8Array ? key : key.export(),
    encryptedKey,
    iv,
    tag,
    new Uint8Array(),
  )
}
