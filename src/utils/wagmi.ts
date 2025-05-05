import { http, createConfig } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY!;

export const config = createConfig({
  chains: [baseSepolia, sepolia],
  connectors: [injected()],
  transports: {
    // Use http transport with Alchemy URL for mainnet
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    // Use http transport with Alchemy URL for sepolia
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
  },
});

export const chains = [baseSepolia, sepolia];

//https://base-sepolia.g.alchemy.com/v2/qgHJWq1wjejcdsSv9JOCUYpHXZE-QXpM
