import React, { useState, useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";

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
  const [winnerIndices, setWinnerIndices] = useState<number[]>([]);

  const dotSize = 8; // Smaller dots like the old UI
  const spacingX = 48; // Adjusted spacing to match the old UI
  const spacingY = 24; // Adjusted spacing to match the old UI
  const slotWidth = 32; // Matches the multiplier box width in the old UI

  const generatePath = (rows: number): number[] => {
    const path: number[] = [0];
    let position = 0;

    for (let row = 1; row < rows; row++) {
      const direction = Math.random() > 0.5 ? 1 : -1;
      position += direction;
      path.push(position);
    }

    const slotCount = Math.min(currentParticipants, maxParticipants);
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
    setWinnerIndices([]);

    try {
      const winners = await dropBall();
      setWinnerIndices(winners);

      const newPaths: number[][] = [];
      for (let i = 0; i < numWinners; i++) {
        const path = generatePath(rows);
        path[path.length - 1] = winners[i];
        newPaths.push(path);
      }
      setPaths(newPaths);
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
            className="mx-3 h-2 w-2 bg-white rounded-full" // Matches old UI dot style
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
      const xOffset =
        position * spacingX - (maxParticipants * slotWidth) / 2 + slotWidth / 2;
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
          className="absolute w-4 h-4 bg-yellow-400 rounded-full plinko-ball" // Slightly larger ball
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
    <div className="relative h-[600px] bg-gray-900 rounded-md p-4">
      {" "}
      {/* Matches old UI container */}
      {isHost && isManual && isActive && !isCompleted && (
        <button
          onClick={handleDrop}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-black font-bold py-4 px-6 rounded-md w-1/3" // Matches old UI button style
          disabled={isDropping}
        >
          Drop Ball
        </button>
      )}
      <div className="mt-12 flex flex-col items-center">
        {renderPlinkoGrid()}
        {renderBalls()}
      </div>
    </div>
  );
};

export default PlinkoBoard;
