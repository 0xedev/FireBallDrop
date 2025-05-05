import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { getContract } from "../utils/contract";

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  useEffect(() => {
    const setupContract = async () => {
      if (isConnected) {
        const contract = await getContract();
        // Store contract globally if needed (e.g., in context)
      }
    };
    setupContract();
  }, [isConnected]);

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
      <div>
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Disconnect
          </button>
        ) : (
          connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Connect Wallet
            </button>
          ))
        )}
        {address && (
          <span className="ml-2">{`${address.slice(0, 6)}...${address.slice(
            -4
          )}`}</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
