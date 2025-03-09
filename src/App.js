import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WeatherDashboard from "./dashboard";
import PlacesPage from "./placePage";
import "./App.css"; // Import the CSS file

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WeatherDashboard />} />
        <Route path="/places/:cityName" element={<PlacesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;