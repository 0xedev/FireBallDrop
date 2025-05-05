import React from "react";
import { Link } from "react-router-dom";

interface Drop {
  id: number;
  host: string;
  entryFee: string;
  rewardAmount: string;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  isCompleted: boolean;
  isPaidEntry: boolean;
  isManualSelection: boolean;
  numWinners: number;
  winners: string[];
}

interface DropListProps {
  drops: Drop[];
}

const DropList: React.FC<DropListProps> = ({ drops }) => {
  return (
    <div>
      {drops.length === 0 ? (
        <p>No drops available.</p>
      ) : (
        <div className="grid gap-4">
          {drops.map((drop) => (
            <div key={drop.id} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg">Drop #{drop.id}</h3>
              <p>Host: {drop.host}</p>
              <p>Entry Fee: {drop.entryFee} ETH</p>
              <p>Reward: {drop.rewardAmount} ETH</p>
              <p>
                Participants: {drop.currentParticipants}/{drop.maxParticipants}
              </p>
              <p>
                Status:{" "}
                {drop.isCompleted
                  ? "Ended"
                  : drop.isActive
                  ? "Active"
                  : "Inactive"}
              </p>
              <Link
                to={`/drop/${drop.id}`}
                className="text-blue-400 hover:underline"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropList;
