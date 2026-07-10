// data blueprint

export type PactType = {
  id: string;                // Transaction Hash/UUID
  date: string;              // Human-readable date
  user1: string;             // User A's Public Wallet Address
  user2: string;             // User B's Public Wallet Address
  user1Signature: string;    // Cryptographic signature from User A
  user2Signature?: string;   // Optional! (User B hasn't signed yet when URL is generated)
  createdAt: number;         // Unix timestamp
  updatedAt: number;         // Unix timestamp
  pact: string;              // The plain-text bet/agreement statement
  nonce: string;             // Prevent duplicate hash attacks -- random generated string for no copies
  chainId: number;           // Network safety lock
};