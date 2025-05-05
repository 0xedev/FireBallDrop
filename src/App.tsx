import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import CreateDropPage from "./pages/CreateDropPage";
import AvailableDropsPage from "./pages/AvailableDropsPage";
import UpcomingDropsPage from "./pages/UpcomingDropsPage";
import EndedDropsPage from "./pages/EndedDropsPage";
import MyDropsPage from "./pages/MyDropsPage";
import DropDetailPage from "./pages/DropDetailPage";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-purple-900 text-white">
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<CreateDropPage />} />
            <Route path="/available" element={<AvailableDropsPage />} />
            <Route path="/upcoming" element={<UpcomingDropsPage />} />
            <Route path="/ended" element={<EndedDropsPage />} />
            <Route path="/my-drops" element={<MyDropsPage />} />
            <Route path="/drop/:dropId" element={<DropDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
