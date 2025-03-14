import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';
import WatchAnime from './pages/WatchAnime';
import AnimeDetails from './pages/AnimeDetails';
import { AnimeProvider } from './context/AnimeContext';

function App() {
  return (
    <Router>
      <AnimeProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-[#141821] text-gray-900 dark:text-white transition-colors duration-200">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/watch/:animeId/:seasonId/:episodeId" element={<WatchAnime />} />
              <Route path="/popular" element={<Home />} />
              <Route path="/hindi-dub" element={<Home />} />
              <Route path="/telugu-dub" element={<Home />} />
              <Route path="/new-episodes" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AnimeProvider>
    </Router>
  );
}

export default App;