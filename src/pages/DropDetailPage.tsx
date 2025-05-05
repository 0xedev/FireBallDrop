import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "react-toastify";
import PlinkoBoard from "../components/PlinkoBoard";
import ParticipantSlots from "../components/ParticipantSlots";
import { getContract } from "../utils/contract";

interface Participant {
  address: string;
  name: string;
  slot: number;
}

const DropDetailPage: React.FC = () => {
  const { dropId } = useParams<{ dropId: string }>();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [dropInfo, setDropInfo] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const rows = 16; // Matches old UI

  useEffect(() => {
    const fetchDropInfo = async () => {
      if (!dropId) return;
      setLoading(true);
      setError(null);
      try {
        const {
          publicClient,
          address: contractAddress,
          abi,
        } = await getContract();
        const info = (await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi,
          functionName: "getDropInfo",
          args: [BigInt(dropId)],
        })) as any;

        const [addresses, names] = (await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi,
          functionName: "getDropParticipants",
          args: [BigInt(dropId)],
        })) as [string[], string[]];

        const participantList = addresses.map(
          (addr: string, index: number) => ({
            address: addr,
            name: names[index] || `User-${addr.slice(-4)}`,
            slot: index,
          })
        );

        setParticipants(participantList);
        setDropInfo({
          id: Number(dropId),
          host: info[0],
          entryFee: formatEther(info[1]),
          rewardAmount: formatEther(info[2]),
          maxParticipants: Number(info[3]),
          currentParticipants: Number(info[4]),
          isActive: info[5],
          isCompleted: info[6],
          isPaidEntry: info[7],
          isManualSelection: info[8],
          numWinners: Number(info[9]),
          winners: info[10],
        });
      } catch (err) {
        setError("Failed to fetch drop info");
        toast.error("Failed to fetch drop info");
        console.error("Error fetching drop info:", err);
      } finally {
        setLoading(false);
      }
    };

    const setupEventListeners = async () => {
      const {
        publicClient,
        address: contractAddress,
        abi,
      } = await getContract();
      publicClient.watchContractEvent({
        address: contractAddress as `0x${string}`,
        abi,
        eventName: "ParticipantJoined",
        onLogs: (logs) => {
          logs.forEach((log) => {
            if (log.args.dropId.toString() === dropId) fetchDropInfo();
          });
        },
      });
      publicClient.watchContractEvent({
        address: contractAddress as `0x${string}`,
        abi,
        eventName: "WinnersSelected",
        onLogs: (logs) => {
          logs.forEach((log) => {
            if (log.args.dropId.toString() === dropId) fetchDropInfo();
          });
        },
      });
    };

    fetchDropInfo();
    setupEventListeners();
  }, [dropId]);

  const joinDrop = async () => {
    if (!walletClient || !address || !dropInfo) {
      toast.error("Wallet not connected or drop info unavailable");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const {
        publicClient,
        address: contractAddress,
        abi,
      } = await getContract();
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "joinDrop",
        args: [BigInt(dropId), `User-${address.slice(-4)}`],
        value: dropInfo.isPaidEntry ? parseEther(dropInfo.entryFee) : 0n,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Joined drop successfully");
      console.log("Joined drop:", hash);
    } catch (err) {
      setError("Failed to join drop");
      toast.error("Failed to join drop");
      console.error("Error joining drop:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectWinnersManually = async (): Promise<number[]> => {
    if (!walletClient || !dropInfo) {
      toast.error("Wallet not connected or drop info unavailable");
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const {
        publicClient,
        address: contractAddress,
        abi,
      } = await getContract();
      if (dropInfo.currentParticipants < dropInfo.numWinners)
        throw new Error("Not enough participants");
      if (!dropInfo.isActive) throw new Error("Drop is not active");
      if (dropInfo.isCompleted) throw new Error("Drop is already completed");

      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "selectWinnersManually",
        args: [BigInt(dropId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Winners selected successfully");
      console.log("Winners selected:", hash);

      const updatedInfo = (await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "getDropInfo",
        args: [BigInt(dropId)],
      })) as any;

      setDropInfo({
        ...dropInfo,
        isActive: updatedInfo[5],
        isCompleted: updatedInfo[6],
        winners: updatedInfo[10],
      });

      return updatedInfo[10].map((winner: string, index: number) => {
        const participantIndex = participants.findIndex(
          (p) => p.address.toLowerCase() === winner.toLowerCase()
        );
        return participantIndex !== -1
          ? participantIndex
          : index % dropInfo.currentParticipants;
      });
    } catch (err) {
      setError("Failed to select winners");
      toast.error("Failed to select winners");
      console.error("Error selecting winners:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!dropInfo) return <div>No drop info available</div>;

  return (
    <div className="p-4 flex">
      {/* Left Panel */}
      <div className="w-1/4 mr-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h2 className="text-xl mb-2 text-white font-semibold">
            Drop #{dropId}
          </h2>
          <p className="text-white">Host: {dropInfo.host.slice(0, 6)}...</p>
          <p className="text-white">Entry Fee: {dropInfo.entryFee} ETH</p>
          <p className="text-white">Reward: {dropInfo.rewardAmount} ETH</p>
          <p className="text-white">
            Participants: {dropInfo.currentParticipants}/
            {dropInfo.maxParticipants}
          </p>
          <p className="text-white">
            Status:{" "}
            {dropInfo.isCompleted
              ? "Ended"
              : dropInfo.isActive
              ? "Active"
              : "Inactive"}
          </p>
          {dropInfo.isCompleted && dropInfo.winners.length > 0 && (
            <p className="text-white">
              Winners:{" "}
              {dropInfo.winners
                .map((w: string) => `${w.slice(0, 6)}...`)
                .join(", ")}
            </p>
          )}
          <h3 className="text-lg mt-4 mb-2 text-white font-semibold">
            Participants
          </h3>
          {participants.length === 0 ? (
            <p className="text-white">No participants yet.</p>
          ) : (
            <ul>
              {participants.map((participant) => (
                <li key={participant.slot} className="mb-1 text-white">
                  Slot {participant.slot}: {participant.name} (
                  {participant.address.slice(0, 6)}...)
                </li>
              ))}
            </ul>
          )}
          {!dropInfo.isCompleted && dropInfo.isActive && (
            <button
              onClick={joinDrop}
              className="bg-green-500 text-black font-bold py-4 px-6 rounded-md w-full mt-4"
              disabled={
                !address ||
                participants.some(
                  (p) => p.address.toLowerCase() === address?.toLowerCase()
                )
              }
            >
              Join Drop
            </button>
          )}
        </div>
      </div>
      {/* Game Board */}
      <div className="w-3/4 flex flex-col">
        <PlinkoBoard
          rows={rows}
          numWinners={dropInfo.numWinners}
          currentParticipants={dropInfo.currentParticipants}
          maxParticipants={dropInfo.maxParticipants}
          dropBall={selectWinnersManually}
          isHost={dropInfo.host.toLowerCase() === address?.toLowerCase()}
          isManual={dropInfo.isManualSelection}
          isActive={dropInfo.isActive}
          isCompleted={dropInfo.isCompleted}
        />
        <ParticipantSlots
          maxParticipants={dropInfo.maxParticipants}
          currentParticipants={dropInfo.currentParticipants}
        />
      </div>
    </div>
  );
};

export default DropDetailPage;
