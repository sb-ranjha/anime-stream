import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; image: string }>>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { searchAnimes } = useAnime();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = searchAnimes(query)
        .slice(0, 5)
        .map(anime => ({
          id: anime.id,
          title: anime.title,
          image: anime.image
        }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

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

  return (
    <nav className="bg-[#1a1b1e]/40 backdrop-blur-2xl fixed w-full top-0 z-50 transition-all duration-200 border-b border-white/5">
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
                    ? 'text-[#f47521] bg-[#f47521]/5' 
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/popular"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/popular')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Popular
              </Link>
              <Link
                to="/hindi-dub"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/hindi-dub')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Hindi Dub
              </Link>
              <Link
                to="/telugu-dub"
                className={`px-4 py-2.5 rounded-lg text-base font-semibold transition-all ${
                  isActive('/telugu-dub')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:text-[#f47521] hover:bg-white/5'
                }`}
              >
                Telugu Dub
              </Link>
            </div>
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
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-[#1a1b1e]/60 backdrop-blur-2xl rounded-xl shadow-xl border border-white/10 overflow-hidden mx-4 sm:mx-0">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search anime..."
                    className="w-full px-4 py-3 lg:px-5 lg:py-4 text-white bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 text-base"
                  />
                  {searchResults.length > 0 && (
                    <div className="border-t border-white/10 py-2 max-h-80 overflow-auto">
                      {searchResults.map(result => (
                        <Link
                          key={result.id}
                          to={`/anime/${result.id}`}
                          className="flex items-center gap-4 px-4 py-2 lg:px-5 lg:py-3 hover:bg-white/10 transition-all"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1b1e]/60 backdrop-blur-2xl absolute left-0 right-0 top-[56px] border-t border-white/10">
            <div className="flex flex-col py-1">
              <Link
                to="/"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/') 
                    ? 'text-[#f47521] bg-[#f47521]/5' 
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/popular"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/popular')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Popular
              </Link>
              <Link
                to="/hindi-dub"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/hindi-dub')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hindi Dub
              </Link>
              <Link
                to="/telugu-dub"
                className={`px-4 py-2.5 text-base font-medium transition-all ${
                  isActive('/telugu-dub')
                    ? 'text-[#f47521] bg-[#f47521]/5'
                    : 'text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Telugu Dub
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;