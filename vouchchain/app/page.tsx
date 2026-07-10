"use client";

import { useState } from "react";
import SigningEngine from "./components/SigningEngine";

export default function Home() {
  // Create a reactive state placeholder to hold the custom user statement
  const [pactText, setPactText] = useState("");

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          VOUCHCHAIN
        </h1>
        <p className="text-zinc-500 text-sm font-medium">
          The Immutable Peer-to-Peer Truth Ledger
        </p>
      </div>

      <div className="w-full max-w-md mb-6">
        <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Define the Pact Statement
        </label>
        <textarea
          value={pactText}
          onChange={(e) => setPactText(e.target.value)}
          placeholder="e.g., Lucas benches 275 before August or owes Sarah a steak dinner..."
          className="w-full h-32 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-emerald-600 transition resize-none"
        />
      </div>
      
      {/* Hand the pactText state directly into the engine card */}
      <SigningEngine currentPactText={pactText} />
    </main>
  );
}