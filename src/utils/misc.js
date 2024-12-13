export async function sha256(message) {
  // 將字符串轉換為 Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // 使用 SubtleCrypto 進行 SHA-256 加密
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);

  // 將 Hash 轉換為十六進制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");

  return hashHex;
}
