import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import DropList from "../components/DropList";

interface AvailableDropsPageProps {
  contract: ethers.Contract | null;
  account: string | null;
}

const AvailableDropsPage: React.FC<AvailableDropsPageProps> = ({
  contract,
  account,
}) => {
  const [drops, setDrops] = useState<any[]>([]);

  useEffect(() => {
    const fetchDrops = async () => {
      if (contract) {
        try {
          const dropCount = await contract.dropCount();
          const dropList = [];
          for (let i = 0; i < dropCount; i++) {
            const dropInfo = await contract.getDropInfo(i);
            if (dropInfo[5] && !dropInfo[6]) {
              // isActive && !isCompleted
              dropList.push({
                id: i,
                host: dropInfo[0],
                entryFee: ethers.formatEther(dropInfo[1]),
                rewardAmount: ethers.formatEther(dropInfo[2]),
                maxParticipants: dropInfo[3],
                currentParticipants: dropInfo[4],
                isActive: dropInfo[5],
                isCompleted: dropInfo[6],
                isPaidEntry: dropInfo[7],
                isManualSelection: dropInfo[8],
                numWinners: dropInfo[9],
                winners: dropInfo[10],
              });
            }
          }
          setDrops(dropList);
        } catch (error) {
          console.error("Error fetching available drops:", error);
        }
      }
    };
    fetchDrops();
  }, [contract]);

  return (
    <div>
      <h1 className="text-2xl mb-4">Available Drops</h1>
      <DropList drops={drops} />
    </div>
  );
};

export default AvailableDropsPage;
