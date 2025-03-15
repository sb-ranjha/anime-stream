import React, { useState } from 'react';
import { useAnime } from '../context/AnimeContext';
import { Link } from 'react-router-dom';
import { Play, Search, Star, Clock, Calendar } from 'lucide-react';

const Movies = () => {
  const { animes } = useAnime();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  // Filter movies
  const movies = animes.filter(anime => anime.isMovie);

  // Get unique categories from movies
  const categories = Array.from(new Set(movies.map(movie => movie.category)));

  // Apply filters
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || movie.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-20 min-h-screen bg-[#141821]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-[#f47521]" />
            Anime Movies
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#f47521] focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-6">
            {filteredMovies.map((movie) => (
              <Link 
                key={movie._id}
                to={`/watch/${movie._id}`}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredMovie(movie._id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                {/* Movie Card */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* HD Badge */}
                  <div className="absolute top-2 right-2 bg-[#f47521]/90 text-white text-xs font-bold px-2 py-1 rounded">
                    HD
                  </div>

                  {/* CC Badge */}
                  <div className="absolute top-2 left-2 bg-gray-800/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <span className="text-[10px]">CC</span>
                    <span className="text-[10px]">1</span>
                  </div>

                  {/* Movie Label */}
                  <div className="absolute top-2 right-14 bg-gray-800/90 text-white text-xs font-bold px-2 py-1 rounded">
                    Movie
                  </div>

                  {/* Hover Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
                    hoveredMovie === movie._id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>
                      
                      <div className="flex items-center gap-3 text-sm text-white/80 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#f47521]" />
                          <span>{movie.rating.toFixed(2)}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>120m</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                        <span className="px-2 py-0.5 bg-gray-700 rounded">{movie.category}</span>
                        <span className="px-2 py-0.5 bg-gray-700 rounded">Japanese</span>
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
                    <span className="text-[#f47521]">{movie.category}</span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-[#f47521]" />
                      <span className="text-gray-400">{movie.rating.toFixed(2)}</span>
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