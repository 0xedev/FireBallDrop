import React from "react";

interface ParticipantSlotsProps {
  maxParticipants: number;
  currentParticipants: number;
}

const ParticipantSlots: React.FC<ParticipantSlotsProps> = ({
  maxParticipants,
  currentParticipants,
}) => {
  const slots = [];
  const colorScheme = [
    "bg-red-600", // 11x
    "bg-red-500", // 41x
    "bg-red-400", // 9x
    "bg-orange-500", // 5x
    "bg-orange-400", // 3x
    "bg-yellow-500", // 1.5x
    "bg-yellow-400", // 1x
    "bg-yellow-300", // 0.5x
    "bg-yellow-200", // 0.3x
  ];

  for (let i = 0; i < maxParticipants; i++) {
    const isActive = i < currentParticipants;
    const colorIndex = i % colorScheme.length; // Cycle through colors
    slots.push(
      <div
        key={i}
        className={`mx-1 px-1 py-1 text-xs text-center rounded w-8 h-8 flex items-center justify-center text-white ${
          isActive ? colorScheme[colorIndex] : "bg-gray-600 opacity-50"
        } transition-all duration-300 hover:scale-110 ${
          isActive ? "shadow-lg" : ""
        }`}
      >
        {i + 1}
      </div>
    );
  }

  return <div className="flex justify-center mt-4">{slots}</div>;
};

export default ParticipantSlots;
