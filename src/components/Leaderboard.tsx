import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../utils/contract";
import { LeaderboardEntry } from "../types/global";

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard();
        setLeaders(data); // Top 10 handled in getLeaderboard
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 bg-gray-900 bg-opacity-90 rounded-xl border border-purple-800 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-purple-300 font-medium">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-900 bg-opacity-90 p-6 rounded-xl shadow-xl border border-purple-600 overflow-hidden">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-purple-600 h-8 w-1 mr-3 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <div className="bg-purple-600 h-8 w-1 ml-3 rounded-full"></div>
      </div>

      <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between text-xs text-purple-300 uppercase font-semibold mb-2 px-2">
          <span>Rank & Player</span>
          <span>Stats</span>
        </div>

        <ul className="space-y-3">
          {leaders.map((leader, index) => (
            <li
              key={leader.address}
              className={`flex justify-between items-center p-3 rounded-lg transition-all duration-300 hover:bg-purple-900 hover:bg-opacity-30 ${
                index < 3
                  ? "bg-purple-900 bg-opacity-20 border-l-4 border-purple-500"
                  : "bg-gray-800 bg-opacity-30"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-sm
                  ${
                    index === 0
                      ? "bg-yellow-500 text-gray-900"
                      : index === 1
                      ? "bg-gray-300 text-gray-900"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="text-sm sm:text-base font-medium text-gray-200">
                  {leader.address.slice(0, 6)}...
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-purple-400 mr-1 text-sm">W:</span>
                  <span className="text-white font-medium text-sm sm:text-base">
                    {leader.wins}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-400 mr-1 text-sm">Ξ</span>
                  <span className="text-white font-medium text-sm sm:text-base">
                    {leader.totalPrize}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {leaders.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No players on the leaderboard yet
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
