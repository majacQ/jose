# Function: EmbeddedJWK()

## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

▸ **EmbeddedJWK**(`protectedHeader`?, `token`?): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKey`](../../../types/type-aliases/CryptoKey.md)\>

EmbeddedJWK is an implementation of a GetKeyFunction intended to be used with the JWS/JWT verify
operations whenever you need to opt-in to verify signatures with a public key embedded in the
token's "jwk" (JSON Web Key) Header Parameter. It is recommended to combine this with the verify
function's `algorithms` option to define accepted JWS "alg" (Algorithm) Header Parameter values.

This function is exported (as a named export) from the main `'jose'` module entry point as well
as from its subpath export `'jose/jwk/embedded'`.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `protectedHeader`? | [`JWSHeaderParameters`](../../../types/interfaces/JWSHeaderParameters.md) |
| `token`? | [`FlattenedJWSInput`](../../../types/interfaces/FlattenedJWSInput.md) |

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`CryptoKey`](../../../types/type-aliases/CryptoKey.md)\>

## Example

```js
const jwt =
  'eyJqd2siOnsiY3J2IjoiUC0yNTYiLCJ4IjoiVU05ZzVuS25aWFlvdldBbE03NmNMejl2VG96UmpfX0NIVV9kT2wtZ09vRSIsInkiOiJkczhhZVF3MWwyY0RDQTdiQ2tPTnZ3REtwWEFidFhqdnFDbGVZSDhXc19VIiwia3R5IjoiRUMifSwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJ1cm46ZXhhbXBsZTppc3N1ZXIiLCJhdWQiOiJ1cm46ZXhhbXBsZTphdWRpZW5jZSIsImlhdCI6MTYwNDU4MDc5NH0.60boak3_dErnW47ZPty1C0nrjeVq86EN_eK0GOq6K8w2OA0thKoBxFK4j-NuU9yZ_A9UKGxPT_G87DladBaV9g'

const { payload, protectedHeader } = await jose.jwtVerify(jwt, jose.EmbeddedJWK, {
  issuer: 'urn:example:issuer',
  audience: 'urn:example:audience',
})

console.log(protectedHeader)
console.log(payload)
```
