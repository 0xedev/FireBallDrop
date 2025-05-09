import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther, formatEther } from "viem";
import { toast } from "react-toastify";
import PlinkoBoard from "../components/PlinkoBoard";
// import ParticipantSlots from "../components/ParticipantSlots";
import { sdk } from "@farcaster/frame-sdk";
import { getContract } from "../utils/contract";

interface Participant {
  address: string;
  name: string;
  slot: number;
}

interface DropInfo {
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

const DropDetailPage: React.FC = () => {
  const { dropId } = useParams<{ dropId: string }>();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const [winnerIndices, setWinnerIndices] = useState<number[]>([]); // Track winners for animation
  const [animateWinners, setAnimateWinners] = useState<boolean>(false); // Trigger animation
  const rows = 16;
  const plinkoBoardRef = useRef<{ dropBall: () => Promise<number[]> }>(null); // Ref to trigger Plinko animation

  useEffect(() => {
    const fetchDropInfo = async () => {
      // Reset animation state for the new drop
      setAnimateWinners(false);
      setWinnerIndices([]);

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

        setIsCancelled(!info[5] && !info[6]);

        // If winners are already selected (e.g., on page load), set indices for animation
        if (info[6] && info[10].length > 0) {
          const indices = info[10].map((winner: string, index: number) => {
            const participantIndex = participantList.findIndex(
              (p: Participant) =>
                p.address.toLowerCase() === winner.toLowerCase()
            );
            return participantIndex !== -1
              ? participantIndex
              : index % Number(info[4]);
          });
          setWinnerIndices(indices);
          setAnimateWinners(true);
        }
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
            const typedLog = log as unknown as { args: { dropId: bigint } };
            if (typedLog.args.dropId.toString() === dropId) fetchDropInfo();
          });
        },
      });

      publicClient.watchContractEvent({
        address: contractAddress as `0x${string}`,
        abi,
        eventName: "WinnersSelected",
        onLogs: (logs) => {
          logs.forEach(async (log) => {
            const typedLog = log as unknown as {
              args: { dropId: bigint; winners: string[] };
            };
            if (typedLog.args.dropId.toString() === dropId) {
              console.log(
                "WinnersSelected event received, refetching drop info for animation."
              );
              fetchDropInfo(); // Re-fetch all info to ensure participant list is current for index mapping
            }
          });
        },
      });

      publicClient.watchContractEvent({
        address: contractAddress as `0x${string}`,
        abi,
        eventName: "DropCancelled",
        onLogs: (logs) => {
          logs.forEach((log) => {
            const typedLog = log as unknown as { args: { dropId: bigint } };
            if (typedLog.args.dropId.toString() === dropId) {
              setIsCancelled(true);
              fetchDropInfo();
            }
          });
        },
      });
    };

    fetchDropInfo();
    setupEventListeners();
  }, [dropId]);

  // Effect to dynamically update fc:frame meta tag for sharing this specific drop
  useEffect(() => {
    if (dropInfo && dropId) {
      const metaTagContent = JSON.stringify({
        version: "next",
        imageUrl: "https://fireball-rho.vercel.app/image.png", // Consider a drop-specific image if available
        button: {
          title: `View Drop #${dropId} - ${dropInfo.rewardAmount} ETH Prize!`,
          action: {
            type: "launch_frame",
            url: `https://fireball-rho.vercel.app/drop/${dropId}`,
            name: "Fireball☄️", // Your app's name from farcaster.json
            splashImageUrl: "https://fireball-rho.vercel.app/logo.jpg", // from farcaster.json
            splashBackgroundColor: "#1f2937", // from farcaster.json
          },
        },
      });

      let metaTag = document.querySelector('meta[name="fc:frame"]');
      if (metaTag) {
        metaTag.setAttribute("content", metaTagContent);
      } else {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", "fc:frame");
        metaTag.setAttribute("content", metaTagContent);
        document.head.appendChild(metaTag);
      }

      // Cleanup: Revert to default meta tag from index.html when component unmounts
      // This is important for SPAs to ensure subsequent page views aren't affected
      // if they don't set their own fc:frame tags.
      return () => {
        const defaultFcFrame = document.querySelector(
          'meta[name="fc:frame-default-for-spa"]'
        );
        if (defaultFcFrame && metaTag) {
          metaTag.setAttribute(
            "content",
            defaultFcFrame.getAttribute("content") || ""
          );
        }
      };
    }
  }, [dropId, dropInfo]);

  const joinDrop = async () => {
    if (!walletClient || !address || !dropInfo || !dropId) {
      toast.error(
        "Wallet not connected, drop info unavailable, or drop ID missing"
      );
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
    if (!walletClient || !dropInfo || !dropId) {
      toast.error(
        "Wallet not connected, drop info unavailable, or drop ID missing"
      );
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

      const indices = updatedInfo[10].map((winner: string, index: number) => {
        const participantIndex = participants.findIndex(
          (p) => p.address.toLowerCase() === winner.toLowerCase()
        );
        return participantIndex !== -1
          ? participantIndex
          : index % dropInfo.currentParticipants;
      });

      setWinnerIndices(indices);
      setAnimateWinners(true); // Trigger animation for manual selection
      return indices;
    } catch (err) {
      setError("Participants not enough");
      toast.error("Participants not enough");
      console.error("Error selecting winners:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelDrop = async () => {
    if (!walletClient || !dropInfo || !dropId) {
      toast.error(
        "Wallet not connected, drop info unavailable, or drop ID missing"
      );
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
        functionName: "cancelDrop",
        args: [BigInt(dropId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Drop cancelled successfully");
      setIsCancelled(true);
      console.log("Drop cancelled:", hash);
    } catch (err) {
      setError("Failed to cancel drop");
      toast.error("Failed to cancel drop");
      console.error("Error cancelling drop:", err);
    } finally {
      setLoading(false);
    }
  };

  const claimRefund = async () => {
    if (!walletClient || !dropInfo || !dropId) {
      toast.error(
        "Wallet not connected, drop info unavailable, or drop ID missing"
      );
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
        functionName: "claimRefund",
        args: [BigInt(dropId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success("Refund claimed successfully");
      console.log("Refund claimed:", hash);
    } catch (err) {
      setError("Failed to claim refund");
      toast.error("Failed to claim refund");
      console.error("Error claiming refund:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShareDrop = async () => {
    if (!dropInfo || !dropId) return;

    const shareText = `Check out my Fireball Drop #${dropId}!\nPrize: ${dropInfo.rewardAmount} ETH.\nJoin here:`;
    // The URL of the current drop detail page
    const shareUrl = `https://fireball-rho.vercel.app/drop/${dropId}`;

    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
      });
    } catch (error) {
      console.error("Failed to compose cast for sharing drop:", error);
      toast.error("Could not open Farcaster composer to share.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-8 rounded-2xl shadow-2xl border border-orange-500 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-red-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Error Loading Drop
            </h2>
            <p className="text-gray-100">{error}</p>
          </div>
        </div>
      </div>
    );

  if (!dropInfo)
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-8 rounded-2xl shadow-2xl border border-orange-500 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 text-yellow-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Drop Not Found
            </h2>
            <p className="text-gray-100">
              No drop info available. It may have been removed or doesn't exist.
            </p>
            <button
              onClick={() => (window.location.href = "/available")}
              className="mt-4 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg"
            >
              View Available Drops
            </button>
          </div>
        </div>
      </div>
    );

  const isHost = dropInfo.host.toLowerCase() === address?.toLowerCase();
  const isParticipant = participants.some(
    (p) => p.address.toLowerCase() === address?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-2">
            <span className="text-red-600">Drop</span>{" "}
            <span className="text-orange-500">#{dropId}</span>
          </h1>
          <div className="h-1 w-40 bg-gradient-to-r from-red-600 to-orange-500 rounded-full mx-auto mb-3"></div>
          <p className="text-gray-100">Join the game or manage your drop</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3">
            <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-6 rounded-2xl shadow-2xl border border-orange-500">
              <h2 className="text-2xl font-bold text-white mb-4">
                Drop Details
              </h2>
              <div className="space-y-3 text-gray-100">
                <p>
                  <span className="font-semibold">Host:</span>{" "}
                  {dropInfo.host.slice(0, 6)}...{dropInfo.host.slice(-4)}
                </p>
                <p>
                  <span className="font-semibold">Entry Fee:</span>{" "}
                  {dropInfo.entryFee} ETH
                </p>
                <p>
                  <span className="font-semibold">Reward:</span>{" "}
                  {dropInfo.rewardAmount} ETH
                </p>
                <p>
                  <span className="font-semibold">Participants:</span>{" "}
                  {dropInfo.currentParticipants}/{dropInfo.maxParticipants}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  {isCancelled
                    ? "Cancelled"
                    : dropInfo.isCompleted
                    ? "Ended"
                    : dropInfo.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
                {dropInfo.isCompleted && dropInfo.winners.length > 0 && (
                  <p>
                    <span className="font-semibold">Winners:</span>{" "}
                    {dropInfo.winners
                      .map((w: string) => `${w.slice(0, 6)}...${w.slice(-4)}`)
                      .join(", ")}
                  </p>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">
                Participants
              </h3>
              {participants.length === 0 ? (
                <p className="text-gray-200">No participants yet.</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {participants.map((participant) => (
                    <li key={participant.slot} className="text-gray-200">
                      Slot {participant.slot}: {participant.name} (
                      {participant.address.slice(0, 6)}...
                      {participant.address.slice(-4)})
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 space-y-3">
                {!dropInfo.isCompleted && dropInfo.isActive && !isCancelled && (
                  <button
                    onClick={joinDrop}
                    className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      !address ||
                      isParticipant ||
                      dropInfo.currentParticipants >= dropInfo.maxParticipants
                    }
                  >
                    Join Drop
                  </button>
                )}
                {isHost && dropInfo.isActive && !isCancelled && (
                  <button
                    onClick={cancelDrop}
                    className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={dropInfo.isCompleted || !dropInfo.isActive}
                  >
                    Cancel Drop
                  </button>
                )}
                {isHost &&
                  dropInfo.isActive &&
                  !dropInfo.isCompleted &&
                  !isCancelled && (
                    <button
                      onClick={handleShareDrop}
                      className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg mt-3"
                    >
                      Share this Drop
                    </button>
                  )}
                {isParticipant &&
                  isCancelled &&
                  dropInfo.isPaidEntry &&
                  !dropInfo.isCompleted && (
                    <button
                      onClick={claimRefund}
                      className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Claim Refund
                    </button>
                  )}
              </div>
            </div>
          </div>
          <div className="lg:w-2/3 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-6 rounded-2xl shadow-2xl border border-orange-500">
              <PlinkoBoard
                dropId={dropId as string} // Pass the dropId
                ref={plinkoBoardRef}
                rows={rows}
                numWinners={dropInfo.numWinners}
                currentParticipants={dropInfo.currentParticipants}
                maxParticipants={dropInfo.maxParticipants}
                dropBall={selectWinnersManually}
                isHost={isHost}
                isManual={dropInfo.isManualSelection}
                isActive={dropInfo.isActive}
                isCompleted={dropInfo.isCompleted}
                winnerIndices={winnerIndices} // Pass winner indices for animation
                animateWinners={animateWinners} // Trigger animation
                setAnimateWinners={setAnimateWinners} // Reset animation state
              />
            </div>
            <div className="bg-gradient-to-br from-red-800 via-orange-700 to-yellow-600 p-6 rounded-2xl shadow-2xl border border-orange-500">
              {/* <ParticipantSlots
                maxParticipants={dropInfo.maxParticipants}
                currentParticipants={dropInfo.currentParticipants}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropDetailPage;
