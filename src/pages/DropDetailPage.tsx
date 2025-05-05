import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import PlinkoBoard from "../components/PlinkoBoard";
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
  const rows = 10;

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
          args: [Number(dropId)],
        })) as any;

        const [addresses, names] = (await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi,
          functionName: "getDropParticipants",
          args: [Number(dropId)],
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
          const log = logs[0];
          if (log.dropId?.toString() === dropId) fetchDropInfo();
        },
      });
      publicClient.watchContractEvent({
        address: contractAddress as `0x${string}`,
        abi,
        eventName: "WinnersSelected",
        onLogs: (logs) => {
          const log = logs[0];
          if (log.args?.dropId?.toString() === dropId) fetchDropInfo();
        },
      });
    };

    fetchDropInfo();
    setupEventListeners();
  }, [dropId]);

  const joinDrop = async () => {
    if (!walletClient || !address || !dropInfo) return;
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
        args: [Number(dropId), `User-${address.slice(-4)}`],
        value: dropInfo.isPaidEntry ? parseEther(dropInfo.entryFee) : 0n,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("Joined drop:", hash);
    } catch (err) {
      setError("Failed to join drop");
      console.error("Error joining drop:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectWinnersManually = async (): Promise<number[]> => {
    if (!walletClient || !dropInfo) return [];
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
        args: [Number(dropId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log("Winners selected:", hash);

      const updatedInfo = (await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "getDropInfo",
        args: [Number(dropId)],
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
    <div className="p-4">
      <h1 className="text-2xl mb-4">Drop #{dropId}</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/4 bg-gray-800 p-4 rounded">
          <h2 className="text-xl mb-2">Participants</h2>
          {participants.length === 0 ? (
            <p>No participants yet.</p>
          ) : (
            <ul>
              {participants.map((participant) => (
                <li key={participant.slot} className="mb-1">
                  Slot {participant.slot}: {participant.name} (
                  {participant.address.slice(0, 6)}...)
                </li>
              ))}
            </ul>
          )}
          {!dropInfo.isCompleted && dropInfo.isActive && (
            <button
              onClick={joinDrop}
              className="w-full bg-green-500 p-2 rounded mt-4"
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
        <div className="w-full lg:w-3/4 bg-gray-900 p-4 rounded">
          <h2 className="text-xl mb-2">Drop Details</h2>
          <p>Host: {dropInfo.host}</p>
          <p>Entry Fee: {dropInfo.entryFee} ETH</p>
          <p>Reward: {dropInfo.rewardAmount} ETH</p>
          <p>
            Participants: {dropInfo.currentParticipants}/
            {dropInfo.maxParticipants}
          </p>
          <p>
            Status:{" "}
            {dropInfo.isCompleted
              ? "Ended"
              : dropInfo.isActive
              ? "Active"
              : "Inactive"}
          </p>
          {dropInfo.isCompleted && dropInfo.winners.length > 0 && (
            <p>
              Winners:{" "}
              {dropInfo.winners
                .map((w: string) => `${w.slice(0, 6)}...`)
                .join(", ")}
            </p>
          )}
          <div className="mt-4">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDetailPage;
