// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const path = require('path')
const fs = require('fs')
const Crypt = require('hybrid-crypto-js').Crypt

// Select AES or RSA standard
const crypt = new Crypt({
  md: 'sha256',
  // Default AES standard is AES-CBC. Options are:
  // AES-ECB, AES-CBC, AES-CFB, AES-OFB, AES-CTR, AES-GCM, 3DES-ECB, 3DES-CBC, DES-ECB, DES-CBC
  aesStandard: 'AES-GCM',
  // Default RSA standard is RSA-OAEP. Options are:
  // RSA-OAEP, RSAES-PKCS1-V1_5
  rsaStandard: 'RSA-OAEP',
})

const message = 'Hello world!'

const publicKey = fs.readFileSync(path.resolve('./public.key'), 'utf8')

const encrypted = crypt.encrypt(publicKey, message)

const encryptedBase64 = Buffer.from(encrypted).toString('base64')

const privateKey = fs.readFileSync(path.resolve('./private.key'), 'utf8')
const decrypted = crypt.decrypt(privateKey, Buffer.from(encryptedBase64, 'base64').toString('ascii'))
// eslint-disable-next-line no-console
console.log(decrypted.message)
