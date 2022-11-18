/**
 * Get private key
 * @param {string} keyPath `private.key` file path
 * @returns {string} private key
 */
export declare const getPrivateKey: (keyPath?: string) => string;
/**
 * Get public key
 * @param {string} keyPath `public.key` file path
 * @returns {string} public key
 */
export declare const gePublictKey: (keyPath?: string) => string;
/**
 * Encrypt the message
 * @param {string} message the string value to encrypt
 * @param {string} publicKey the public key
 * @returns {string} encrypted base64
 */
export declare const encrypt: (message: string, publicKey: string) => string;
/**
 * Decrypt the encryptedBase64
 * @param {string} encryptedBase64 the encrypted base64 value to decrypt
 * @param {string} privateKey the private key
 * @returns {string} decrypted value
 */
export declare const decrypt: (encryptedBase64: string, privateKey: string) => any;
