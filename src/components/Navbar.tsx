import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown, Settings, Play } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';

interface SearchResult {
  _id: string;
  title: string;
  image?: string;
  thumbnail?: string;
  type: 'anime' | 'movie';
}

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { animes } = useAnime();
  const { movies } = useMovies();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { currentUser, isAdmin } = useAuth();

  const categories = [
    { name: 'Action', color: 'from-red-800 to-red-600' },
    { name: 'Romance', color: 'from-purple-800 to-purple-600' },
    { name: 'Comedy', color: 'from-yellow-800 to-green-600' },
    { name: 'Drama', color: 'from-blue-800 to-blue-600' },
    { name: 'Fantasy', color: 'from-purple-800 to-purple-600' },
    { name: 'Horror', color: 'from-red-900 to-red-800' },
    { name: 'Mystery', color: 'from-blue-900 to-blue-700' },
    { name: 'Sci-Fi', color: 'from-teal-800 to-teal-600' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle scroll to top
  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle click outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim()) {
      // Search in animes
      const animeResults = animes
        .filter(anime => 
          anime.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
        .map(anime => ({
          _id: anime._id,
          title: anime.title,
          image: anime.image,
          type: 'anime' as const
        }));

      // Search in movies
      const movieResults = movies
        .filter(movie => 
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 2)
        .map(movie => ({
          _id: movie._id || '',
          title: movie.title,
          thumbnail: movie.thumbnail,
          type: 'movie' as const
        }));

      setSearchResults([...animeResults, ...movieResults]);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, animes, movies]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchResults.length > 0) {
        // If there are results, navigate to the first one
        const firstResult = searchResults[0];
        const path = firstResult.type === 'anime' ? `/anime/${firstResult._id}` : `/watch/movie/${firstResult._id}`;
        navigate(path);
      } else {
        // If no results, go to search page
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    const path = result.type === 'anime' ? `/anime/${result._id}` : `/watch/movie/${result._id}`;
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle click outside categories
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-black/80 backdrop-blur-2xl fixed w-full top-0 z-50 transition-all duration-200 border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-[56px] lg:h-20">
          <div className="flex items-center gap-3 lg:gap-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-8 h-8 flex items-center justify-center text-white"
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block h-0.5 rounded-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? 'top-[11px] w-6 -rotate-45' 
                    : 'top-[5px] w-6'
                }`} />
                <span className={`absolute left-0 block h-0.5 rounded-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? 'opacity-0 w-0' 
                    : 'top-[11px] w-4 opacity-100'
                }`} />
                <span className={`absolute left-0 block h-0.5 rounded-full bg-current transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? 'top-[11px] w-6 rotate-45' 
                    : 'top-[17px] w-6'
                }`} />
              </div>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-8 lg:h-10 w-auto"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-10 space-x-2">
              <Link
                to="/"
                onClick={handleHomeClick}
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/') 
                    ? 'text-[#f47521] bg-white/5' 
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/category/season-trending"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/category/season-trending')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Season Trending
              </Link>
              <Link
                to="/category/hindi-dub"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/category/hindi-dub')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Hindi Dub
              </Link>
              <Link
                to="/category/telugu-dub"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/category/telugu-dub')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Telugu Dub
              </Link>
              <Link
                to="/movies"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/movies')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Movies
              </Link>
            </div>
          </div>

          {/* Categories and Search */}
          <div className="flex items-center gap-2">
            {/* Admin Link - Only show if user is admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`p-2 lg:p-2.5 text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2 ${
                  location.pathname.startsWith('/admin') ? 'text-[#f47521] bg-white/5' : ''
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}

            {/* Categories Dropdown */}
            <div ref={categoriesRef} className="relative">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="p-2 lg:p-2.5 text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2"
              >
                <span className="hidden lg:inline">Browse</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Categories Dropdown Menu */}
              {isCategoriesOpen && (
                <div className="absolute right-0 mt-2 w-[280px] sm:w-[320px] bg-black/90 backdrop-blur-2xl rounded-lg shadow-xl border border-white/10 overflow-hidden">
                  <div className="p-1.5">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                      {categories.map((category) => (
                        <Link
                          key={category.name}
                          to={`/category/${category.name.toLowerCase()}`}
                          className="group relative overflow-hidden rounded-md aspect-[3/1]"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                          <div className="relative h-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {category.name}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => {
                  if (isSearchOpen) {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  } else {
                    setIsSearchOpen(true);
                    if (searchInputRef.current) {
                      searchInputRef.current.focus();
                    }
                  }
                }}
                className="p-2 lg:p-2.5 text-white hover:bg-white/5 rounded-lg transition-all"
                aria-label="Search"
              >
                <Search className="h-6 w-6 lg:h-7 lg:w-7" />
              </button>

              {isSearchOpen && (
                <div
                  ref={searchRef}
                  className="absolute top-full right-0 mt-2 w-[320px] md:w-[400px] bg-black/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 overflow-hidden"
                >
                  <div className="p-3">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search anime or movies..."
                        className="w-full bg-[#141821] text-white rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f47521] placeholder-white/50 text-sm"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-white/70 hover:text-white" />
                        </button>
                      )}
                    </form>

                    {searchResults.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {searchResults.map((result) => (
                          <button
                            key={`${result.type}-${result._id}`}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-[#141821] rounded-lg transition-colors text-left"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={result.type === 'anime' ? result.image : result.thumbnail}
                                alt={result.title}
                                className="h-14 w-24 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] font-medium text-[#f47521] capitalize">
                                {result.type}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium text-sm line-clamp-1">{result.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[10px] text-[#f47521] capitalize flex items-center gap-1">
                                  <Play className="h-3 w-3" />
                                  {result.type === 'anime' ? 'Watch Now' : 'Play Movie'}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                      <div className="mt-3 text-center py-4">
                        <Search className="h-6 w-6 text-[#f47521] mx-auto mb-2 opacity-50" />
                        <p className="text-white text-sm">No results found</p>
                        <p className="text-[#f47521] text-xs mt-0.5">Try different keywords</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/90 backdrop-blur-2xl absolute left-0 right-0 top-[56px] border-t border-white/10">
            <div className="flex flex-col py-1">
              <Link
                to="/"
                onClick={() => {
                  handleHomeClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/') 
                    ? 'text-[#f47521] bg-white/5' 
                    : 'text-white hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/category/season-trending"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/category/season-trending')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Season Trending
              </Link>
              <Link
                to="/category/hindi-dub"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/category/hindi-dub')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hindi Dub
              </Link>
              <Link
                to="/category/telugu-dub"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/category/telugu-dub')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Telugu Dub
              </Link>
              <Link
                to="/movies"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/movies')
                    ? 'text-[#f47521] bg-white/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Movies
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;