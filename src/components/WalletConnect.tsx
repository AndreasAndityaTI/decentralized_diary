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
      const w = await enableWallet();
      if (!w) {
        setError("No CIP-30 wallet found. Install Nami, Eternl, or Lace.");
        return;
      }
      const i = await getWalletInfo(w);
      if (i.networkId !== 0) {
        setError("Please switch wallet to Preprod/Preview testnet.");
        return;
      }
      setApi(w);
      setInfo(i);
      props.onConnected(w, i);
    } catch (e: any) {
      setError(e?.message || "Wallet connect failed");
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
          {info ? (
            <p className="text-sm text-gray-600">
              Network: {info.networkId === 0 ? "Testnet" : "Mainnet"}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Connect your Cardano wallet to continue
            </p>
          )}
        </div>
        <button
          onClick={connect}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-lavender to-sky-blue text-white hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Connecting..." : api ? "Reconnect" : "Connect Wallet"}
        </button>
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
