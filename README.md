ascii85.js
============================================
Introduction
------------
ASCII85 a.k.a. Base85 implementation in JavaScript

Methods
------------

### `encode(string text[, bool useEOD = true])`
Return ASCII85 encoded `string` of `text`.
Optionally enclose returned `string` to `<~` and `~>` chars when `useEOD` is true.

### `fromByteArray(Array byteArray[, bool useEOD = true])`
Return ASCII85 encoded `string` of `byteArray`.
Optionally enclose returned `string` to `<~` and `~>` chars when `useEOD` is true.

### `decode(string text)`
Return `string` of ASCII85 encoded `text`.

### `toByteArray(string text)`
Return `Uint8Array` of ASCII85 encoded `text`.

License
------------
MIT
