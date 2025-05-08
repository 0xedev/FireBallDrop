import React from "react";

interface ParticipantSlotsProps {
  maxParticipants: number;
  currentParticipants: number;
  selectedWinners?: number[];
}

const ParticipantSlots: React.FC<ParticipantSlotsProps> = ({
  maxParticipants,
  currentParticipants,
  selectedWinners = [],
}) => {
  const slots = [];
  const colorScheme = [
    "bg-red-600",
    "bg-red-500",
    "bg-red-400",
    "bg-orange-500",
    "bg-orange-400",
    "bg-yellow-500",
    "bg-yellow-400",
    "bg-yellow-300",
    "bg-yellow-200",
  ];

  const maxSlots = Math.min(maxParticipants, 30);
  for (let i = 0; i < maxSlots; i++) {
    const isActive = i < currentParticipants;
    const isWinner = selectedWinners.includes(i);
    const colorIndex = i % colorScheme.length;
    slots.push(
      <div
        key={i}
        className={`mx-1 px-1 py-1 text-xs text-center rounded w-8 h-8 flex items-center justify-center text-white ${
          isActive
            ? isWinner
              ? "bg-green-500 border-green-700"
              : colorScheme[colorIndex]
            : "bg-gray-600 opacity-50"
        } transition-all duration-300 hover:scale-110 ${
          isActive ? "shadow-lg" : ""
        }`}
      >
        {i + 1}
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-4 overflow-x-auto">
      <div className="flex flex-col">
        <div className="flex mb-2">{slots.slice(0, 15)}</div>
        <div className="flex">{slots.slice(15, 30)}</div>
      </div>
    </div>
  );
};

export default ParticipantSlots;
