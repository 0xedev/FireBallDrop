import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import PlinkoBoard from "../components/PlinkoBoard";

interface DropDetailPageProps {
  contract: ethers.Contract | null;
  account: string | null;
}

interface Participant {
  address: string;
  name: string;
  slot: number;
}

const DropDetailPage: React.FC<DropDetailPageProps> = ({
  contract,
  account,
}) => {
  const { dropId } = useParams<{ dropId: string }>();
  const [dropInfo, setDropInfo] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const rows = 10;

  useEffect(() => {
    const fetchDropInfo = async () => {
      if (contract && dropId) {
        try {
          const info = await contract.getDropInfo(Number(dropId));
          const [addresses, names] = await contract.getDropParticipants(
            Number(dropId)
          );
          const participantList = addresses.map(
            (addr: string, index: number) => ({
              address: addr,
              name: names[index],
              slot: index,
            })
          );
          setParticipants(participantList);
          setDropInfo({
            id: Number(dropId),
            host: info[0],
            entryFee: ethers.formatEther(info[1]),
            rewardAmount: ethers.formatEther(info[2]),
            maxParticipants: info[3],
            currentParticipants: info[4],
            isActive: info[5],
            isCompleted: info[6],
            isPaidEntry: info[7],
            isManualSelection: info[8],
            numWinners: info[9],
            winners: info[10],
          });
        } catch (error) {
          console.error("Error fetching drop info:", error);
        }
      }
    };
    fetchDropInfo();
  }, [contract, dropId]);

  const joinDrop = async () => {
    if (contract && account && dropInfo) {
      try {
        const tx = await contract.joinDrop(
          Number(dropId),
          `User-${account.slice(-4)}`,
          {
            value: dropInfo.isPaidEntry
              ? ethers.parseEther(dropInfo.entryFee)
              : 0n,
          }
        );
        await tx.wait();
        console.log("Joined drop:", tx.hash);
        fetchDropInfo();
      } catch (error) {
        console.error("Error joining drop:", error);
      }
    }
  };

  const selectWinnersManually = async (): Promise<number[]> => {
    if (contract && dropInfo) {
      try {
        if (dropInfo.currentParticipants < dropInfo.numWinners)
          throw new Error("Not enough participants");
        if (!dropInfo.isActive) throw new Error("Drop is not active");
        if (dropInfo.isCompleted) throw new Error("Drop is already completed");
        const tx = await contract.selectWinnersManually(Number(dropId));
        await tx.wait();
        console.log("Winners selected:", tx.hash);
        const updatedInfo = await contract.getDropInfo(Number(dropId));
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
      } catch (error) {
        console.error("Error selecting winners:", error);
        throw error;
      }
    }
    return [];
  };

  if (!dropInfo) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl mb-4">Drop #{dropId}</h1>
      <div className="flex">
        <div className="w-1/4 p-4 bg-gray-800 rounded mr-4">
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
                !contract ||
                !account ||
                participants.some(
                  (p) => p.address.toLowerCase() === account?.toLowerCase()
                )
              }
            >
              Join Drop
            </button>
          )}
        </div>
        <div className="w-3/4 p-4 bg-gray-900 rounded">
          <h2 className="text-xl mb-2">Details</h2>
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
            <p>Winners: {dropInfo.winners.join(", ")}</p>
          )}
          <div className="mt-4">
            <PlinkoBoard
              rows={rows}
              numWinners={dropInfo.numWinners}
              currentParticipants={dropInfo.currentParticipants}
              maxParticipants={dropInfo.maxParticipants}
              dropBall={selectWinnersManually}
              isHost={dropInfo.host.toLowerCase() === account?.toLowerCase()}
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
