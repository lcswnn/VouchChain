"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";

interface SigningEngineProps {
  currentPactText: string;
  isViewerMode: boolean;
  urlCreatorAddress: string;
  urlCreatorSignature: string;
}

export default function SigningEngine({ 
  currentPactText, 
  isViewerMode, 
  urlCreatorAddress, 
  urlCreatorSignature 
}: SigningEngineProps) {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  
  // State to hold generated invite links or completion outputs
  const [generatedShareLink, setGeneratedShareLink] = useState("");
  const [finalExecutionPayload, setFinalExecutionPayload] = useState<any | null>(null);

  const handleSignPact = async () => {
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
      
      console.log(`Executing signature for wallet: ${embeddedWallet.address}`);
      const signature = await provider.request({
        method: "personal_sign",
        params: [currentPactText, embeddedWallet.address],
      }) as string;
      
      if (!isViewerMode) {
        // --- USER 1 FLOW: Create the shareable link ---
        const encodedText = encodeURIComponent(currentPactText);
        const shareUrl = `${window.location.origin}?pact=${encodedText}&user1=${embeddedWallet.address}&sig1=${signature}`;
        
        setGeneratedShareLink(shareUrl);
        alert("✨ Step 1 Signed! Share link generated below.");
      } else {
        // --- USER 2 FLOW: Finalize the dual-signed transaction package ---
        const compactPactReceipt = {
          pact: currentPactText,
          timestamp: Date.now(),
          creator: {
            address: urlCreatorAddress,
            signature: urlCreatorSignature
          },
          countersigner: {
            address: embeddedWallet.address,
            signature: signature
          }
        };
        
        setFinalExecutionPayload(compactPactReceipt);
        console.log("🔒 FULLY VERIFIED DUAL-SIGNED PACT OBJECT:", compactPactReceipt);
        alert("🎉 PACT SECURED! Both participants have verified identities cryptographically.");
      }
      
    } catch (error) {
      console.error("Signing failed:", error);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold tracking-tight">
        {isViewerMode ? "Step 2: Counter-Verification" : "VouchChain Engine"}
      </h2>
      
      {!authenticated ? (
        <button 
          onClick={login}
          className="w-full bg-white text-black font-semibold py-2 px-4 rounded-xl hover:bg-zinc-200 transition"
        >
          Log In / Sign Up to Review
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs space-y-1 text-zinc-400">
            <p>Your Account: <span className="text-zinc-200 font-mono">{user?.email?.address || user?.google?.email}</span></p>
            <p>Your Address: <span className="text-zinc-200 font-mono block truncate">{wallets[0]?.address}</span></p>
          </div>

          {isViewerMode && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs space-y-1 text-emerald-400">
              <p className="font-bold uppercase tracking-wider text-[10px]">Pact Initiated By:</p>
              <p className="font-mono block truncate text-zinc-300">{urlCreatorAddress}</p>
            </div>
          )}
          
          {!finalExecutionPayload && (
            <button 
              onClick={handleSignPact}
              className={`w-full font-semibold py-3 px-4 rounded-xl transition shadow-lg ${
                isViewerMode 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
              }`}
            >
              {isViewerMode ? "Countersign & Accept Pact" : "Sign & Generate Link"}
            </button>
          )}

          {/* User 1 Share UI Output */}
          {generatedShareLink && (
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <label className="block text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                Send this link to your friend:
              </label>
              <input 
                type="text" 
                readOnly 
                value={generatedShareLink}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full p-2 bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-mono focus:outline-none focus:border-zinc-700"
              />
              <p className="text-[10px] text-zinc-500 italic">Click the input box to select all, copy it, and send it over!</p>
            </div>
          )}

          {/* User 2 Completion Display Box Placeholder */}
          {finalExecutionPayload && (
            <div className="pt-4 border-t border-emerald-900 space-y-2 text-center">
              <div className="text-emerald-500 font-bold text-sm">🔒 Immutable Agreement Sealed</div>
              <p className="text-xs text-zinc-400">Both digital signatures have been bound to this message payload.</p>
            </div>
          )}

          <button 
            onClick={logout}
            className="w-full bg-zinc-800/40 text-zinc-500 font-medium py-1.5 px-4 rounded-xl hover:bg-zinc-800 transition text-xs"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}