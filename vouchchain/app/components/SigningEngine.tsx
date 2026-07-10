"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";

// Define what arguments our engine expects to receive from page.tsx
interface SigningEngineProps {
  currentPactText: string;
}

export default function SigningEngine({ currentPactText }: SigningEngineProps) {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();

  const handleSignPact = async () => {
    // Safety check: Prevent signing empty text
    if (!currentPactText.trim()) {
      alert("Please type a pact statement into the textbox first!");
      return;
    }

    const embeddedWallet = wallets[0];
    if (!embeddedWallet) {
      alert("No wallet found. Please log in first.");
      return;
    }

    try {
      const provider = await embeddedWallet.getEthereumProvider();
      
      console.log(`Requesting cryptographic signature for: "${currentPactText}"`);
      
      // The typed text now dynamically powers the signature method!
      const signature = await provider.request({
        method: "personal_sign",
        params: [currentPactText, embeddedWallet.address],
      }) as string;
      
      console.log("✨ SUCCESS! Custom Signature generated:", signature);
      alert(`Pact successfully signed!\n\nSignature: ${signature.slice(0, 20)}...`);
      
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold tracking-tight">VouchChain Engine</h2>
      
      {!authenticated ? (
        <button 
          onClick={login}
          className="w-full bg-white text-black font-semibold py-2 px-4 rounded-xl hover:bg-zinc-200 transition"
        >
          Log In / Sign Up
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Logged in as: <span className="text-zinc-200 font-mono text-xs block truncate">{user?.email?.address || user?.google?.email || "User"}</span>
          </p>
          <p className="text-sm text-zinc-400">
            Wallet: <span className="text-zinc-200 font-mono text-xs block">{wallets[0]?.address.slice(0, 6)}...{wallets[0]?.address.slice(-4)}</span>
          </p>
          
          <button 
            onClick={handleSignPact}
            className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"
          >
            Sign Pact Statement
          </button>

          <button 
            onClick={logout}
            className="w-full bg-zinc-800 text-zinc-400 font-semibold py-2 px-4 rounded-xl hover:bg-zinc-700 transition text-xs"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}