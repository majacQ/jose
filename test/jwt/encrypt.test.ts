import anyTest, { type TestFn } from 'ava'
import timekeeper from 'timekeeper'
import { setters } from './time_setters.js'

import { EncryptJWT, compactDecrypt, jwtDecrypt } from '../../src/index.js'

const now = 1604416038

interface Context {
  secret: Uint8Array
  initializationVector: Uint8Array
  payload: Record<string, any>
}

const test = anyTest as TestFn<Context>

test.before(async (t) => {
  t.context.secret = new Uint8Array(16)
  t.context.initializationVector = new Uint8Array(12)
  t.context.payload = { 'urn:example:claim': true }

  timekeeper.freeze(new Date(now * 1000))
})

test.after(timekeeper.reset)

test('EncryptJWT', async (t) => {
  const jwt = await new EncryptJWT(t.context.payload)
    .setInitializationVector(t.context.initializationVector)
    .setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })
    .encrypt(t.context.secret)
  t.is(
    jwt,
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..AAAAAAAAAAAAAAAA.eKqvvA6MxuqSRbLVFIidFJb8x4lzPytWkoA.aglYAurAaFCoM8sCqaXSyw',
  )
})

test('EncryptJWT w/crit', async (t) => {
  const expected =
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIiwiY3JpdCI6WyJodHRwOi8vb3BlbmJhbmtpbmcub3JnLnVrL2lhdCJdLCJodHRwOi8vb3BlbmJhbmtpbmcub3JnLnVrL2lhdCI6MH0..AAAAAAAAAAAAAAAA.eKqvvA6MxuqSRbLVFIidFJb8x4lzPytWkoA.Kl-auiUImwUWk4X0xpxa8A'
  await t.throwsAsync(
    new EncryptJWT(t.context.payload)
      .setInitializationVector(t.context.initializationVector)
      .setProtectedHeader({
        alg: 'dir',
        enc: 'A128GCM',
        crit: ['http://openbanking.org.uk/iat'],
        'http://openbanking.org.uk/iat': 0,
      })
      .encrypt(t.context.secret),
    {
      code: 'ERR_JOSE_NOT_SUPPORTED',
      message: 'Extension Header Parameter "http://openbanking.org.uk/iat" is not recognized',
    },
  )

  await t.notThrowsAsync(async () => {
    const jwt = await new EncryptJWT(t.context.payload)
      .setInitializationVector(t.context.initializationVector)
      .setProtectedHeader({
        alg: 'dir',
        enc: 'A128GCM',
        crit: ['http://openbanking.org.uk/iat'],
        'http://openbanking.org.uk/iat': 0,
      })
      .encrypt(t.context.secret, { crit: { 'http://openbanking.org.uk/iat': true } })
    t.is(jwt, expected)
  })

  await t.throwsAsync(jwtDecrypt(expected, t.context.secret), {
    code: 'ERR_JOSE_NOT_SUPPORTED',
    message: 'Extension Header Parameter "http://openbanking.org.uk/iat" is not recognized',
  })
  await t.notThrowsAsync(
    jwtDecrypt(expected, t.context.secret, { crit: { 'http://openbanking.org.uk/iat': true } }),
  )
})

async function testJWTsetFunction(t, method, claim, value, duplicate = false, expected = value) {
  let enc = new EncryptJWT().setProtectedHeader({ alg: 'dir', enc: 'A128GCM' })[method](value)

  if (duplicate) {
    enc = enc[`replicate${method.slice(3)}AsHeader`]()
  }

  const jwt = await enc.encrypt(t.context.secret)

  const {
    plaintext,
    protectedHeader,
    key: resolvedKey,
  } = await compactDecrypt(jwt, async (header, token) => {
    t.true('alg' in header)
    t.true('enc' in header)
    t.is(header.alg, 'dir')
    t.is(header.enc, 'A128GCM')
    t.true('ciphertext' in token)
    t.true('iv' in token)
    t.true('protected' in token)
    t.true('tag' in token)
    return t.context.secret
  })
  t.is(resolvedKey, t.context.secret)
  const payload = JSON.parse(new TextDecoder().decode(plaintext))
  t.is(payload[claim], expected)
  if (duplicate) {
    t.true(claim in protectedHeader)
    t.is(protectedHeader[claim], expected)
  } else {
    t.false(claim in protectedHeader)
  }
}
testJWTsetFunction.title = (title, method, claim, value) =>
  `EncryptJWT.prototype.${method} called with ${
    value?.constructor?.name || typeof value
  } (${value}) ${title ? ` (${title})` : ''}`

for (const [method, claim, vectors] of setters(now)) {
  for (const [input, output = input] of vectors) {
    test(testJWTsetFunction, method, claim, input, false, output)
  }
}

test('duplicated', testJWTsetFunction, 'setIssuer', 'iss', 'urn:example:issuer', true)
test('duplicated', testJWTsetFunction, 'setSubject', 'sub', 'urn:example:subject', true)
test('duplicated', testJWTsetFunction, 'setAudience', 'aud', 'urn:example:audience', true)

test('EncryptJWT.prototype.setProtectedHeader', (t) => {
  t.throws(() => new EncryptJWT(t.context.payload).setProtectedHeader({}).setProtectedHeader({}), {
    instanceOf: TypeError,
    message: 'setProtectedHeader can only be called once',
  })
})

test('EncryptJWT.prototype.setContentEncryptionKey', (t) => {
  t.throws(
    () =>
      new EncryptJWT(t.context.payload)
        .setContentEncryptionKey(t.context.secret)
        .setContentEncryptionKey(t.context.secret),
    {
      instanceOf: TypeError,
      message: 'setContentEncryptionKey can only be called once',
    },
  )
})

test('EncryptJWT.prototype.setInitializationVector', (t) => {
  t.throws(
    () =>
      new EncryptJWT(t.context.payload)
        .setInitializationVector(t.context.initializationVector)
        .setInitializationVector(t.context.initializationVector),
    {
      instanceOf: TypeError,
      message: 'setInitializationVector can only be called once',
    },
  )
})
