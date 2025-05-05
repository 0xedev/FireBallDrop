import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { toast } from "react-toastify";
import ControlsPanel from "../components/ControlsPanel";
import { getContract } from "../utils/contract";

const CreateDropPage: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isManual, setIsManual] = useState<boolean>(true);
  const [entryFee, setEntryFee] = useState<number>(0.01);
  const [rewardAmount, setRewardAmount] = useState<number>(0.1);
  const [maxParticipants, setMaxParticipants] = useState<number>(20);
  const [numWinners, setNumWinners] = useState<number>(1);
  const navigate = useNavigate();

  const createDrop = async () => {
    if (!walletClient || !address) {
      toast.error("Wallet not connected");
      return;
    }
    const { publicClient, address: contractAddress, abi } = await getContract();
    try {
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "createDrop",
        args: [
          parseEther(entryFee.toString()),
          parseEther(rewardAmount.toString()),
          maxParticipants,
          !isManual,
          isManual,
          numWinners,
        ],
        value: isManual ? 0n : parseEther(rewardAmount.toString()),
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Drop created successfully");
      console.log("Drop created:", hash);
      navigate("/available");
    } catch (error) {
      toast.error("Error creating drop");
      console.error("Error creating drop:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Create Fireball Drop</h1>
      <div className="bg-gray-800 p-4 rounded">
        <ControlsPanel
          isManual={isManual}
          setIsManual={setIsManual}
          entryFee={entryFee}
          setEntryFee={setEntryFee}
          rewardAmount={rewardAmount}
          setRewardAmount={setRewardAmount}
          maxParticipants={maxParticipants}
          setMaxParticipants={setMaxParticipants}
          numWinners={numWinners}
          setNumWinners={setNumWinners}
          createDrop={createDrop}
        />
      </div>
    </div>
  );
};

export default CreateDropPage;
