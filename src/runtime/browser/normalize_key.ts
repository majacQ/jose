import type { KeyLike } from '../../types.d'
import { decode } from '../base64url.js'
import importJWK from '../jwk_to_key.js'

const normalizeSecretKey = (k: string) => decode(k)

export const normalizePublicKey = async (key: KeyLike | Uint8Array | unknown, alg: string) => {
  // @ts-expect-error
  if (key?.[Symbol.toStringTag] === 'KeyObject') {
    // @ts-expect-error
    let jwk = key.export({ format: 'jwk' })
    delete jwk.d
    delete jwk.dp
    delete jwk.dq
    delete jwk.p
    delete jwk.q
    delete jwk.qi
    if (jwk.k) {
      return normalizeSecretKey(jwk.k)
    }

    return importJWK({ ...jwk, alg })
  }

  return <KeyLike | Uint8Array>key
}

export const normalizePrivateKey = async (key: KeyLike | Uint8Array | unknown, alg: string) => {
  // @ts-expect-error
  if (key?.[Symbol.toStringTag] === 'KeyObject') {
    // @ts-expect-error
    let jwk = key.export({ format: 'jwk' })
    if (jwk.k) {
      return normalizeSecretKey(jwk.k)
    }

    return importJWK({ ...jwk, alg })
  }

  return <KeyLike | Uint8Array>key
}