import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";

interface CreateDropPageProps {
  contract: ethers.Contract | null;
  account: string | null;
}

const CreateDropPage: React.FC<CreateDropPageProps> = ({
  contract,
  account,
}) => {
  const [isManual, setIsManual] = useState<boolean>(true);
  const [entryFee, setEntryFee] = useState<number>(0.01);
  const [rewardAmount, setRewardAmount] = useState<number>(0.1);
  const [maxParticipants, setMaxParticipants] = useState<number>(20);
  const [numWinners, setNumWinners] = useState<number>(1);
  const navigate = useNavigate();

  const createDrop = async () => {
    if (contract) {
      try {
        const tx = await contract.createDrop(
          ethers.parseEther(entryFee.toString()),
          ethers.parseEther(rewardAmount.toString()),
          maxParticipants,
          !isManual,
          isManual,
          numWinners,
          { value: isManual ? 0n : ethers.parseEther(rewardAmount.toString()) }
        );
        await tx.wait();
        console.log("Drop created:", tx.hash);
        navigate("/available");
      } catch (error) {
        console.error("Error creating drop:", error);
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Create Fireball Drop</h1>
      <div className="bg-gray-800 p-4 rounded">
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={isManual}
            onChange={(e) => setIsManual(e.target.checked)}
            className="mr-2"
          />{" "}
          Manual
        </label>
        <input
          type="number"
          value={entryFee}
          onChange={(e) => setEntryFee(Number(e.target.value))}
          className="w-full p-1 mb-2 bg-gray-700 rounded"
          placeholder="Entry Fee (ETH)"
          step="0.01"
        />
        <input
          type="number"
          value={rewardAmount}
          onChange={(e) => setRewardAmount(Number(e.target.value))}
          className="w-full p-1 mb-2 bg-gray-700 rounded"
          placeholder="Reward Amount (ETH)"
          step="0.01"
        />
        <input
          type="number"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          className="w-full p-1 mb-2 bg-gray-700 rounded"
          placeholder="Max Participants"
          min="1"
          max="20"
        />
        <select
          value={numWinners}
          onChange={(e) => setNumWinners(Number(e.target.value))}
          className="w-full p-1 mb-2 bg-gray-700 rounded"
        >
          <option value={1}>1 Winner</option>
          <option value={2}>2 Winners</option>
          <option value={3}>3 Winners</option>
        </select>
        <button
          className="w-full bg-blue-500 p-2 rounded mt-2"
          onClick={createDrop}
          disabled={!contract || !account}
        >
          Create Drop
        </button>
      </div>
    </div>
  );
};

export default CreateDropPage;
