import { http, createConfig } from "wagmi";
import { baseSepolia, base } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY!;

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [farcasterFrame(), injected()],
  transports: {
    // Use http transport with Alchemy URL for mainnet
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    // Use http transport with Alchemy URL for sepolia
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
  },
});

export const chains = [baseSepolia, base];
