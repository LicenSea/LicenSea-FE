import { useState } from "react";
import Main from "./pages/Main";
import { Route, Routes } from "react-router";
import { Marketplace } from "./pages/Marketplace";
import Work from "./pages/Work";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/work/:id" element={<Work />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
