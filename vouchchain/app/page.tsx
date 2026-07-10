"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyMessage } from "viem";
import SigningEngine from "./components/SigningEngine";

function PactManagerContent() {
  const searchParams = useSearchParams();
  
  // App states
  const [pactText, setPactText] = useState("");
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [urlCreatorAddress, setUrlCreatorAddress] = useState("");
  const [urlCreatorSignature, setUrlCreatorSignature] = useState("");
  
  const [finalReceipt, setFinalReceipt] = useState<any | null>(null);
  const [pactHistory, setPactHistory] = useState<any[]>([]);

  // Verification states
  const [isUser1Valid, setIsUser1Valid] = useState<boolean | null>(null);
  const [isUser2Valid, setIsUser2Valid] = useState<boolean | null>(null);

  // Load ledger items from localStorage
  useEffect(() => {
    const savedPacts = localStorage.getItem("vouchchain_history");
    if (savedPacts) {
      try {
        setPactHistory(JSON.parse(savedPacts));
      } catch (e) {
        console.error("Failed to parse local ledger history", e);
      }
    }
  }, []);

  // Parse incoming sharing parameters
  useEffect(() => {
    const encodedPact = searchParams.get("pact");
    const creator = searchParams.get("user1");
    const signature = searchParams.get("sig1");

    if (encodedPact && creator && signature) {
      setPactText(decodeURIComponent(encodedPact));
      setUrlCreatorAddress(creator);
      setUrlCreatorSignature(signature);
      setIsViewerMode(true);
    }
  }, [searchParams]);

  // Run cryptographic signature validation math on load or state shift
  useEffect(() => {
    if (!finalReceipt) {
      setIsUser1Valid(null);
      setIsUser2Valid(null);
      return;
    }

    const checkSignatures = async () => {
      try {
        // Mathematically verify User 1's signature hash against the text
        const valid1 = await verifyMessage({
          address: finalReceipt.creator.address,
          message: finalReceipt.pact,
          signature: finalReceipt.creator.signature,
        });
        setIsUser1Valid(valid1);

        // Mathematically verify User 2's signature hash against the text
        const valid2 = await verifyMessage({
          address: finalReceipt.countersigner.address,
          message: finalReceipt.pact,
          signature: finalReceipt.countersigner.signature,
        });
        setIsUser2Valid(valid2);
      } catch (err) {
        console.error("Crypto signature verification execution failure", err);
        setIsUser1Valid(false);
        setIsUser2Valid(false);
      }
    };

    checkSignatures();
  }, [finalReceipt]);

  const handlePactComplete = (payload: any) => {
    setFinalReceipt(payload);

    const newHistoryItem = {
      id: `pact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date(payload.timestamp).toLocaleDateString(),
      pact: payload.pact,
      user1: payload.creator.address,
      user2: payload.countersigner.address,
      user1Signature: payload.creator.signature,
      user2Signature: payload.countersigner.signature,
      createdAt: payload.timestamp,
      updatedAt: payload.timestamp,
      nonce: Math.random().toString(36).substring(2, 15),
      chainId: 1
    };

    const updatedHistory = [newHistoryItem, ...pactHistory];
    setPactHistory(updatedHistory);
    localStorage.setItem("vouchchain_history", JSON.stringify(updatedHistory));
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-start p-6 pt-24 selection:bg-emerald-500/30">
      <div className="text-center mb-10 space-y-3">
        <h1 className="text-6xl font-black tracking-tighter text-white">
          VOUCHCHAIN
        </h1>
        <p className="text-zinc-400 text-lg font-medium tracking-wide">
          {finalReceipt 
            ? "🔒 Cryptographically Sealed Agreement" 
            : isViewerMode 
              ? "Review & Countersign This Pact" 
              : "The Immutable Peer-to-Peer Truth Ledger"}
        </p>
      </div>

      <div className="w-full max-w-xl space-y-8">
        
        {/* --- CONDITION A: DUAL SIGNATURE CRYPTO RECEIPT --- */}
        {finalReceipt ? (
          <div className="p-8 bg-zinc-950 border border-emerald-500/20 rounded-2xl space-y-8 text-white shadow-2xl">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-500">Verified Agreement Statement</span>
              <p className="text-xl font-medium text-zinc-100 bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/50 italic leading-relaxed">
                "{finalReceipt.pact}"
              </p>
            </div>

            <div className="space-y-5 border-t border-zinc-900 pt-6 text-sm">
              {/* User 1 Verified Block */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Initiator Address</span>
                  <span className={`font-mono text-xs ${isUser1Valid ? "text-emerald-400" : isUser1Valid === false ? "text-rose-500" : "text-zinc-500"}`}>
                    {isUser1Valid ? "✓ math verified" : isUser1Valid === false ? "✕ verification failed" : "checking math..."}
                  </span>
                </div>
                <p className="font-mono bg-zinc-900 p-3 rounded-lg text-zinc-300 text-sm truncate">{finalReceipt.creator.address}</p>
                <p className="font-mono text-[11px] text-zinc-600 truncate">Sig: {finalReceipt.creator.signature}</p>
              </div>

              {/* User 2 Verified Block */}
              <div className="space-y-2 pt-3 border-t border-zinc-900/60">
                <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <span>Countersigner Address</span>
                  <span className={`font-mono text-xs ${isUser2Valid ? "text-emerald-400" : isUser2Valid === false ? "text-rose-500" : "text-zinc-500"}`}>
                    {isUser2Valid ? "✓ math verified" : isUser2Valid === false ? "✕ verification failed" : "checking math..."}
                  </span>
                </div>
                <p className="font-mono bg-zinc-900 p-3 rounded-lg text-zinc-300 text-sm truncate">{finalReceipt.countersigner.address}</p>
                <p className="font-mono text-[11px] text-zinc-600 truncate">Sig: {finalReceipt.countersigner.signature}</p>
              </div>
            </div>

            <button 
              onClick={() => setFinalReceipt(null)} 
              className="w-full bg-zinc-900 text-zinc-300 py-3 rounded-xl text-sm hover:bg-zinc-800 font-semibold border border-zinc-800 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        ) : (
          // --- CONDITION B: INTERACTIVE WORKFLOW ---
          <>
            <div className="space-y-3">
              <label className="block text-zinc-400 text-sm font-bold uppercase tracking-wider">
                {isViewerMode ? "Locked Pact Statement" : "Define the Pact Statement"}
              </label>
              <textarea
                value={pactText}
                onChange={(e) => setPactText(e.target.value)}
                disabled={isViewerMode}
                placeholder="e.g., Lucas benches 275 before August or owes Sarah a steak dinner..."
                className={`w-full h-28 p-5 bg-zinc-950 border rounded-xl text-white placeholder-zinc-700 text-base focus:outline-none transition resize-none leading-relaxed ${
                  isViewerMode 
                    ? "border-zinc-800 text-zinc-400 cursor-not-allowed bg-zinc-950/30" 
                    : "border-zinc-800 focus:border-emerald-600"
                }`}
              />
            </div>
            
            <SigningEngine 
              currentPactText={pactText} 
              isViewerMode={isViewerMode}
              urlCreatorAddress={urlCreatorAddress}
              urlCreatorSignature={urlCreatorSignature}
              onPactComplete={handlePactComplete}
            />
          </>
        )}

        {/* --- GLOBAL SECTION: HISTORICAL LEDGER TIMELINE --- */}
        {!isViewerMode && pactHistory.length > 0 && (
          <div className="pt-8 border-t border-zinc-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Past Pacts Ledger ({pactHistory.length})
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {pactHistory.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setFinalReceipt({
                    pact: item.pact,
                    timestamp: item.createdAt,
                    creator: { address: item.user1, signature: item.user1Signature },
                    countersigner: { address: item.user2, signature: item.user2Signature }
                  })}
                  className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-zinc-700 transition cursor-pointer text-left flex flex-col justify-between space-y-3 group"
                >
                  <p className="text-sm text-zinc-300 font-medium line-clamp-2 group-hover:text-white transition leading-relaxed">
                    "{item.pact}"
                  </p>
                  <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                    <span>{item.date}</span>
                    <span className="text-emerald-500 text-[10px] uppercase tracking-wider font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                      Sealed 🔒
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-white text-center min-h-screen bg-black flex items-center justify-center text-xl">Loading Ledger...</div>}>
      <PactManagerContent />
    </Suspense>
  );
}