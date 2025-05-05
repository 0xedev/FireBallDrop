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
  for (let i = 0; i < maxParticipants; i++) {
    const isActive = i < currentParticipants;
    slots.push(
      <div
        key={i}
        className={`w-8 h-8 ${
          isActive ? "bg-green-500" : "bg-red-500"
        } text-white flex items-center justify-center rounded mx-1`}
      >
        {i}
      </div>
    );
  }

  return <div className="flex justify-center mt-4">{slots}</div>;
};

export default ParticipantSlots;
