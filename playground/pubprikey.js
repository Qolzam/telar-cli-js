// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const fs = require('fs')
const crypto = require('crypto')

const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
})

fs.writeFile('public.key', publicKey, 'utf8', error => {
  // eslint-disable-next-line no-console
  console.log(error)
})
fs.writeFile('private.key', privateKey, 'utf8', error => {
  // eslint-disable-next-line no-console
  console.log(error)
})
