import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';
import WatchAnime from './pages/WatchAnime';
import AnimeDetails from './pages/AnimeDetails';
import HindiDubbed from './pages/HindiDubbed';
import TeluguDubbed from './pages/TeluguDubbed';
import NewEpisodes from './pages/NewEpisodes';
import SeasonTrending from './pages/SeasonTrending';
import CategoryPage from './pages/CategoryPage';
import { AnimeProvider } from './context/AnimeContext';

function App() {
  return (
    <Router>
      <AnimeProvider>
        <div className="flex flex-col min-h-screen bg-black text-gray-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/anime/:_id" element={<AnimeDetails />} />
              <Route path="/watch/:animeId/:seasonId/:episodeId" element={<WatchAnime />} />
              <Route path="/category/season-trending" element={<SeasonTrending />} />
              <Route path="/category/hindi-dub" element={<HindiDubbed />} />
              <Route path="/category/telugu-dub" element={<TeluguDubbed />} />
              <Route path="/new-episodes" element={<NewEpisodes />} />
              <Route path="/category/:category" element={<CategoryPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AnimeProvider>
    </Router>
  );
}

export default App;