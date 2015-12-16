'use strict';

var forge = require('node-forge'),
    CIPHER_IV = 'l1n}.Bml@FJ?t7](ov<X';

module.exports = {
    encrypt: function(password, salt, unencryptedString) {
        var key = forge.pkcs5.pbkdf2(password, salt, 16, 16);

        // encrypt some bytes using GCM mode
        var cipher = forge.cipher.createCipher('AES-GCM', key);
        cipher.start({
            iv: CIPHER_IV, // should be a 12-byte binary-encoded string or byte buffer
            tagLength: 128 // optional, defaults to 128 bits
        });
        cipher.update(forge.util.createBuffer(unencryptedString));
        cipher.finish();
        var encrypted = cipher.output;
        var tag = cipher.mode.tag;

        return {
            'encryptedHex': encrypted.toHex(),
            'tagHex': tag.toHex()
        };
    },

    decrypt: function(password, salt, tagHex, encryptedHex) {
        var key = forge.pkcs5.pbkdf2(password, salt, 16, 16);

        // decrypt some bytes using GCM mode
        var decipher = forge.cipher.createDecipher('AES-GCM', key);
        decipher.start({
            iv: CIPHER_IV,
            tagLength: 128, // optional, defaults to 128 bits
            tag: forge.util.createBuffer(forge.util.hexToBytes(tagHex)) // authentication tag from Cipher
        });
        decipher.update(forge.util.createBuffer(forge.util.hexToBytes(encryptedHex)));
        var pass = decipher.finish();
        // pass is false if there was a failure (eg: authentication tag didn't match)
        if (!pass) {
            throw('Unable to decrypt data');
        }

        return decipher.output.data;
    }
};
