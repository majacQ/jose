# Interface: SignOptions

## [💗 Help the project](https://github.com/sponsors/panva)

Support from the community to continue maintaining and improving this module is welcome. If you find the module useful, please consider supporting the project by [becoming a sponsor](https://github.com/sponsors/panva).

JWS Signing options.

## Properties

### crit?

• `optional` **crit**: `object`

An object with keys representing recognized "crit" (Critical) Header Parameter names. The value
for those is either `true` or `false`. `true` when the Header Parameter MUST be integrity
protected, `false` when it's irrelevant.

This makes the "Extension Header Parameter "..." is not recognized" error go away.

Use this when a given JWS/JWT/JWE profile requires the use of proprietary non-registered "crit"
(Critical) Header Parameters. This will only make sure the Header Parameter is syntactically
correct when provided and that it is optionally integrity protected. It will not process the
Header Parameter in any way or reject the operation if it is missing. You MUST still verify the
Header Parameter was present and process it according to the profile's validation steps after
the operation succeeds.

The JWS extension Header Parameter `b64` is always recognized and processed properly. No other
registered Header Parameters that need this kind of default built-in treatment are currently
available.

#### Index Signature

 \[`propName`: `string`\]: `boolean`
