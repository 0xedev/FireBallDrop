import { createPublicClient, http, createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";
import { getAddress } from "viem";

import { formatEther } from "viem";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wrapperAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_linkAddress",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "_callbackGasLimit",
        type: "uint32",
      },
      {
        internalType: "uint16",
        name: "_platformFeePercent",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "_feeReceiver",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyVRFWrapperCanFulfill",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "host",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPaidEntry",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "refundedAmount",
        type: "uint256",
      },
    ],
    name: "DropCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "host",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPaidEntry",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isManualSelection",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "numWinners",
        type: "uint32",
      },
    ],
    name: "DropCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "currentParticipants",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256",
      },
    ],
    name: "ParticipantJoined",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "newFeePercent",
        type: "uint16",
      },
    ],
    name: "PlatformFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RefundClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payment",
        type: "uint256",
      },
    ],
    name: "RequestFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "numWinners",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isManualSelection",
        type: "bool",
      },
    ],
    name: "RequestSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "winners",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "prizeAmounts",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "platformFee",
        type: "uint256",
      },
    ],
    name: "WinnersSelected",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "MAX_NUM_WORDS",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REQUEST_CONFIRMATIONS",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "callbackGasLimit",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "cancelDrop",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "claimedRefunds",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isPaidEntry",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isManualSelection",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "numWinners",
        type: "uint32",
      },
    ],
    name: "createDrop",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "dropCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "drops",
    outputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "host",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentParticipants",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isCompleted",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isPaidEntry",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isManualSelection",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "numWinners",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeReceiver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "getDropInfo",
    outputs: [
      {
        internalType: "address",
        name: "host",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxParticipants",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentParticipants",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isCompleted",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isPaidEntry",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "isManualSelection",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "numWinners",
        type: "uint32",
      },
      {
        internalType: "address[]",
        name: "winners",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "getDropParticipants",
    outputs: [
      {
        internalType: "address[]",
        name: "addresses",
        type: "address[]",
      },
      {
        internalType: "string[]",
        name: "names",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "getDropVrfRequests",
    outputs: [
      {
        internalType: "uint256[]",
        name: "requestIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLinkToken",
    outputs: [
      {
        internalType: "contract LinkTokenInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    name: "getVrfRequestDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isFulfilled",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "participant",
        type: "address",
      },
    ],
    name: "hasJoinedDrop",
    outputs: [
      {
        internalType: "bool",
        name: "hasJoined",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "i_vrfV2PlusWrapper",
    outputs: [
      {
        internalType: "contract IVRFV2PlusWrapper",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "joinDrop",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "linkAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeePercent",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "dropId",
        type: "uint256",
      },
    ],
    name: "selectWinnersManually",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "newFeePercent",
        type: "uint16",
      },
    ],
    name: "updatePlatformFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawNative",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    alchemyApiKey
      ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`
      : undefined
  ),
});

export const getContract = async () => {
  if (!window.ethereum) {
    console.error("Ethereum provider not found. Ensure MetaMask is installed.");
    throw new Error("Ethereum provider not found");
  }

  const [account] =
    (await window.ethereum?.request({ method: "eth_requestAccounts" })) || [];
  if (!account) {
    console.error("No accounts found. Please connect a wallet.");
    throw new Error("No accounts found");
  }

  if (!CONTRACT_ADDRESS) {
    console.error("Contract address not set in environment variables.");
    throw new Error("Contract address not set");
  }

  const walletClient = createWalletClient({
    account: getAddress(account),
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });

  return {
    publicClient,
    walletClient,
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
  };
};

export async function getLeaderboard() {
  const { publicClient, address, abi } = await getContract();
  const dropCount = (await publicClient.readContract({
    address: address as `0x${string}`,
    abi,
    functionName: "dropCounter",
  })) as bigint;

  const leaderboardMap: {
    [key: string]: { wins: number; totalPrize: bigint };
  } = {};
  for (let i = 0; i < Number(dropCount); i++) {
    const [, , , , , , isCompleted, , , numWinners, winners] =
      (await publicClient.readContract({
        address: address as `0x${string}`,
        abi,
        functionName: "getDropInfo",
        args: [BigInt(i)],
      })) as [
        any,
        any,
        any,
        any,
        any,
        any,
        boolean,
        any,
        any,
        number,
        (typeof address)[]
      ];

    if (isCompleted && winners.length > 0) {
      const [, , rewardAmount] = (await publicClient.readContract({
        address: address as `0x${string}`,
        abi,
        functionName: "getDropInfo",
        args: [BigInt(i)],
      })) as [any, any, bigint];
      const totalPrize = BigInt(rewardAmount.toString());
      const platformFee = (totalPrize * BigInt(10000)) / BigInt(10000); // Placeholder, adjust if fee logic changes
      const distributableAmount = totalPrize - platformFee;

      const prizeAmounts = new Array(numWinners).fill(0n);
      if (numWinners === 1) {
        prizeAmounts[0] = distributableAmount;
      } else if (numWinners === 2) {
        prizeAmounts[0] = (distributableAmount * 60n) / 100n;
        prizeAmounts[1] = (distributableAmount * 40n) / 100n;
      } else if (numWinners === 3) {
        prizeAmounts[0] = (distributableAmount * 50n) / 100n;
        prizeAmounts[1] = (distributableAmount * 30n) / 100n;
        prizeAmounts[2] = (distributableAmount * 20n) / 100n;
      }

      for (let j = 0; j < numWinners; j++) {
        const winner = winners[j];
        if (!leaderboardMap[winner]) {
          leaderboardMap[winner] = { wins: 0, totalPrize: BigInt(0) };
        }
        leaderboardMap[winner].wins += 1;
        leaderboardMap[winner].totalPrize += prizeAmounts[j];
      }
    }
  }

  const leaderboard = Object.entries(leaderboardMap).map(([address, data]) => ({
    address,
    wins: data.wins,
    totalPrize: formatEther(data.totalPrize),
  }));
  return leaderboard
    .sort(
      (a, b) =>
        b.wins - a.wins || parseFloat(b.totalPrize) - parseFloat(a.totalPrize)
    )
    .slice(0, 10);
}
