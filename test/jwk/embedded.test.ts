import test from 'ava'

import { importJWK, EmbeddedJWK, FlattenedSign, flattenedVerify } from '../../src/index.js'

function pubjwk(jwk) {
  const { d, p, q, dp, dq, qi, ext, alg, ...publicJwk } = jwk
  return publicJwk
}

test.before(async (t) => {
  const encode = TextEncoder.prototype.encode.bind(new TextEncoder())
  t.context.key = {
    crv: 'P-256',
    alg: 'ES256',
    ext: false,
    x: 'Sp3KpzPjwcCF04_W2GvSSf-vGDvp3Iv2kQYqAjnMB-Y',
    y: 'lZmecT2quXe0i9f7b4qHvDAFDpxs0oxCoJx4tOOqsks',
    d: 'hRVo5TGE_d_4tQC1KEQIlCdo9rteZmLSmaMPpFOjeDI',
    kty: 'EC',
  }

  const privateKey = await importJWK(t.context.key)
  t.context.token = await new FlattenedSign(
    encode('It’s a dangerous business, Frodo, going out your door.'),
  )
    .setProtectedHeader({ alg: 'ES256', jwk: pubjwk(t.context.key) })
    .sign(privateKey)
  t.context.tokenMissingJwk = await new FlattenedSign(
    encode('It’s a dangerous business, Frodo, going out your door.'),
  )
    .setProtectedHeader({ alg: 'ES256' })
    .sign(privateKey)
  t.context.tokenInvalidJWK = await new FlattenedSign(
    encode('It’s a dangerous business, Frodo, going out your door.'),
  )
    .setProtectedHeader({ alg: 'ES256', jwk: null })
    .sign(privateKey)
  t.context.tokenPrivateJWK = await new FlattenedSign(
    encode('It’s a dangerous business, Frodo, going out your door.'),
  )
    .setProtectedHeader({ alg: 'ES256', jwk: t.context.key })
    .sign(privateKey)
})

test('EmbeddedJWK', async (t) => {
  await t.notThrowsAsync(async () => {
    const { key: resolvedKey } = await flattenedVerify(t.context.token, EmbeddedJWK)
    t.truthy(resolvedKey)
    t.is(resolvedKey.type, 'public')
  })
})

test('EmbeddedJWK requires "jwk" to be an object', async (t) => {
  await t.throwsAsync(flattenedVerify(t.context.tokenMissingJwk, EmbeddedJWK), {
    code: 'ERR_JWS_INVALID',
    message: '"jwk" (JSON Web Key) Header Parameter must be a JSON object',
  })
  await t.throwsAsync(flattenedVerify(t.context.tokenInvalidJWK, EmbeddedJWK), {
    code: 'ERR_JWS_INVALID',
    message: '"jwk" (JSON Web Key) Header Parameter must be a JSON object',
  })
})

test('EmbeddedJWK requires "jwk" to be a public one', async (t) => {
  await t.throwsAsync(flattenedVerify(t.context.tokenPrivateJWK, EmbeddedJWK), {
    code: 'ERR_JWS_INVALID',
    message: '"jwk" (JSON Web Key) Header Parameter must be a public key',
  })
})
