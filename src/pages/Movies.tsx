import React, { useState } from 'react';
import { useMovies } from '../context/MovieContext';
import { Link } from 'react-router-dom';
import { Play, Search, Star, Clock, Calendar } from 'lucide-react';

interface Movie {
  _id: string;
  title: string;
  description: string;
  releaseDate: string;
  duration: string;
  genre: string[];
  thumbnail: string;
}

const Movies = () => {
  const { movies, loading } = useMovies();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  // Get unique genres from movies
  const genres = Array.from(new Set(movies.flatMap(movie => movie.genre)));

  // Apply filters
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !selectedGenre || movie.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141821]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f47521]"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-[#141821]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-[#f47521]" />
            Movies
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:w-64">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#f47521] focus:outline-none"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#f47521] focus:outline-none"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6">
            {(filteredMovies as Movie[]).map((movie) => (
              <Link 
                key={movie._id}
                to={`/watch/movie/${movie._id}`}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredMovie(movie._id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                {/* Movie Card */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={movie.thumbnail}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* HD Badge */}
                  <div className="absolute top-2 right-2 bg-[#f47521]/90 text-white text-xs font-bold px-2 py-1 rounded">
                    HD
                  </div>

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
                    hoveredMovie === movie._id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>
                      
                      <div className="flex items-center gap-3 text-sm text-white/80 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{movie.duration}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(movie.releaseDate).getFullYear()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-white/70 mb-3">
                        {movie.genre.map((g, index) => (
                          <span key={index} className="px-2 py-0.5 bg-gray-700 rounded">{g}</span>
                        ))}
                      </div>

                      <p className="text-sm text-white/70 line-clamp-2 mb-4">
                        {movie.description}
                      </p>

                      <button 
                        className="w-full bg-[#f47521] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#f47521]/90 transition-colors text-base font-medium"
                      >
                        <Play className="h-5 w-5" />
                        Watch Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Movie Info (Always Visible) */}
                <div className="mt-3 space-y-1.5">
                  <h3 className="text-white font-medium text-base line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#f47521]">{movie.genre[0]}</span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#f47521]" />
                      <span className="text-gray-400">{movie.duration}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 text-lg mb-2">No movies found</div>
            <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies; 