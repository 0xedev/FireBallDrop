import React, { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import ParticipantSlots from "../components/ParticipantSlots";

interface PlinkoBoardProps {
  rows: number;
  numWinners: number;
  currentParticipants: number;
  maxParticipants: number;
  dropBall: () => Promise<number[]>;
  isHost: boolean;
  isManual: boolean;
  isActive: boolean;
  isCompleted: boolean;
}

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({
  rows,
  numWinners,
  currentParticipants,
  maxParticipants,
  dropBall,
  isHost,
  isManual,
  isActive,
  isCompleted,
}) => {
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [currentBall, setCurrentBall] = useState<number>(0);
  const [popUp, setPopUp] = useState<{ message: string; alpha: number } | null>(
    null
  );

  const dotSize = 6;
  const spacingX = 40;
  const spacingY = 20;

  const handleDrop = async () => {
    if (isDropping || !isHost || !isManual || !isActive || isCompleted) return;
    setIsDropping(true);
    setSelectedWinners([]);
    setCurrentBall(0);
    setPopUp(null);

    try {
      const winners = await dropBall();
      setSelectedWinners(winners.slice(0, numWinners)); // Ensure correct number of winners
    } catch (error) {
      console.error("Error dropping ball:", error);
      setIsDropping(false);
    }
  };

  useEffect(() => {
    if (selectedWinners.length === 0 || currentBall >= numWinners) {
      setIsDropping(false);
      if (currentBall >= numWinners && selectedWinners.length > 0) {
        setPopUp({
          message: `Winner${numWinners > 1 ? "s" : ""}: ${selectedWinners
            .map((w) => `#${w + 1}`)
            .join(", ")}!`,
          alpha: 1,
        });
        const fadeOut = setInterval(() => {
          setPopUp((prev) =>
            prev ? { ...prev, alpha: prev.alpha - 0.02 } : null
          );
        }, 50);
        setTimeout(() => {
          clearInterval(fadeOut);
          setPopUp(null);
        }, 3000);
      }
      return;
    }

    const animateBall = async () => {
      for (let row = 0; row < rows; row++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setCurrentBall((prev) => prev + 1);
    };
    animateBall();
  }, [selectedWinners, currentBall, numWinners, rows]);

  const renderPlinkoGrid = () => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
      const dots = [];
      const maxDots = row + 1;
      for (let col = 0; col < maxDots; col++) {
        dots.push(
          <div
            key={`${row}-${col}`}
            className="mx-2 h-2 w-2 bg-gray-300 rounded-full"
          />
        );
      }
      grid.push(
        <div key={row} className="flex justify-center w-full my-1">
          {dots}
        </div>
      );
    }
    return grid;
  };

  const renderBalls = () => {
    return selectedWinners.map((slot, ballIndex) => {
      if (ballIndex > currentBall) return null;

      const row = Math.min(rows - 1, rows);
      const rowIndex = Math.floor(slot / 15);
      const colIndex = slot % 15;
      const xOffset = colIndex * spacingX - (15 * spacingX) / 2 + spacingX / 2;
      const yOffset = row * spacingY + rowIndex * 40; // Adjust for two rows

      const ballStyle = useSpring({
        from: { x: 0, y: 0 },
        to: { x: xOffset, y: yOffset },
        config: { duration: 300 * rows },
        reset: true,
      });

      return (
        <animated.div
          key={ballIndex}
          className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-red-600 shadow-[0_0_10px_2px_rgba(255,165,0,0.8)] animate-pulse"
          style={{
            ...ballStyle,
            top: "0px",
            left: `calc(50% - ${dotSize / 2}px)`,
          }}
        />
      );
    });
  };

  return (
    <div className="relative bg-gray-900 rounded-2xl p-4 shadow-2xl border border-purple-800 h-[calc(100vh-300px)] max-h-[600px] min-h-[400px] overflow-hidden">
      {isHost && isManual && isActive && !isCompleted && (
        <button
          onClick={handleDrop}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDropping || !isManual}
        >
          Drop Ball
        </button>
      )}
      <div className="mt-12 flex flex-col items-center h-full">
        {renderPlinkoGrid()}
        {renderBalls()}
        <ParticipantSlots
          maxParticipants={maxParticipants}
          currentParticipants={currentParticipants}
          selectedWinners={selectedWinners}
        />
        {popUp && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 top-1/2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg animate-pulse"
            style={{ opacity: popUp.alpha }}
          >
            {popUp.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlinkoBoard;
