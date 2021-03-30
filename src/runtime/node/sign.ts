import * as crypto from 'crypto'
import { promisify } from 'util'

import type { SignFunction } from '../interfaces.d'
import nodeDigest from './dsa_digest.js'
import hmacDigest from './hmac_digest.js'
import nodeKey from './node_key.js'
import getSignKey from './get_sign_verify_key.js'

let oneShotSign = crypto.sign
if (oneShotSign.length > 3) {
  // @ts-expect-error
  oneShotSign = promisify(oneShotSign)
}

const sign: SignFunction = async (alg, key: unknown, data) => {
  const keyObject = getSignKey(alg, key)

  if (alg.startsWith('HS')) {
    const bitlen = parseInt(alg.substr(-3), 10)
    if (!keyObject.symmetricKeySize || keyObject.symmetricKeySize << 3 < bitlen) {
      throw new TypeError(`${alg} requires symmetric keys to be ${bitlen} bits or larger`)
    }
    const hmac = crypto.createHmac(hmacDigest(alg), keyObject)
    hmac.update(data)
    return hmac.digest()
  }

  return oneShotSign(nodeDigest(alg), data, nodeKey(alg, keyObject))
}

export default sign
