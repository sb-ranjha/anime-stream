import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, X, ChevronDown } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

interface SearchResult {
  _id: string;
  title: string;
  image: string;
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
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
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
      const results = animes
        .filter(anime => 
          anime.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map(anime => ({
          _id: anime._id,
          title: anime.title,
          image: anime.image
        }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, animes]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchResults([]);
      setSearchQuery('');
    }
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
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 lg:h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center ml-10 space-x-2">
              <Link
                to="/"
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
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 lg:p-2.5 text-white hover:bg-white/5 rounded-lg transition-all"
                aria-label="Search"
              >
                <Search className="h-6 w-6 lg:h-7 lg:w-7" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-black/90 backdrop-blur-2xl rounded-xl shadow-xl border border-white/10 overflow-hidden mx-4 sm:mx-0">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search anime..."
                      className="w-full px-4 py-3 lg:px-5 lg:py-4 text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 text-base"
                    />
                    {searchResults.length > 0 && (
                      <div className="border-t border-white/10 py-2 max-h-80 overflow-auto">
                        {searchResults.map(result => (
                          <Link
                            key={result._id}
                            to={`/anime/${result._id}`}
                            className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg"
                            onClick={() => setSearchQuery('')}
                          >
                            <img
                              src={result.image}
                              alt={result.title}
                              className="w-10 h-14 lg:w-12 lg:h-16 object-cover rounded-lg"
                            />
                            <span className="text-sm lg:text-base text-white line-clamp-2 font-medium">
                              {result.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </form>
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
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/') 
                    ? 'text-[#f47521] bg-white/5' 
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
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