/**
 * Compute SHA-256 digest for a given string message and return lowercase hex.
 */
export async function sha256(message) {
  const textBytes = new TextEncoder().encode(String(message));
  const hashBuffer = await crypto.subtle.digest("SHA-256", textBytes);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Generate a cryptographically strong random salt.
 * Returns a lowercase hex string of length byteLength*2.
 */
export function generateRandomSalt(byteLength = 16) {
  const saltBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(saltBytes);
  return bytesToHex(saltBytes);
}

/**
 * Derive a salted SHA-256 hash by hashing salt || message.
 * If saltHex is omitted, a new random salt will be generated.
 * Returns an object with both saltHex and hashHex so callers can store both.
 */
export async function deriveSaltedHash(message, saltHex) {
  const effectiveSaltHex = saltHex ?? generateRandomSalt(16);
  const saltBytes = hexToBytes(effectiveSaltHex);
  const messageBytes = new TextEncoder().encode(String(message));
  const combined = new Uint8Array(saltBytes.length + messageBytes.length);
  combined.set(saltBytes, 0);
  combined.set(messageBytes, saltBytes.length);
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const hashHex = bytesToHex(new Uint8Array(hashBuffer));
  return { saltHex: effectiveSaltHex, hashHex };
}

/**
 * Verify a message against a previously stored salted hash.
 */
export async function verifySaltedHash(message, saltHex, expectedHashHex) {
  const { hashHex } = await deriveSaltedHash(message, saltHex);
  return timingSafeEqual(hexToBytes(hashHex), hexToBytes(expectedHashHex));
}

/**
 * Encrypt a UTF-8 string using AES-GCM. Key is derived from password and salt via PBKDF2.
 * - If saltHex is omitted, a random salt will be generated.
 * - Returns cipherTextBase64, ivHex, and saltHex for storage/transmission.
 */
export async function encryptString(plainText, password, saltHex) {
  if (!password) throw new Error("encryptString: password is required");

  const effectiveSaltHex = saltHex ?? generateRandomSalt(16);
  const saltBytes = hexToBytes(effectiveSaltHex);
  const key = await deriveAesGcmKey(password, saltBytes);

  const ivBytes = new Uint8Array(12);
  crypto.getRandomValues(ivBytes);

  const encoded = new TextEncoder().encode(String(plainText));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    encoded
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const cipherTextBase64 = bytesToBase64(cipherBytes);
  return {
    cipherTextBase64,
    ivHex: bytesToHex(ivBytes),
    saltHex: effectiveSaltHex,
  };
}

/**
 * Decrypt a payload produced by encryptString using the same password.
 */
export async function decryptString(
  { cipherTextBase64, ivHex, saltHex },
  password
) {
  if (!password) throw new Error("decryptString: password is required");
  if (!cipherTextBase64 || !ivHex || !saltHex) {
    throw new Error(
      "decryptString: cipherTextBase64, ivHex, and saltHex are required"
    );
  }

  const saltBytes = hexToBytes(saltHex);
  const key = await deriveAesGcmKey(password, saltBytes);
  const ivBytes = hexToBytes(ivHex);
  const cipherBytes = base64ToBytes(cipherTextBase64);

  const plainBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    cipherBytes
  );
  return new TextDecoder().decode(new Uint8Array(plainBuffer));
}

// ---------------------
// Internal helpers
// ---------------------

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  if (typeof hex !== "string" || hex.length % 2 !== 0) {
    throw new Error("hexToBytes: input must be an even-length hex string");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa expects binary string
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

async function deriveAesGcmKey(password, saltBytes) {
  const passwordBytes = new TextEncoder().encode(String(password));
  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

export function isValidJson(data) {
  if (typeof data !== "string") {
    return false; // 非字串，無法解析
  }
  try {
    JSON.parse(data);
    return true;
  } catch (error) {
    return false;
  }
}
