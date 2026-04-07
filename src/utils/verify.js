const nacl = require("tweetnacl");

function verify(rawBody, signature, timestamp, publicKey) {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );
}

module.exports = { verify };
