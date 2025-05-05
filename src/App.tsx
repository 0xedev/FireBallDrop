import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import CreateDropPage from "./pages/CreateDropPage";
import AvailableDropsPage from "./pages/AvailableDropsPage";
import UpcomingDropsPage from "./pages/UpcomingDropsPage";
import EndedDropsPage from "./pages/EndedDropsPage";
import MyDropsPage from "./pages/MyDropsPage";
import DropDetailPage from "./pages/DropDetailPage";

const App: React.FC = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  return (
    <Router>
      <div className="min-h-screen bg-purple-900 text-white">
        <Navbar
          contract={contract}
          setContract={setContract}
          account={account}
          setAccount={setAccount}
        />
        <div className="container mx-auto p-4">
          <Routes>
            <Route
              path="/"
              element={<CreateDropPage contract={contract} account={account} />}
            />
            <Route
              path="/available"
              element={
                <AvailableDropsPage contract={contract} account={account} />
              }
            />
            <Route
              path="/upcoming"
              element={
                <UpcomingDropsPage contract={contract} account={account} />
              }
            />
            <Route
              path="/ended"
              element={<EndedDropsPage contract={contract} account={account} />}
            />
            <Route
              path="/my-drops"
              element={<MyDropsPage contract={contract} account={account} />}
            />
            <Route
              path="/drop/:dropId"
              element={<DropDetailPage contract={contract} account={account} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
