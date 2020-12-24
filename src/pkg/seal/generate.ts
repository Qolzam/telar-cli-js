// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as fs from 'fs'
const RSA = require('hybrid-crypto-js').RSA

const rsa = new RSA({
  keySize: 4096,
})

export const generateKeyPair = async () => {
  // Generate 1024 bit RSA key pair
  const keyPair = await rsa.generateKeyPairAsync(1024) // Key size
  const publicKey = keyPair.publicKey
  const privateKey = keyPair.privateKey

  // Write files
  fs.writeFileSync('public.key', publicKey, 'utf8')
  fs.writeFileSync('private.key', privateKey, 'utf8')
  const base64PK = Buffer.from(privateKey).toString('base64')
  fs.writeFileSync('base64pk.key', base64PK, 'utf8')
}
