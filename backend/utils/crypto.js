const Cryptr = require("cryptr");
const cryptr = new Cryptr(process.env.SECRET_KEY);

const encryptMessage = (message) => {
  encryptedString = cryptr.encrypt(message);

  console.log("We send this: " + encryptedString);
  return encryptedString;
};

module.exports = { encryptMessage };
