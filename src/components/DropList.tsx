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
        <p className="text-center text-gray-400 text-lg py-8">
          No drops available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <div
              key={drop.id}
              className="bg-gray-900 p-4 rounded-2xl shadow-lg border border-purple-800 hover:shadow-xl transition-shadow duration-200"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Drop #{drop.id}
              </h3>
              <div className="space-y-2 text-gray-200">
                <p>
                  <span className="font-medium">Host:</span>{" "}
                  {drop.host.slice(0, 6)}...{drop.host.slice(-4)}
                </p>
                <p>
                  <span className="font-medium">Entry Fee:</span>{" "}
                  {drop.entryFee} ETH
                </p>
                <p>
                  <span className="font-medium">Reward:</span>{" "}
                  {drop.rewardAmount} ETH
                </p>
                <p>
                  <span className="font-medium">Participants:</span>{" "}
                  {drop.currentParticipants}/{drop.maxParticipants}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {drop.isCompleted
                    ? "Ended"
                    : drop.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
              <Link
                to={`/drop/${drop.id}`}
                className="block mt-4 text-blue-400 hover:text-blue-300 font-medium text-lg py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
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
