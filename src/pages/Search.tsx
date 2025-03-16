import React, { useState, useEffect } from 'react';
import { useAnime } from '../context/AnimeContext';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Episode {
  _id: string;
  title: string;
  number: number;
  doodstream?: string;
  megacloud?: string;
  mega?: string;
  streamtape?: string;
  thumbnail: string;
  duration: string;
  releaseDate: string;
  isNew?: boolean;
}

interface Season {
  _id: string;
  number: number;
  episodes: Episode[];
}

interface Anime {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  trending: boolean;
  seasonTrending?: boolean;
  rating: number;
  seasons: Season[];
  isHindiDub?: boolean;
  isTeluguDub?: boolean;
  isNewEpisode?: boolean;
  isMovie?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

function Search() {
  const { animes } = useAnime();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>(animes);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults(animes);
      return;
    }

    const filteredResults = animes.filter((anime) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        anime.title.toLowerCase().includes(searchTerm) ||
        anime.description.toLowerCase().includes(searchTerm) ||
        anime.category.toLowerCase().includes(searchTerm)
      );
    });

    setSearchResults(filteredResults);
  }, [searchQuery, animes]);

  return (
    <div className="min-h-screen bg-[#141821] pt-14 md:pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Search Anime
          </h1>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or category..."
              className="w-full bg-[#1a1b1f] text-white placeholder-gray-400 rounded-xl px-12 py-4 focus:outline-none focus:ring-2 focus:ring-[#f47521] border border-white/10"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {searchResults.map((anime) => (
            <Link
              key={anime._id}
              to={`/anime/${anime._id}`}
              className="group relative overflow-hidden rounded-xl aspect-[2/3] bg-[#1a1b1f] hover:scale-105 transition-transform duration-300"
            >
              <img
                src={anime.image}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2">
                  {anime.title}
                </h3>
                <div className="mt-1">
                  <span className="text-xs bg-[#f47521]/20 text-[#f47521] px-2 py-0.5 rounded-full">
                    {anime.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Message */}
        {searchResults.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-400 text-lg">
              No anime found matching "{searchQuery}"
            </p>
            <p className="text-gray-500 mt-2">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;