import React from "react";
import { enableWallet, getWalletInfo, WalletAPI } from "../services/cardano";

export default function WalletConnect(props: {
  onConnected: (api: WalletAPI, info: any) => void;
}) {
  const [api, setApi] = React.useState<WalletAPI | null>(null);
  const [info, setInfo] = React.useState<any>(null);
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const connect = async () => {
    try {
      setError("");
      setLoading(true);

      console.log("🔍 Attempting wallet connection...");
      console.log(
        "🔍 WalletConnect component mounted and connect function called"
      );

      // Try multiple times with different approaches
      let w = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!w && attempts < maxAttempts) {
        attempts++;
        console.log(`Wallet connection attempt ${attempts}/${maxAttempts}`);

        try {
          w = await enableWallet();
          if (w) {
            console.log("Wallet enabled successfully");
            break;
          }
        } catch (error) {
          console.log(`Attempt ${attempts} failed:`, error);
          if (attempts < maxAttempts) {
            console.log(`Waiting 2 seconds before retry...`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }
      }

      if (!w) {
        setError("No CIP-30 wallet found. Install Nami, Eternl, or Lace.");
        return;
      }

      // Wait a bit more for wallet to be fully ready
      console.log("Waiting for wallet to be fully ready...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Getting wallet info...");
      const i = await getWalletInfo(w);
      console.log("🔍 Wallet info received:", i);

      if (i.networkId !== 0) {
        setError("Please switch wallet to Preprod/Preview testnet.");
        return;
      }

      setApi(w);
      setInfo(i);
      console.log("Wallet connection successful, calling onConnected...");
      console.log("🔍 Calling onConnected with wallet info:", i);
      // Call the parent callback immediately to trigger redirect
      props.onConnected(w, i);
    } catch (e: any) {
      console.error("Wallet connection error:", e);
      setError(e?.message || "Wallet connect failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">
            Connect Wallet
          </h3>
          <p className="text-sm text-gray-600">
            Connect your Cardano wallet to continue
          </p>
        </div>
        <button
          onClick={connect}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-lavender to-sky-blue text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => connect()}
            disabled={loading}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
