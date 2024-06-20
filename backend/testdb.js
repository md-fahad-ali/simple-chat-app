const CryptoJS = require("crypto-js");

jsonStr = '{"something":"else"}';
var encrypted = CryptoJS.AES.encrypt(jsonStr, "youngunicornsrunfree");
var decrypted = CryptoJS.AES.decrypt(
  "U2FsdGVkX18+mPBEyxfQp1PRe5bUvzO864PmKKkHMzSyAXr2Qe9bJKAbO/ZL/S8o",
  "youngunicornsrunfree"
);
console.log(decrypted.toString(CryptoJS.enc.Utf8));

var encrypted = CryptoJS.AES.encrypt(jsonStr, "youngunicornsrunfree");
console.log("We send this: " + encrypted.toString());
