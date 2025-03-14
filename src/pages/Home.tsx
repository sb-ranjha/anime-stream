import React, { useState, useEffect, useRef } from 'react';
import { Play, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import { Link } from 'react-router-dom';

interface Anime {
  id: string;
  title: string;
  image: string;
  rating: number;
  category: string;
  description: string;
  seasonTrending?: boolean;
  isHindiDub?: boolean;
  isTeluguDub?: boolean;
  seasons: Array<{
    id: string;
    episodes: Array<{
      id: string;
      number: number;
      title: string;
      duration: string;
      releaseDate: string;
      isNew?: boolean;
      thumbnail?: string;
    }>;
  }>;
}

function Home() {
  const { trending, animes } = useAnime();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimeoutRef = useRef<number>();
  
  const VISIBLE_CARDS = 5; // Number of visible cards in desktop view
  const AUTO_PLAY_INTERVAL = 5000; // 5 seconds
  const SLIDE_DURATION = 6000; // 6 seconds per slide
  const topTrending = trending.slice(0, 10); // Only take top 10 trending anime

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % topTrending.length);
    setProgress(0);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + topTrending.length) % topTrending.length);
    setProgress(0);
  };

  // Auto-slide effect
  useEffect(() => {
    if (topTrending.length === 0 || isPaused) return;

    const interval = setInterval(goToNextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [topTrending.length, isPaused]);

  // Progress bar effect
  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (SLIDE_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentSlide, isPaused]);

  // Handle mouse interactions
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) return;

    const autoPlay = () => {
      autoPlayTimeoutRef.current = setTimeout(() => {
        goToNextSlide();
        autoPlay();
      }, AUTO_PLAY_INTERVAL);
    };

    autoPlay();

    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isPaused]);

  // Top 10 section navigation for mobile and desktop
  const goToNextTopTen = () => {
    setCurrentSlide((prev) => {
      const nextIndex = prev + VISIBLE_CARDS;
      return nextIndex >= topTrending.length ? 0 : nextIndex;
    });
    setProgress(0);
  };

  const goToPrevTopTen = () => {
    setCurrentSlide((prev) => {
      const nextIndex = prev - VISIBLE_CARDS;
      return nextIndex < 0 ? Math.max(0, topTrending.length - VISIBLE_CARDS) : nextIndex;
    });
    setProgress(0);
  };

  return (
    <div className="pt-14 bg-white dark:bg-[#141821]">
      {/* Featured Trending Anime Hero Section */}
      {topTrending[currentSlide] && (
        <div 
          className="relative aspect-[3/4] md:aspect-auto md:h-[85vh] w-full group overflow-hidden bg-[#141821]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 flex justify-between w-full z-30 px-4">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToPrevSlide();
              }}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors rounded-lg"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToNextSlide();
              }}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors rounded-lg"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {/* Make entire hero section clickable */}
          <Link 
            to={`/anime/${topTrending[currentSlide].id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${topTrending[currentSlide].title}`}
          />
          
          <div className="absolute inset-0">
            {/* Main image container */}
            <div className="relative w-full h-full">
              <img
                src={topTrending[currentSlide].image}
                alt={topTrending[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out scale-105 hover:scale-100"
              />
              {/* Dark overlay - adjusted opacity for better vibrancy */}
              <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
              {/* Mobile gradient overlay with purple tint */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black via-purple-900/30 to-transparent" />
              {/* Desktop gradient overlays with enhanced colors */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141821] via-purple-900/40 to-transparent" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141821]/80 via-transparent to-[#141821]/80" />
            </div>
          </div>

          {/* Mobile Content Container */}
          <div className="md:hidden relative h-full flex flex-col justify-end z-10 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-[#f47521] px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide">New Episode</div>
              </div>
              
              <h1 className="text-lg font-bold text-white leading-tight">
                {topTrending[currentSlide].title}
              </h1>
              
              <div className="flex items-center gap-2 text-[11px] text-white/80">
                <span>Sub | Dub</span>
                <span className="text-[#f47521]">•</span>
                <span>{topTrending[currentSlide].category}</span>
                <span className="text-[#f47521]">•</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-[#f47521]" />
                  <span>{topTrending[currentSlide].rating.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <Link 
                  to={`/anime/${topTrending[currentSlide].id}`}
                  className="bg-[#f47521] text-white px-4 py-1.5 rounded text-xs font-bold flex items-center justify-center w-full uppercase tracking-wide"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" /> Start Watching
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Content Container */}
          <div className="hidden md:flex relative h-full items-end z-10">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-[15vh]">
              <div className="max-w-3xl space-y-4">
                {/* Spotlight tag */}
                <div className="inline-block bg-[#f47521] px-4 py-1.5 rounded-md">
                  <span className="text-white font-bold text-base">#{currentSlide + 1} Spotlight</span>
                </div>
                
                {/* Title */}
                <h1 className="text-6xl sm:text-7xl font-bold text-white leading-none tracking-wide">
                  {topTrending[currentSlide].title}
                </h1>

                {/* Sub | Dub • Category */}
                <div className="flex items-center gap-3 text-white/90 text-xl">
                  <span>Sub | Dub</span>
                  <span className="text-[#f47521]">•</span>
                  <span>{topTrending[currentSlide].category}</span>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                  {topTrending[currentSlide].description.length > 300 
                    ? `${topTrending[currentSlide].description.substring(0, 300)}...` 
                    : topTrending[currentSlide].description}
                </p>

                {/* Watch Now Button & Rating */}
                <div className="flex items-center gap-6 pt-4">
                  <Link 
                    to={`/anime/${topTrending[currentSlide].id}`}
                    className="bg-[#f47521] text-white px-8 py-3 rounded-full text-lg font-medium flex items-center hover:bg-[#ff8a3d] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Play className="h-5 w-5 mr-2" /> Watch Now
                  </Link>
                  
                  <div className="flex items-center gap-2 text-white/90">
                    <Star className="h-6 w-6 text-[#f47521]" />
                    <span className="text-xl">{topTrending[currentSlide].rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20">
            {topTrending.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentSlide(index);
                  setProgress(0);
                }}
                className="relative w-2 h-2 md:w-12 md:h-1 rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30" />
                {index === currentSlide && (
                  <div 
                    className="absolute inset-0 bg-[#f47521] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Top 10 Section */}
      <div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Top 10</span> Trending Now
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={goToPrevTopTen}
              className="w-10 h-10 rounded-full bg-[#1a1b1f] flex items-center justify-center hover:bg-[#f47521] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6 text-white/80" />
            </button>
            <button 
              onClick={goToNextTopTen}
              className="w-10 h-10 rounded-full bg-[#1a1b1f] flex items-center justify-center hover:bg-[#f47521] transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6 text-white/80" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {topTrending.map((anime, index) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className={`group relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${index === currentSlide ? 'ring-2 ring-[#f47521] rounded-lg' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide(index);
                setProgress(0);
              }}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                <div className="absolute top-0 left-0 w-12 h-12 bg-[#f47521] flex items-center justify-center z-10 rounded-br-lg transform transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xl font-bold text-white">#{index + 1}</span>
                </div>
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:filter group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>{anime.rating.toFixed(1)}</span>
                    </div>
                    <span>{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Add CSS for scrollbar hiding */}
      <style>
        {`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .anime-card {
          aspect-ratio: 2/3;
          position: relative;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          background: #1a1b1f;
          transition: all 0.3s ease;
          width: 100%;
          height: 100%;
        }
        .anime-card:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .anime-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .anime-card .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
        }
        .anime-card .content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1.5rem;
          color: white;
        }
        .anime-card .title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .anime-card .metadata {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }
        .anime-card .rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .anime-card .rating-star {
          color: #f47521;
          width: 1.25rem;
          height: 1.25rem;
        }
        .anime-card .badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }
        `}
      </style>

      {/* Season Trending Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Season</span> Trending
          </h2>
          <Link 
            to="/category/season-trending" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-lg"
          >
            View All
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animes.filter(anime => anime.seasonTrending).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="block"
            >
              <div className="anime-card">
                <img
                  src={anime.image}
                  alt={anime.title}
                  loading="lazy"
                />
                <div className="overlay" />
                <div className="badge bg-purple-600">Season</div>
                <div className="content">
                  <h3 className="title">{anime.title}</h3>
                  <div className="metadata">
                    <div className="rating">
                      <Star className="rating-star" />
                      <span className="font-medium">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521]">•</span>
                    <span className="font-medium">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Releases Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Latest</span> Releases
          </h2>
          <Link 
            to="/new-episodes" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-lg"
          >
            View All
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animes.slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="block"
            >
              <div className="anime-card">
                <img
                  src={anime.image}
                  alt={anime.title}
                  loading="lazy"
                />
                <div className="overlay" />
                <div className="content">
                  <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#f47521]" />
                      <span className="text-sm font-medium">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521]">•</span>
                    <span className="text-sm font-medium">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hindi Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-[#1a1b1f]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Hindi</span> Dubbed
          </h2>
          <Link 
            to="/category/hindi-dub" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-lg"
          >
            View All
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animes.filter(anime => anime.isHindiDub).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="block"
            >
              <div className="anime-card">
                <img
                  src={anime.image}
                  alt={anime.title}
                  loading="lazy"
                />
                <div className="overlay" />
                <div className="absolute top-2 right-2">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Hindi</span>
                </div>
                <div className="content">
                  <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#f47521]" />
                      <span className="text-sm font-medium">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521]">•</span>
                    <span className="text-sm font-medium">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Telugu Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Telugu</span> Dubbed
          </h2>
          <Link 
            to="/category/telugu-dub" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-lg"
          >
            View All
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animes.filter(anime => anime.isTeluguDub).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="block"
            >
              <div className="anime-card">
                <img
                  src={anime.image}
                  alt={anime.title}
                  loading="lazy"
                />
                <div className="overlay" />
                <div className="absolute top-2 right-2">
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">Telugu</span>
                </div>
                <div className="content">
                  <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#f47521]" />
                      <span className="text-sm font-medium">{anime.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-[#f47521]">•</span>
                    <span className="text-sm font-medium">{anime.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-[#1a1b1f]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521]">Browse</span> Categories
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Action', 'Romance', 'Comedy', 'Drama'].map((category) => (
            <div 
              key={category} 
              className="relative overflow-hidden rounded-lg group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-video bg-gray-800 p-8 relative overflow-hidden transition-all duration-300 group-hover:bg-gray-700">
                <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-all duration-300">
                  <div className="w-full h-full bg-gradient-to-br from-[#f47521] to-purple-600" />
                </div>
                <div className="relative transform transition-transform duration-300 group-hover:translate-x-2">
                  <h3 className="text-2xl font-bold mb-3">{category}</h3>
                  <p className="text-base text-gray-400">Explore {category.toLowerCase()} anime</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">New</span> Episodes
          </h2>
          <Link 
            to="/new-episodes" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-lg"
          >
            View All
            <ChevronRight className="w-6 h-6 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {animes
            .filter(anime => anime.seasons.some(season => season.episodes.some(episode => episode.isNew)))
            .slice(0, 6)
            .map((anime) => {
              const latestNewEpisode = anime.seasons
                .flatMap(season => season.episodes)
                .filter(episode => episode.isNew)
                .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];

              return (
                <Link 
                  key={anime.id} 
                  to={`/anime/${anime.id}`} 
                  className="block"
                >
                  <div className="anime-card">
                    <img
                      src={latestNewEpisode?.thumbnail || anime.image}
                      alt={anime.title}
                      loading="lazy"
                    />
                    <div className="overlay" />
                    <div className="absolute top-2 right-2">
                      <span className="px-3 py-1 bg-[#f47521] text-white text-xs font-bold rounded-full">
                        Episode {latestNewEpisode?.number}
                      </span>
                    </div>
                    <div className="content">
                      <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-[#f47521]" />
                          <span className="text-sm font-medium">{anime.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[#f47521]">•</span>
                        <span className="text-sm font-medium">{anime.category}</span>
                      </div>
                      {latestNewEpisode && (
                        <p className="text-xs text-white/70 mt-2">
                          {latestNewEpisode.title} • {latestNewEpisode.duration}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Home;