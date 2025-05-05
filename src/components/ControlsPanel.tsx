import React, { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

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
  createDrop: () => Promise<void>;
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
  createDrop,
}) => {
  const handleCreateDrop = async () => {
    if (entryFee <= 0) {
      toast.error("Entry fee must be greater than 0");
      return;
    }
    if (rewardAmount <= 0) {
      toast.error("Reward amount must be greater than 0");
      return;
    }
    if (maxParticipants < 1 || maxParticipants > 20) {
      toast.error("Max participants must be between 1 and 20");
      return;
    }
    if (numWinners < 1 || numWinners > 3) {
      toast.error("Number of winners must be between 1 and 3");
      return;
    }
    if (numWinners > maxParticipants) {
      toast.error("Number of winners cannot exceed max participants");
      return;
    }
    await createDrop();
  };

  return (
    <div className="w-1/4 p-4 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl mb-4 text-white font-semibold">Controls</h2>
      <label className="block mb-2 text-white">
        <input
          type="checkbox"
          checked={isManual}
          onChange={(e) => setIsManual(e.target.checked)}
          className="mr-2 accent-blue-500"
        />{" "}
        Manual
      </label>
      <input
        type="number"
        value={entryFee}
        onChange={(e) => setEntryFee(Math.max(0, Number(e.target.value)))}
        className="w-full p-2 mb-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Entry Fee (ETH)"
        step="0.01"
        min="0"
      />
      <input
        type="number"
        value={rewardAmount}
        onChange={(e) => setRewardAmount(Math.max(0, Number(e.target.value)))}
        className="w-full p-2 mb-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Reward Amount (ETH)"
        step="0.01"
        min="0"
      />
      <input
        type="number"
        value={maxParticipants}
        onChange={(e) =>
          setMaxParticipants(Math.min(20, Math.max(1, Number(e.target.value))))
        }
        className="w-full p-2 mb-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Max Participants"
        min="1"
        max="20"
      />
      <select
        value={numWinners}
        onChange={(e) =>
          setNumWinners(Math.min(3, Math.max(1, Number(e.target.value))))
        }
        className="w-full p-2 mb-2 bg-gray-700 rounded text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={1}>1 Winner</option>
        <option value={2}>2 Winners</option>
        <option value={3}>3 Winners</option>
      </select>
      <button
        className="w-full bg-blue-500 p-2 rounded mt-2 text-white font-medium hover:bg-blue-600 transition duration-200 disabled:bg-gray-500"
        onClick={handleCreateDrop}
        disabled={!true} // Always enabled for now
      >
        Create Drop
      </button>
    </div>
  );
};

export default ControlsPanel;
