// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// import {RSA} from 'hybrid-crypto-js'
import * as fs from 'node:fs'
const rsa: any = {}

export const generateKeyPair = async (name: string, pkBase64: boolean) => {
  // Generate 1024 bit RSA key pair
  const keyPair = await rsa.generateKeyPairAsync(1024) // Key size
  const {publicKey} = keyPair
  const {privateKey} = keyPair

  // Write files
  fs.writeFileSync(`${name}-public.key`, publicKey, 'utf8')
  fs.writeFileSync(`${name}-private.key`, privateKey, 'utf8')
  if (pkBase64) {
    const base64PK = Buffer.from(privateKey).toString('base64')
    fs.writeFileSync(`${name}-base64pk.key`, base64PK, 'utf8')
  }
}
