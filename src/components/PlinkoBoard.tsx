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

  const dotSize = 24;
  const spacingX = 32;
  const spacingY = 48;
  const slotWidth = 40;

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
            className="w-6 h-6 bg-white rounded-full mx-1 my-1"
          />
        );
      }
      grid.push(
        <div key={row} className="flex justify-center">
          {dots}
        </div>
      );
    }
    return grid;
  };

  const renderSlots = () => {
    const slots = [];
    const slotCount = Math.min(currentParticipants, maxParticipants);
    for (let i = 0; i < slotCount; i++) {
      slots.push(
        <div
          key={i}
          className="w-10 h-10 bg-gray-600 text-white flex items-center justify-center rounded-full mx-1"
        >
          {i}
        </div>
      );
    }
    return <div className="flex justify-center mt-4">{slots}</div>;
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
          className="absolute w-6 h-6 bg-yellow-400 rounded-full"
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
    <div className="relative h-[600px] bg-gray-900 p-4 rounded">
      {isHost && isManual && isActive && !isCompleted && (
        <button
          onClick={handleDrop}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-2 py-1 rounded"
          disabled={isDropping}
        >
          Drop
        </button>
      )}
      <div className="mt-12 flex flex-col items-center">
        {renderPlinkoGrid()}
        {renderBalls()}
        {renderSlots()}
      </div>
    </div>
  );
};

export default PlinkoBoard;
