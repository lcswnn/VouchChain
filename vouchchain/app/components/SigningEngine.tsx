"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth";
import { generateContentHash } from "../utils/crypto";

interface SigningEngineProps {
  currentPactText: string;
  isViewerMode: boolean;
  urlCreatorAddress: string;
  urlCreatorSignature: string;
  onPactComplete: (payload: any, generatedId: string) => void;
}

export default function SigningEngine({ 
  currentPactText, 
  isViewerMode, 
  urlCreatorAddress, 
  urlCreatorSignature,
  onPactComplete
}: SigningEngineProps) {
  const { login, logout, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  
  const [generatedShareLink, setGeneratedShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [finalExecutionPayload, setFinalExecutionPayload] = useState<any | null>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedShareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard copy failure:", err);
    }
  };

  const handleSignPact = async () => {
    if (!currentPactText.trim()) return;
    const embeddedWallet = wallets[0];
    if (!embeddedWallet) return;

    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const signature = await provider.request({
        method: "personal_sign",
        params: [currentPactText, embeddedWallet.address],
      }) as string;
      
      if (!isViewerMode) {
        // --- USER 1 PATH: Generate Core Data Object & Compute CID Hash Locally ---
        const initialPayload = {
          pact: currentPactText,
          creator: embeddedWallet.address,
          signature: signature,
          timestamp: Date.now()
        };
        
        const ipfsCID = await generateContentHash(initialPayload);
        const encodedText = encodeURIComponent(currentPactText);
        
        // Build a sleek router string anchored by our deterministic decentralized ID
        const shareUrl = `${window.location.origin}?id=${ipfsCID}&pact=${encodedText}&user1=${embeddedWallet.address}&sig1=${signature}`;
        setGeneratedShareLink(shareUrl);
      } else {
        // --- USER 2 PATH: Complete Handshake receipt ---
        const compactPactReceipt = {
          pact: currentPactText,
          timestamp: Date.now(),
          creator: { address: urlCreatorAddress, signature: urlCreatorSignature },
          countersigner: { address: embeddedWallet.address, signature: signature }
        };
        
        const finalizedCID = await generateContentHash(compactPactReceipt);
        setFinalExecutionPayload(compactPactReceipt);
        onPactComplete(compactPactReceipt, finalizedCID);
      }
    } catch (error) {
      console.error("Signing sequence thrown:", error);
    }
  };

  return (
    <div className="w-full p-8 bg-zinc-900 border border-zinc-800 text-white rounded-xl shadow-xl space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        {isViewerMode ? "Step 2: Counter-Verification" : "VouchChain Engine"}
      </h2>
      
      {!authenticated ? (
        <button 
          onClick={login}
          className="w-full bg-white text-black font-semibold py-4 px-4 rounded-xl hover:bg-zinc-200 transition text-base shadow-md"
        >
          Log In / Sign Up to Review
        </button>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg text-sm space-y-2 text-zinc-400">
            <p>Your Account: <span className="text-zinc-200 font-mono">{user?.email?.address || user?.google?.email}</span></p>
            <p>Your Address: <span className="text-zinc-200 font-mono block truncate">{wallets[0]?.address}</span></p>
          </div>

          {isViewerMode && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-sm space-y-2 text-emerald-400">
              <p className="font-bold uppercase tracking-wider text-xs">Pact Initiated By:</p>
              <p className="font-mono block truncate text-zinc-300">{urlCreatorAddress}</p>
            </div>
          )}
          
          {!finalExecutionPayload && (
            <button 
              onClick={handleSignPact}
              className={`w-full font-bold py-4 px-4 rounded-xl transition shadow-lg text-base ${
                isViewerMode 
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" 
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
              }`}
            >
              {isViewerMode ? "Countersign & Accept Pact" : "Sign & Generate Link"}
            </button>
          )}

          {generatedShareLink && (
            <div className="pt-6 border-t border-zinc-800 space-y-3">
              <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider">
                Send this link to your friend:
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedShareLink}
                  className="flex-1 p-3 bg-zinc-950 text-zinc-400 border border-zinc-800 rounded-lg text-sm font-mono focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-5 font-semibold text-sm rounded-lg transition border shrink-0 ${
                    isCopied 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" 
                      : "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  {isCopied ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
            </div>
          )}

          {finalExecutionPayload && (
            <div className="pt-6 border-t border-emerald-900 space-y-2 text-center">
              <div className="text-emerald-500 font-bold text-base">🔒 Immutable Agreement Sealed</div>
              <p className="text-sm text-zinc-400">Both digital signatures have been bound to this message payload.</p>
            </div>
          )}

          <button 
            onClick={logout}
            className="w-full bg-zinc-800/40 text-zinc-400 font-medium py-2.5 px-4 rounded-xl hover:bg-zinc-800 transition text-sm"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}