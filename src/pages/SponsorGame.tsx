import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther } from "viem";
import { toast } from "react-toastify";
import { getContract } from "../utils/contract";

const SponsorGame: React.FC = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectionType, setSelectionType] = useState<"manual" | "automatic">(
    "manual"
  );
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [maxParticipants, setMaxParticipants] = useState<string>("20");
  const [numWinners, setNumWinners] = useState<number>(1);
  const [isPaidEntry, setIsPaidEntry] = useState<boolean>(false); // Add paid-entry toggle
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const MAX_PARTICIPANTS_LIMIT = 30;
  const MAX_WINNERS_LIMIT = 3;

  const validateInputs = () => {
    if (maxParticipants === "") {
      setErrorMessage("Max participants is required");
      return false;
    }
    const participants = parseInt(maxParticipants);
    if (participants <= 0 || participants > MAX_PARTICIPANTS_LIMIT) {
      setErrorMessage(
        `Max participants must be between 1 and ${MAX_PARTICIPANTS_LIMIT}`
      );
      return false;
    }
    if (numWinners <= 0 || numWinners > MAX_WINNERS_LIMIT) {
      setErrorMessage(
        `Number of winners must be between 1 and ${MAX_WINNERS_LIMIT}`
      );
      return false;
    }
    if (!isPaidEntry && rewardAmount === "") {
      setErrorMessage("Reward amount is required for host-funded drops");
      return false;
    }
    if (!isPaidEntry) {
      const reward = parseFloat(rewardAmount);
      if (reward <= 0) {
        setErrorMessage("Reward amount must be greater than 0");
        return false;
      }
    }
    return true;
  };

  const createDrop = async () => {
    if (!walletClient || !address) {
      toast.error("Wallet not connected");
      setErrorMessage("Wallet not connected");
      return;
    }
    if (!validateInputs()) {
      toast.error(errorMessage);
      return;
    }

    setErrorMessage(null);
    try {
      const {
        publicClient,
        address: contractAddress,
        abi,
      } = await getContract();
      const fee = isPaidEntry ? parseEther("0.01") : 0n; // Example entry fee for paid drops
      const reward = isPaidEntry
        ? fee * BigInt(parseInt(maxParticipants))
        : parseEther(rewardAmount);
      const value = isPaidEntry ? 0n : reward; // Send rewardAmount for host-funded, 0 for paid-entry

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "createDrop",
        args: [
          fee,
          reward,
          BigInt(parseInt(maxParticipants)),
          isPaidEntry,
          selectionType === "manual",
          numWinners,
        ],
        value,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Game sponsored successfully");
      console.log("Game sponsored:", hash);
      navigate("/available");
    } catch (error: any) {
      const message = error.message.includes("insufficient funds")
        ? "Insufficient funds for transaction"
        : error.message || "Error sponsoring game";
      setErrorMessage(message);
      toast.error(message);
      console.error("Error sponsoring game:", error);
    }
  };

  const generateWinnerOptions = () => {
    const options = [];
    const maxWinners = Math.min(
      parseInt(maxParticipants) || MAX_WINNERS_LIMIT,
      MAX_WINNERS_LIMIT
    );
    for (let i = 1; i <= maxWinners; i++) {
      options.push(
        <option key={i} value={i}>
          {i} Winner{i === 1 ? "" : "s"}
        </option>
      );
    }
    return options;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-2">
            <span className="text-red-600">Sponsor</span>{" "}
            <span className="text-orange-500">Game</span>
          </h1>
          <div className="h-1 w-40 bg-gradient-to-r from-red-600 to-orange-500 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-100 text-center">
            Set your parameters and sponsor your game
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-8 rounded-2xl shadow-2xl border border-orange-500">
          <div className="mx-auto max-w-md">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Game Settings
            </h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-100 text-center mb-2">
                Game Type
              </label>
              <select
                value={isPaidEntry ? "paid" : "free"}
                onChange={(e) => setIsPaidEntry(e.target.value === "paid")}
                className="block w-full py-3 px-4 bg-gray-800 text-white border border-orange-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:border-yellow-400 transition-colors text-center appearance-none"
              >
                <option value="free">Host-Funded (Free Entry)</option>
                <option value="paid">Participant-Paid Entry</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-100 text-center mb-2">
                Winner Selection
              </label>
              <select
                value={selectionType}
                onChange={(e) =>
                  setSelectionType(e.target.value as "manual" | "automatic")
                }
                className="block w-full py-3 px-4 bg-gray-800 text-white border border-orange-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:border-yellow-400 transition-colors text-center appearance-none"
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-100 text-center"
                  htmlFor="maxParticipants"
                >
                  Max Participants
                </label>
                <input
                  id="maxParticipants"
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMaxParticipants(value);
                    const parsedValue = parseInt(value) || MAX_WINNERS_LIMIT;
                    if (numWinners > Math.min(parsedValue, MAX_WINNERS_LIMIT)) {
                      setNumWinners(Math.min(parsedValue, MAX_WINNERS_LIMIT));
                    }
                  }}
                  step="1"
                  min="1"
                  max={MAX_PARTICIPANTS_LIMIT}
                  placeholder="e.g., 20"
                  className="block w-full py-3 px-4 text-center bg-gray-800 text-white border border-orange-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:border-yellow-400 transition-colors"
                  aria-describedby="maxParticipants-description"
                />
                <p
                  id="maxParticipants-description"
                  className="text-xs text-gray-300 text-center mt-1"
                >
                  Maximum number of participants (limit:{" "}
                  {MAX_PARTICIPANTS_LIMIT})
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-100 text-center"
                  htmlFor="rewardAmount"
                >
                  {isPaidEntry ? "Entry Fee (ETH)" : "Reward Amount (ETH)"}
                </label>
                <input
                  id="rewardAmount"
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder={isPaidEntry ? "e.g., 0.01" : "e.g., 0.1"}
                  className="block w-full py-3 px-4 text-center bg-gray-800 text-white border border-orange-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:border-yellow-400 transition-colors"
                  aria-describedby="rewardAmount-description"
                />
                <p
                  id="rewardAmount-description"
                  className="text-xs text-gray-300 text-center mt-1"
                >
                  {isPaidEntry
                    ? "Fee per participant"
                    : "Total reward for winners"}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium text-gray-100 text-center"
                  htmlFor="numWinners"
                >
                  Number of Winners
                </label>
                <select
                  id="numWinners"
                  value={numWinners}
                  onChange={(e) => setNumWinners(parseInt(e.target.value))}
                  className="block w-full py-3 px-4 text-center bg-gray-800 text-white border border-orange-500 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 hover:border-yellow-400 transition-colors appearance-none"
                  aria-describedby="numWinners-description"
                >
                  {generateWinnerOptions()}
                </select>
                <p
                  id="numWinners-description"
                  className="text-xs text-gray-300 text-center mt-1"
                >
                  Number of winners to select (max: {MAX_WINNERS_LIMIT})
                </p>
              </div>
            </div>

            {errorMessage && (
              <div
                className="mt-4 text-center text-red-400 text-sm"
                id="error-message"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={createDrop}
                className="py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg w-40 text-center"
                aria-label="Sponsor Game"
              >
                Sponsor Game
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-300">
              Your sponsored games will appear in the "Available Drops" section
              once created
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorGame;
