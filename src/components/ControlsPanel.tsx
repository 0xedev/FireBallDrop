import React, { Dispatch, SetStateAction } from "react";
import { ethers } from "ethers";

interface ControlsPanelProps {
  isManual: boolean;
  setIsManual: Dispatch<SetStateAction<boolean>>;
  entryFee: number;
  setEntryFee: Dispatch<SetStateAction<number>>;
  rewardAmount: number;
  setRewardAmount: Dispatch<SetStateAction<number>>;
  maxParticipants: number;
  setMaxParticipants: Dispatch<SetStateAction<number>>;
  numWinners: number;
  setNumWinners: Dispatch<SetStateAction<number>>;
  contract: ethers.Contract | null;
  createDrop: () => Promise<void>;
  selectWinnersManually: () => Promise<number[]>;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isManual,
  setIsManual,
  entryFee,
  setEntryFee,
  rewardAmount,
  setRewardAmount,
  maxParticipants,
  setMaxParticipants,
  numWinners,
  setNumWinners,
  contract,
  createDrop,
}) => {
  return (
    <div className="w-1/4 p-4 bg-gray-800">
      <h2 className="text-xl mb-4">Controls</h2>
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
        disabled={!contract}
      >
        Create Drop
      </button>
    </div>
  );
};

export default ControlsPanel;
