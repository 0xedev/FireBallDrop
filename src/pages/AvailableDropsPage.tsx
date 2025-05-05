import React, { useState, useEffect } from "react";
import { formatEther } from "viem";
import { toast } from "react-toastify";
import DropList from "../components/DropList";
import { getContract } from "../utils/contract";

const AvailableDropsPage: React.FC = () => {
  const [drops, setDrops] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrops = async () => {
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
            args: [BigInt(i)],
          })) as any;

          if (dropInfo[5] && !dropInfo[6]) {
            // isActive && !isCompleted
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
      } catch (err: any) {
        setError(err.message || "Failed to fetch available drops");
        toast.error(err.message || "Failed to fetch available drops");
        console.error("Error fetching available drops:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrops();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl mb-4">Available Drops</h1>
      <DropList drops={drops} />
    </div>
  );
};

export default AvailableDropsPage;
