"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SigningEngine from "./components/SigningEngine";

function PactManagerContent() {
  const searchParams = useSearchParams();
  
  // State elements
  const [pactText, setPactText] = useState("");
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [urlCreatorAddress, setUrlCreatorAddress] = useState("");
  const [urlCreatorSignature, setUrlCreatorSignature] = useState("");

  // Check the URL parameters on load to see if this is a shared link
  useEffect(() => {
    const encodedPact = searchParams.get("pact");
    const creator = searchParams.get("user1");
    const signature = searchParams.get("sig1");

    if (encodedPact && creator && signature) {
      setPactText(decodeURIComponent(encodedPact));
      setUrlCreatorAddress(creator);
      setUrlCreatorSignature(signature);
      setIsViewerMode(true); // Put the page into review/countersign mode
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          VOUCHCHAIN
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          {isViewerMode ? "Review & Countersign This Pact" : "The Immutable Peer-to-Peer Truth Ledger"}
        </p>
      </div>

      <div className="w-full max-w-md mb-6">
        <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
          {isViewerMode ? "Locked Pact Statement" : "Define the Pact Statement"}
        </label>
        
        <textarea
          value={pactText}
          onChange={(e) => setPactText(e.target.value)}
          disabled={isViewerMode} // Lock text if User 2 is viewing it
          placeholder="e.g., Lucas benches 275 before August or owes Sarah a steak dinner..."
          className={`w-full h-32 p-4 bg-zinc-950 border rounded-xl text-white placeholder-zinc-700 text-sm focus:outline-none transition resize-none ${
            isViewerMode ? "border-zinc-700 text-zinc-400 cursor-not-allowed bg-zinc-950/50" : "border-zinc-800 focus:border-emerald-600"
          }`}
        />
      </div>
      
      {/* Hand all data tracking points down into the execution card */}
      <SigningEngine 
        currentPactText={pactText} 
        isViewerMode={isViewerMode}
        urlCreatorAddress={urlCreatorAddress}
        urlCreatorSignature={urlCreatorSignature}
      />
    </main>
  );
}

// Next.js App Router requires searchParams hooks to be wrapped in a Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<div className="text-white text-center min-h-screen bg-black flex items-center justify-center">Loading Ledger...</div>}>
      <PactManagerContent />
    </Suspense>
  );
}