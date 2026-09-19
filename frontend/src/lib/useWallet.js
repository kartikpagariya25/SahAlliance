import { useState, useCallback, useEffect } from "react";

const MOCK_ADDRESS = "0x0000000000000000000000000000000000000001";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export function useWallet() {
  const [address, setAddress] = useState(USE_MOCK ? MOCK_ADDRESS : null);

  const connect = useCallback(async () => {
    if (USE_MOCK) {
      setAddress(MOCK_ADDRESS);
      return;
    }
    if (!window.ethereum) {
      alert("Install MetaMask to continue.");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAddress(accounts[0]);

    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(chainId, 16) !== Number(import.meta.env.VITE_CHAIN_ID)) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x27A7" }], // 10143
        });
      } catch (err) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x27A7",
                chainName: "Monad Testnet",
                nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
                rpcUrls: [import.meta.env.VITE_RPC_URL],
                blockExplorerUrls: ["https://testnet.monadscan.com"],
              },
            ],
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK || !window.ethereum) return;
    window.ethereum.on?.("accountsChanged", (accounts) => setAddress(accounts[0] || null));
  }, []);

  return { address, connect, isMock: USE_MOCK };
}
