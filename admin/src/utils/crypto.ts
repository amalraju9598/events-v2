/**
 * Decrypts AES-256-CBC encrypted text using the browser's native Web Crypto API.
 * The encrypted text must be in the format 'hex(iv):hex(ciphertext)'.
 * The key is derived by hashing the keyString with SHA-256.
 */
export async function decryptData(encryptedText: string, keyString: string): Promise<string> {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, encryptedHex] = parts;

  // Convert hex strings to Uint8Array
  const iv = hexToUint8Array(ivHex);
  const encryptedBytes = hexToUint8Array(encryptedHex);

  // Hash keyString to 32 bytes using SHA-256
  const encoder = new TextEncoder();
  const keyBuffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(keyString));

  // Import raw key for AES-CBC
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  // Decrypt
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encryptedBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}

function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) {
    return new Uint8Array(0);
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
}
