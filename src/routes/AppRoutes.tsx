import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Login from '../pages/Login';
import AnimeDetails from '../pages/AnimeDetails';
import WatchAnime from '../pages/WatchAnime';
import SeasonTrending from '../pages/SeasonTrending';
import HindiDubbed from '../pages/HindiDubbed';
import TeluguDubbed from '../pages/TeluguDubbed';
import NewEpisodes from '../pages/NewEpisodes';
import CategoryPage from '../pages/CategoryPage';
import Movies from '../pages/Movies';
import WatchMovie from '../pages/WatchMovie';
import AdminPanel from '../pages/AdminPanel';
import MovieAdminPanel from '../pages/MovieAdminPanel';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/login" element={<Login />} />

      {/* Anime Routes */}
      <Route path="/anime/:_id" element={<AnimeDetails />} />
      <Route path="/watch/anime/:animeId/:seasonId/:episodeId" element={<WatchAnime />} />
      <Route path="/category/season-trending" element={<SeasonTrending />} />
      <Route path="/category/hindi-dub" element={<HindiDubbed />} />
      <Route path="/category/telugu-dub" element={<TeluguDubbed />} />
      <Route path="/new-episodes" element={<NewEpisodes />} />
      <Route path="/category/:category" element={<CategoryPage />} />

      {/* Movie Routes */}
      <Route path="/movies" element={<Movies />} />
      <Route path="/watch/movie/:movieId" element={<WatchMovie />} />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/anime" 
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/movies" 
        element={
          <ProtectedRoute>
            <MovieAdminPanel />
          </ProtectedRoute>
        } 
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 