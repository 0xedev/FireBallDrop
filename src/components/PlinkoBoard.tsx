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
  const [paths, setPaths] = useState<number[][]>([]);
  const [currentBall, setCurrentBall] = useState<number>(0);
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);

  const dotSize = 6;
  const spacingX = 40;
  const spacingY = 20;
  const slotCount = Math.min(currentParticipants, maxParticipants);

  const generatePath = (rows: number): number[] => {
    const path: number[] = [0];
    let position = 0;

    for (let row = 1; row < rows; row++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      position += direction;
      path.push(position);
    }

    const slot = Math.min(
      Math.max(Math.floor((position + rows) / 2), 0),
      slotCount - 1
    );
    return path.map((p, i) => (i === path.length - 1 ? slot : p));
  };

  const handleDrop = async () => {
    if (isDropping || !isHost || !isManual || !isActive || isCompleted) return;
    setIsDropping(true);
    setPaths([]);
    setCurrentBall(0);
    setSelectedWinners([]);

    try {
      const winners = await dropBall();
      const newPaths: number[][] = [];
      const tempWinners: number[] = [];

      for (let i = 0; i < numWinners; i++) {
        const path = generatePath(rows);
        const landingSlot = path[path.length - 1];
        tempWinners.push(landingSlot);
        newPaths.push(path);
      }

      setSelectedWinners(tempWinners);
      setPaths(newPaths);
      winners.forEach((winner, idx) => {
        if (tempWinners[idx] !== winner) {
          console.warn(
            `Mismatch: Expected winner ${winner}, landed in slot ${tempWinners[idx]}`
          );
        }
      });
    } catch (error) {
      console.error("Error dropping ball:", error);
      setIsDropping(false);
    }
  };

  useEffect(() => {
    if (paths.length === 0 || currentBall >= numWinners) {
      setIsDropping(false);
      return;
    }

    const path = paths[currentBall];
    const animateBall = async () => {
      for (let row = 0; row < path.length; row++) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setCurrentBall((prev) => prev + 1);
    };
    animateBall();
  }, [paths, currentBall, numWinners]);

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
    return paths.map((path, ballIndex) => {
      if (ballIndex > currentBall) return null;

      const row = Math.min(
        ballIndex === currentBall ? path.length - 1 : path.length,
        path.length
      );
      const position = path[row] || 0;
      const xOffset = position * spacingX - (slotCount * 40) / 2 + 20; // Adjusted for slot width
      const yOffset = row * spacingY;

      const ballStyle = useSpring({
        from: { x: 0, y: 0 },
        to: { x: xOffset, y: yOffset },
        config: { duration: 300 },
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
          disabled={isDropping}
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
      </div>
    </div>
  );
};

export default PlinkoBoard;
