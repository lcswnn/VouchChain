export async function generateContentHash(payload: any): Promise<string> {
  // Sort keys deterministically so identical data always produces the exact same hash
  const serialized = JSON.stringify(payload, Object.keys(payload).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return a mock IPFS-style CID v1 format string for our URL routing
  return `bafkrei${hashHex.substring(0, 49)}`;
}