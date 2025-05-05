import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import DropList from "../components/DropList";
import { getContract } from "../utils/contract";

const MyDropsPage: React.FC = () => {
  const { address } = useAccount();
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrops = async () => {
      if (!address) return;
      setLoading(true);
      setError(null);
      try {
        const {
          publicClient,
          address: contractAddress,
          abi,
        } = await getContract();
        const dropCount = (await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi,
          functionName: "dropCounter",
        })) as bigint;

        const dropList = [];
        for (let i = 0; i < Number(dropCount); i++) {
          const dropInfo = (await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi,
            functionName: "getDropInfo",
            args: [i],
          })) as any;

          const [participantAddresses] = (await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi,
            functionName: "getDropParticipants",
            args: [i],
          })) as [string[], string[]];

          const isHost = dropInfo[0].toLowerCase() === address.toLowerCase();
          const isParticipant = participantAddresses.some(
            (addr: string) => addr.toLowerCase() === address.toLowerCase()
          );

          if (isHost || isParticipant) {
            dropList.push({
              id: i,
              host: dropInfo[0],
              entryFee: formatEther(dropInfo[1]),
              rewardAmount: formatEther(dropInfo[2]),
              maxParticipants: Number(dropInfo[3]),
              currentParticipants: Number(dropInfo[4]),
              isActive: dropInfo[5],
              isCompleted: dropInfo[6],
              isPaidEntry: dropInfo[7],
              isManualSelection: dropInfo[8],
              numWinners: Number(dropInfo[9]),
              winners: dropInfo[10],
            });
          }
        }
        setDrops(dropList);
      } catch (err) {
        setError("Failed to fetch my drops");
        console.error("Error fetching my drops:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrops();
  }, [address]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl mb-4">My Drops</h1>
      <DropList drops={drops} />
    </div>
  );
};

export default MyDropsPage;
