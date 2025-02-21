# Interface: DecryptOptions

[types](../modules/types.md).DecryptOptions

JWE Decryption options.

## Hierarchy

* [*CritOption*](types.critoption.md)

  ↳ **DecryptOptions**

  ↳↳ [*JWTDecryptOptions*](jwt_decrypt.jwtdecryptoptions.md)

## Table of contents

### Properties

- [contentEncryptionAlgorithms](types.decryptoptions.md#contentencryptionalgorithms)
- [crit](types.decryptoptions.md#crit)
- [inflateRaw](types.decryptoptions.md#inflateraw)
- [keyManagementAlgorithms](types.decryptoptions.md#keymanagementalgorithms)

## Properties

### contentEncryptionAlgorithms

• `Optional` **contentEncryptionAlgorithms**: *string*[]

A list of accepted JWE "enc" (Encryption Algorithm) Header Parameter values.
By default all "enc" (Encryption Algorithm) values applicable for the used
key/secret are allowed.

Defined in: [types.d.ts:450](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L450)

___

### crit

• `Optional` **crit**: *object*

An object with keys representing recognized "crit" (Critical) Header Parameter
names. The value for those is either `true` or `false`. `true` when the
Header Parameter MUST be integrity protected, `false` when it's irrelevant.

This makes the "Extension Header Parameter "${parameter}" is not recognized"
error go away.

Use this when a given JWS/JWT/JWE profile requires the use of proprietary
non-registered "crit" (Critical) Header Parameters. This will only make sure
the Header Parameter is syntactically correct when provided and that it is
optionally integrity protected. It will not process the Header Parameter in
any way or reject if the operation if it is missing. You MUST still
verify the Header Parameter was present and process it according to the
profile's validation steps after the operation succeeds.

The JWS extension Header Parameter `b64` is always recognized and processed
properly. No other registered Header Parameters that need this kind of
default built-in treatment are currently available.

#### Type declaration:

Inherited from: [CritOption](types.critoption.md).[crit](types.critoption.md#crit)

Defined in: [types.d.ts:431](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L431)

___

### inflateRaw

• `Optional` **inflateRaw**: [*InflateFunction*](types.inflatefunction.md)

In a browser runtime you have to provide an implementation for Inflate Raw
when you expect JWEs with compressed plaintext.

Defined in: [types.d.ts:456](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L456)

___

### keyManagementAlgorithms

• `Optional` **keyManagementAlgorithms**: *string*[]

A list of accepted JWE "alg" (Algorithm) Header Parameter values.

Defined in: [types.d.ts:443](https://github.com/panva/jose/blob/v3.11.5/src/types.d.ts#L443)
