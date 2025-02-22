# Function: createLocalJWKSet()

## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

▸ **createLocalJWKSet**(`jwks`): (`protectedHeader`?, `token`?) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKey`](../../../types/type-aliases/CryptoKey.md)\>

Returns a function that resolves a JWS JOSE Header to a public key object from a locally stored,
or otherwise available, JSON Web Key Set.

It uses the "alg" (JWS Algorithm) Header Parameter to determine the right JWK "kty" (Key Type),
then proceeds to match the JWK "kid" (Key ID) with one found in the JWS Header Parameters (if
there is one) while also respecting the JWK "use" (Public Key Use) and JWK "key_ops" (Key
Operations) Parameters (if they are present on the JWK).

Only a single public key must match the selection process. As shown in the example below when
multiple keys get matched it is possible to opt-in to iterate over the matched keys and attempt
verification in an iterative manner.

Note: The function's purpose is to resolve public keys used for verifying signatures and will not
work for public encryption keys.

This function is exported (as a named export) from the main `'jose'` module entry point as well
as from its subpath export `'jose/jwks/local'`.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jwks` | [`JSONWebKeySet`](../../../types/interfaces/JSONWebKeySet.md) | JSON Web Key Set formatted object. |

## Returns

`Function`

### Parameters

| Parameter | Type |
| ------ | ------ |
| `protectedHeader`? | [`JWSHeaderParameters`](../../../types/interfaces/JWSHeaderParameters.md) |
| `token`? | [`FlattenedJWSInput`](../../../types/interfaces/FlattenedJWSInput.md) |

### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKey`](../../../types/type-aliases/CryptoKey.md)\>

## Examples

```js
const JWKS = jose.createLocalJWKSet({
  keys: [
    {
      kty: 'RSA',
      e: 'AQAB',
      n: '12oBZRhCiZFJLcPg59LkZZ9mdhSMTKAQZYq32k_ti5SBB6jerkh-WzOMAO664r_qyLkqHUSp3u5SbXtseZEpN3XPWGKSxjsy-1JyEFTdLSYe6f9gfrmxkUF_7DTpq0gn6rntP05g2-wFW50YO7mosfdslfrTJYWHFhJALabAeYirYD7-9kqq9ebfFMF4sRRELbv9oi36As6Q9B3Qb5_C1rAzqfao_PCsf9EPsTZsVVVkA5qoIAr47lo1ipfiBPxUCCNSdvkmDTYgvvRm6ZoMjFbvOtgyts55fXKdMWv7I9HMD5HwE9uW839PWA514qhbcIsXEYSFMPMV6fnlsiZvQQ',
      alg: 'PS256',
    },
    {
      crv: 'P-256',
      kty: 'EC',
      x: 'ySK38C1jBdLwDsNWKzzBHqKYEE5Cgv-qjWvorUXk9fw',
      y: '_LeQBw07cf5t57Iavn4j-BqJsAD1dpoz8gokd3sBsOo',
      alg: 'ES256',
    },
  ],
})

const { payload, protectedHeader } = await jose.jwtVerify(jwt, JWKS, {
  issuer: 'urn:example:issuer',
  audience: 'urn:example:audience',
})
console.log(protectedHeader)
console.log(payload)
```

Opting-in to multiple JWKS matches using `createLocalJWKSet`

```js
const options = {
  issuer: 'urn:example:issuer',
  audience: 'urn:example:audience',
}
const { payload, protectedHeader } = await jose
  .jwtVerify(jwt, JWKS, options)
  .catch(async (error) => {
    if (error?.code === 'ERR_JWKS_MULTIPLE_MATCHING_KEYS') {
      for await (const publicKey of error) {
        try {
          return await jose.jwtVerify(jwt, publicKey, options)
        } catch (innerError) {
          if (innerError?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
            continue
          }
          throw innerError
        }
      }
      throw new jose.errors.JWSSignatureVerificationFailed()
    }

    throw error
  })
console.log(protectedHeader)
console.log(payload)
```
