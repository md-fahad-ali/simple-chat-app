const express = require("express");
const router = express.Router();
var CryptoJS = require("crypto-js");

// // Encrypt

// // Decrypt
// var bytes  = CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
// var originalText = bytes.toString(CryptoJS.enc.Utf8);

// console.log(originalText); // 'my message'

function decrypt(transitmessage, pass) {
  const keyutf = CryptoJS.enc.Utf8.parse(pass);
  const iv = CryptoJS.enc.Utf8.parse("678025308de70905");
  const dec = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(transitmessage) },
    keyutf,
    {
      iv: iv,
    }
  );
  const decStr = CryptoJS.enc.Utf8.stringify(dec);
  console.log(decStr);
  return decStr;
}

router.post("/", function (req, res, next) {
  var decrypted = decrypt(req.body.data, process.env.SECRET_KEY);
  res.json({ data: decrypted });
});

module.exports = router;
