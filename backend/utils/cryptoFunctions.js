import crypto from 'crypto';
import getPrismaInstance from "../utils/PrismaClient.js";
import dotenv from "dotenv";

dotenv.config();

export function generateRSAKeyPair(){
  return crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem'},
      privateKeyEncoding : {type: 'pkcs8', format : 'pem'}
  });
}

export async function encryptPrivateKey(privateKey, encryptionKey) {
  // Convert private key to string
  const privateKeyString = privateKey.toString('utf-8');

  // Generate IV
  const iv = crypto.randomBytes(16); //= 128 bits
  const ivBase64 = iv.toString('base64');

  // Create AES cipher using encryption key and IV
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

  // Encrypt private key
  let encryptedPrivateKey = cipher.update(privateKeyString, 'utf-8', 'base64');
  encryptedPrivateKey += cipher.final('base64');

  return { encryptedPrivateKey, iv };
}

export async function fetchPublicKey(userId) {
  try {
    // Fetch the user's public key from the database
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.publicKey) {
      throw new Error("User or public key not found");
    }

    // Fetch the most recent message sent to the user
    const message = await prisma.messages.findFirst({
      where: { recieverId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // If no message is found, return a default IV
    if (!message) {
      return {
        publicKey: user.publicKey,
        iv: "e1246088a524b7035f4b61e7535f00e2", // Replace this with your default IV value
      };
    }

    // Return the public key and IV
    return {
      publicKey: user.publicKey,
      iv: message.iv,
    };
  } catch (error) {
    console.error("Error fetching public key:", error);
    throw error;
  }
}

export async function fetchPrivateKey(userId) {
  try {
    const iv = crypto.randomBytes(16); //= 128 bits
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const message = await prisma.messages.findFirst({
      where: { recieverId: userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!user || !message) {
      throw new Error("User or message not found");
    }

    const ivBuffer = Buffer.from(message.iv, 'base64');

    console.log("from fetchPrivateKey");
    console.log("message.encryptedAESKey", message.encryptedAESKey);
    console.log("ivBuffer", ivBuffer);
    console.log("user.encryptedPrivateKey", user.encryptedPrivateKey);

    const encryptedKeyBuffer = Buffer.from(message.encryptedAESKey, 'base64');

    const decryptedAESKey = await decryptAESKeyWithRSA(encryptedKeyBuffer, {
      encryptedPrivateKey: user.encryptedPrivateKey,
      iv: ivBuffer,
    });
     console.log("decryptedAESKey from fetchPrivateKey", decryptedAESKey);
    return {
      encryptedPrivateKey: user.encryptedPrivateKey,
      privateKey: decryptedAESKey
    };
  } catch(error) {
    if (error instanceof RangeError) {
      console.error('Invalid key length. Retrying with a new key...(cryptoFunctions)');
      // Implement retry mechanism or fallback behavior here
      // For example, generate a new key and retry the decryption process
    } else {
      console.log("Error fetching private key", error);
      throw error;
    }
  }
}


export function generateAESKey() {
  const aesKey = crypto.randomBytes(32); // 256-bit AES key
  return aesKey;
}

export function encryptWithAES(plaintext, aesKey, iv) {
  // const iv = crypto.randomBytes(16);
  const cipher  = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encryptedData = cipher.update(plaintext, 'utf-8', 'base64');
  encryptedData += cipher.final('base64');
  // return {encryptedData, iv};
  return encryptedData;
}

export async function encryptAESKeyWithRSA(recipientId, aesKey) {
  try {
    // Fetch the recipient's public key
    const recipientPublicKeyInfo = await fetchPublicKey(recipientId);

    // Convert the public key to the appropriate format
    const recipientPublicKey = Buffer.from(recipientPublicKeyInfo.publicKey, 'utf-8');

    // Encrypt the AES key using recipient's RSA public key
    const encryptedAESKey = crypto.publicEncrypt({
      key: recipientPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
    }, aesKey);

    return encryptedAESKey.toString('base64');
  } catch (error) {
    console.error("Error encrypting AES key with RSA:", error);
    throw error;
  }
}


export async function decryptAESKeyWithRSA(encryptedAESKey, privateKeyInfo) {
  if (!privateKeyInfo || !privateKeyInfo.encryptedPrivateKey) {
    throw new Error('Missing or invalid privateKeyInfo');
  }

  try {
    if (!encryptedAESKey) {
      throw new Error('Missing parameter: encryptedAESKey');
    }

    if (!privateKeyInfo.encryptedPrivateKey) {
      throw new Error('Missing parameter: privateKeyInfo.encryptedPrivateKey');
    }

    if (!privateKeyInfo.iv) {
      throw new Error('Missing parameter: privateKeyInfo.iv');
    }
    const keyBuffer = crypto.randomBytes(32);
    // const keyBuffer = Buffer.from(process.env.PRIVATE_KEY_ENCRYPTION_KEY, 'utf8');
    if (keyBuffer.length !== 32) {
      throw new Error('Invalid AES key length. Must be 32 bytes.');
    }

    // const key = Buffer.from(process.env.PRIVATE_KEY_ENCRYPTION_KEY, 'utf8');
    const ivBuffer = Buffer.from(privateKeyInfo.iv, 'base64');

    console.log('decryptAESKeyWithRSA input:');
    console.log('encryptedAESKey:', encryptedAESKey);
    console.log('privateKeyInfo.encryptedPrivateKey:', privateKeyInfo.encryptedPrivateKey);
    console.log('privateKeyInfo.iv:', privateKeyInfo.iv);


    const privateKey = await decryptWithAES(
      privateKeyInfo.encryptedPrivateKey,
      ivBuffer,
      keyBuffer,
    );

    const privateKeyBuffer = Buffer.from(privateKey, 'utf-8');

    console.log('Decrypted private key:', privateKey);

    const decryptedAESKey = await crypto.privateDecrypt(
      {
        key: privateKeyBuffer,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
        iv: ivBuffer,
      },
      Buffer.from(encryptedAESKey, 'base64')
    );

    console.log('Decrypted AES key:', decryptedAESKey);
    return decryptedAESKey;
  } catch (error) {
    if (error instanceof RangeError) {
      console.error('Invalid key length. Retrying with a new key...');
      // Implement retry mechanism or fallback behavior here
    } else {
      console.error("Error decrypting AES key with RSA:", error);
      throw error;
    }
  }
}

export function decryptWithAES(encryptedData, ivBuffer, keyBuffer) {
  console.log("Key: ", keyBuffer);

  // Add key length validation
  if (!Buffer.isBuffer(keyBuffer)) {
    throw new Error('Key must be a Buffer');
  }

  if (keyBuffer.length !== 32) {
    throw new Error('Invalid AES key length. Must be 32 bytes.');
  }

  try {
    if (Buffer.isBuffer(ivBuffer)) {
      if (ivBuffer.length !== 16) {
        throw new Error('Invalid IV length. IV must be 16 bytes long.');
      }
    } else {
      throw new Error('Invalid IV format. IV must be a Buffer.');
    }

    console.log('Key:', keyBuffer);
    console.log('IV:', ivBuffer);
    console.log('Ciphertext:', encryptedData);

    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    console.log('decipher:', decipher);

    // let decryptedData = decipher.update(Buffer.from(encryptedData, 'base64'), 'base64', 'utf-8');
    let decryptedData = decipher.update(encryptedData, 'base64', 'utf8');
    decryptedData += decipher.final('utf-8');

    return decryptedData;
  } catch (error) {
    console.error('Error decrypting data with AES:', error);
    throw error;
  }
}

export function generateHMAC(message, hmacKey) {
  let messageBuffer;

  // Check if message is already a Buffer
  if (Buffer.isBuffer(message)) {
    messageBuffer = message;
  } else if (typeof message === 'string') {
    // Convert message to Buffer
    messageBuffer = Buffer.from(message, 'utf-8');
  } else if (typeof message === 'object' && message.hasOwnProperty('encryptedData')) {
    // If message is an object with 'encryptedData' property, use it as the message
    messageBuffer = Buffer.from(message.encryptedData, 'base64');
  } else {
    throw new TypeError('Message must be a string, a Buffer, or an object with "encryptedData" property.');
  }

  const hmac = crypto.createHmac('sha256', hmacKey);

  // Update with message Buffer 
  hmac.update(messageBuffer);

  return hmac.digest('hex'); 
}
export function verifyHMAC(message, hmac, hmacKey) {
  const generatedHMAC = generateHMAC(message, hmacKey);
  return hmac === generatedHMAC;
}


export async function decryptMessageEndpoint(encryptedMessage) {
  try {
    let encryptedData;
    let ivBuffer;

    if (typeof encryptedMessage === 'string') {
      // Parse the JSON string to extract encrypted data and IV
      const messageObj = JSON.parse(encryptedMessage);
      encryptedData = Buffer.from(messageObj.encryptedData, 'base64');
      ivBuffer = Buffer.from(messageObj.iv.data);
    } else if (Buffer.isBuffer(encryptedMessage)) {
      // Assume the encrypted message is already in the correct format
      const messageObj = JSON.parse(encryptedMessage.toString());
      encryptedData = Buffer.from(messageObj.encryptedData, 'base64');
      ivBuffer = Buffer.from(messageObj.iv.data);
    } else {
      throw new TypeError('encryptedMessage must be a string or a Buffer.');
    }

    // Decrypt the message using the encrypted data and IV
    const response = await axios.post('/api/decryptMessage', { encryptedData: encryptedData.toString('base64'), iv: ivBuffer });
    // const response = await axios.post('/api/decryptMessage', { encryptedData, iv: ivBuffer });
    const decryptedData = JSON.parse(response.data.decryptedMessage);
    return decryptedData;
  } catch (error) {
    throw new Error('Error decrypting message:', error);
  }
}
