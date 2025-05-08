interface Window {
  ethereum?: any;
}

export interface DropInfo {
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

export interface Participant {
  address: string;
  name: string;
  slot: number;
}

export interface LeaderboardEntry {
  address: string;
  wins: number;
  totalPrize: string; // In ETH
}
