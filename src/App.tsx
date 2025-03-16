import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
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
import Movies from './pages/Movies';
import WatchMovie from './pages/WatchMovie';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import { AnimeProvider } from './context/AnimeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { MovieProvider } from './context/MovieContext';
import MovieAdminPanel from './pages/MovieAdminPanel';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AnimeProvider>
            <MovieProvider>
              <ScrollToTop />
              <Navbar />
              <main className="min-h-screen bg-[#141821]">
                <AppRoutes />
              </main>
              <Footer />
            </MovieProvider>
          </AnimeProvider>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;