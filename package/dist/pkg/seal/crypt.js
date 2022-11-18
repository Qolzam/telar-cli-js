"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.gePublictKey = exports.getPrivateKey = void 0;
const path = require("node:path");
const fs = require("fs-extra");
const Crypt = require('hybrid-crypto-js').Crypt;
/**
 * Initialize hybrid crypto
 * @returns {*} crypt object
 */
const init = () => {
    // Select AES or RSA standard
    const crypt = new Crypt({
        rsaStandard: 'RSA-OAEP',
    });
    return crypt;
};
const crypt = init();
/**
 * Get private key
 * @param {string} keyPath `private.key` file path
 * @returns {string} private key
 */
const getPrivateKey = function (keyPath = './private.key') {
    const publicKey = fs.readFileSync(path.resolve(keyPath), 'utf8');
    return publicKey;
};
exports.getPrivateKey = getPrivateKey;
/**
 * Get public key
 * @param {string} keyPath `public.key` file path
 * @returns {string} public key
 */
const gePublictKey = function (keyPath = './public.key') {
    const publicKey = fs.readFileSync(path.resolve(keyPath), 'utf8');
    return publicKey;
};
exports.gePublictKey = gePublictKey;
/**
 * Encrypt the message
 * @param {string} message the string value to encrypt
 * @param {string} publicKey the public key
 * @returns {string} encrypted base64
 */
const encrypt = function (message, publicKey) {
    const encrypted = crypt.encrypt(publicKey, message);
    const encryptedBase64 = Buffer.from(encrypted).toString('base64');
    return encryptedBase64;
};
exports.encrypt = encrypt;
/**
 * Decrypt the encryptedBase64
 * @param {string} encryptedBase64 the encrypted base64 value to decrypt
 * @param {string} privateKey the private key
 * @returns {string} decrypted value
 */
const decrypt = function (encryptedBase64, privateKey) {
    const decrypted = crypt.decrypt(privateKey, Buffer.from(encryptedBase64, 'base64').toString('ascii'));
    return decrypted.message;
};
exports.decrypt = decrypt;
