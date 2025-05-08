import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";
// import { getContract } from "../utils/contract";

const Navbar: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  // const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const setupContract = async () => {
      if (isConnected) {
        // const contract = await getContract();
        // Store contract globally if needed (e.g., in context)
      }
    };
    setupContract();
  }, [isConnected]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 text-purple-300 animate-pulse-slow"
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">
              FireBallDrop
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              Home
            </Link>
            <Link
              to="/create"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/create")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              Create Drop
            </Link>
            <Link
              to="/available"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/available")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              Available Drops
            </Link>
            {/* <Link
              to="/upcoming"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/upcoming")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              Upcoming Drops
            </Link> */}
            <Link
              to="/ended"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/ended")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              Ended Drops
            </Link>
            <Link
              to="/my-drops"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/my-drops")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              My Drops
            </Link>
            <Link
              to="/leaderboard"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                isActive("/leaderboard")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
            >
              leaderboard
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="bg-purple-800 px-4 py-2 rounded-xl text-sm font-medium text-purple-100 shadow-md">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => connect({ connector })}
                    className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Connect Wallet
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-300 hover:text-white hover:bg-purple-700 focus:outline-none transition-all duration-300"
            >
              <svg
                className="h-8 w-8"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-4 space-y-1 bg-purple-900 bg-opacity-95 backdrop-blur-md rounded-b-lg shadow-lg">
            <Link
              to="/"
              className={`block px-4 py-2.5 rounded-md text-lg font-medium ${
                isActive("/")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Create Drop
            </Link>
            <Link
              to="/available"
              className={`block px-4 py-2.5 rounded-md text-lg font-medium ${
                isActive("/available")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Available Drops
            </Link>
            <Link
              to="/upcoming"
              className={`block px-4 py-2.5 rounded-md text-lg font-medium ${
                isActive("/upcoming")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Upcoming Drops
            </Link>
            <Link
              to="/ended"
              className={`block px-4 py-2.5 rounded-md text-lg font-medium ${
                isActive("/ended")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Ended Drops
            </Link>
            <Link
              to="/my-drops"
              className={`block px-4 py-2.5 rounded-md text-lg font-medium ${
                isActive("/my-drops")
                  ? "bg-purple-700 text-white shadow-inner"
                  : "text-gray-300 hover:bg-purple-700 hover:text-white hover:shadow-md"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              My Drops
            </Link>

            {/* Mobile Wallet Connection */}
            <div className="pt-4 pb-3 border-t border-purple-800">
              {isConnected ? (
                <div className="flex flex-col space-y-3">
                  <span className="bg-purple-800 px-4 py-2 rounded-xl text-sm font-medium text-purple-100 shadow-md w-fit mx-auto">
                    {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                  <button
                    onClick={() => {
                      disconnect();
                      setIsMenuOpen(false);
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium w-full hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div>
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connect({ connector });
                        setIsMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium w-full hover:from-blue-700 hover:to-purple-800 transition-all duration-300 shadow-md"
                    >
                      Connect Wallet
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
