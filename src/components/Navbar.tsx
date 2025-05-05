import React, { Dispatch, SetStateAction, useEffect } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";

interface NavbarProps {
  contract: ethers.Contract | null;
  setContract: Dispatch<SetStateAction<ethers.Contract | null>>;
  account: string | null;
  setAccount: Dispatch<SetStateAction<string | null>>;
}

const Navbar: React.FC<NavbarProps> = ({
  contract,
  setContract,
  account,
  setAccount,
}) => {
  const connectWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const contractInstance = await getContract();
      setContract(contractInstance);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <Link to="/" className="text-white hover:text-yellow-400">
          Create Drop
        </Link>
        <Link to="/available" className="text-white hover:text-yellow-400">
          Available Drops
        </Link>
        <Link to="/upcoming" className="text-white hover:text-yellow-400">
          Upcoming Drops
        </Link>
        <Link to="/ended" className="text-white hover:text-yellow-400">
          Ended Drops
        </Link>
        <Link to="/my-drops" className="text-white hover:text-yellow-400">
          My Drops
        </Link>
      </div>
      <button
        onClick={connectWallet}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {account
          ? `${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </button>
    </nav>
  );
};

export default Navbar;
