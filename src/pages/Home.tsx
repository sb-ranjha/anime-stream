import React, { useState, useEffect, useRef } from 'react';
import { Play, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import { Link } from 'react-router-dom';
import BrowseCategories from '../components/BrowseCategories';

interface Episode {
  _id: string;
  number: number;
  title: string;
  duration: string;
  releaseDate: string;
  isNew?: boolean;
  thumbnail?: string;
  doodstream?: string;
  megacloud?: string;
  mega?: string;
  streamtape?: string;
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

function Home() {
  const { trending, animes } = useAnime();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Filter movies
  const movies = animes.filter(anime => anime.isMovie);

  return (
    <div className="pt-14 bg-black">
      {/* Featured Trending Anime Hero Section */}
      {topTrending[currentSlide] && (
        <div 
          className="relative aspect-[16/9] md:aspect-auto md:h-[85vh] w-full group overflow-hidden bg-black"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Make entire hero section clickable */}
          <Link 
            to={`/anime/${topTrending[currentSlide]._id}`}
            className="absolute inset-0 z-10"
            aria-label={`View ${topTrending[currentSlide].title}`}
          />
          
          <div className="absolute inset-0">
            {/* Main image container */}
            <div className="relative w-full h-full">
              <img
                src={topTrending[currentSlide].image}
                alt={topTrending[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover object-center brightness-125 contrast-125 transition-all duration-700 ease-in-out scale-105 hover:scale-100"
              />
              {/* Dark overlay - adjusted opacity for better vibrancy */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {/* Mobile gradient overlay */}
              <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              {/* Desktop gradient overlays */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141821] via-transparent to-transparent opacity-80" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141821]/80 via-transparent to-[#141821]/80" />
            </div>
          </div>

          {/* Mobile Content Container */}
          <div className="md:hidden relative h-full flex items-end z-10">
            <div className="w-full px-4 sm:px-6 mb-8">
              <div className="space-y-2">
                {/* Spotlight tag */}
                <div className="inline-block bg-[#f47521] px-1.5 py-0.5 rounded">
                  <span className="text-white font-bold text-[10px]">#{currentSlide + 1} Spotlight</span>
                </div>
                
                {/* Title */}
                <h1 className="text-lg font-bold text-white leading-tight tracking-wide">
                  {topTrending[currentSlide].title}
                </h1>
                
                {/* Sub | Dub • Category */}
                <div className="flex items-center gap-2 text-white/90 text-[8px]">
                  <span>Sub | Dub</span>
                  <span className="text-[#f47521]">•</span>
                  <span>{topTrending[currentSlide].category}</span>
                </div>

                {/* Description */}
                <p className="text-[8px] text-white/70 leading-relaxed line-clamp-2">
                  {topTrending[currentSlide].description.length > 100 
                    ? `${topTrending[currentSlide].description.substring(0, 100)}...` 
                    : topTrending[currentSlide].description}
                </p>

                {/* Watch Now Button & Rating */}
                <div className="flex items-center gap-4 pt-1">
                  <Link 
                    to={`/anime/${topTrending[currentSlide]._id}`}
                    className="bg-[#f47521] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center hover:bg-[#ff8a3d] transition-colors md:px-2.5 md:py-1 md:text-[10px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Play className="h-4 w-4 mr-1.5 md:h-2.5 md:w-2.5 md:mr-1" /> Watch Now
                  </Link>
                  
                  <div className="flex items-center gap-1.5 text-white/90">
                    <Star className="h-2.5 w-2.5 text-[#f47521]" />
                    <span className="text-[10px]">{topTrending[currentSlide].rating.toFixed(1)}</span>
                  </div>
                </div>
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
                    to={`/anime/${topTrending[currentSlide]._id}`}
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
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 bg-black"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex justify-between items-center mb-6 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Top 10</span> Trending Now
          </h2>
          {/* Navigation buttons for desktop */}
          <div className="hidden md:flex items-center gap-3">
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
        
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {topTrending.map((anime, index) => (
              <Link 
                key={anime._id} 
                to={`/anime/${anime._id}`} 
                className="block w-[160px] md:w-[240px] flex-shrink-0"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#111111] group">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute top-0 left-0 w-8 h-8 md:w-12 md:h-12 bg-[#f47521] flex items-center justify-center z-10 rounded-br-lg">
                    <span className="text-sm md:text-xl font-bold text-white">#{index + 1}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="text-sm md:text-lg font-semibold text-white line-clamp-2 mb-1 md:mb-2">{anime.title}</h3>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-[#f47521]" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Season Trending Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Season</span> Trending
          </h2>
          <Link 
            to="/category/season-trending" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-sm md:text-lg"
          >
            View All
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {animes.filter(anime => anime.seasonTrending).slice(0, 20).map((anime) => (
              <Link 
                key={anime._id} 
                to={`/anime/${anime._id}`} 
                className="block w-[160px] md:w-[240px] flex-shrink-0"
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
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Releases Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Latest</span> Releases
          </h2>
          <Link 
            to="/latest-releases" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-sm md:text-lg"
          >
            View All
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {animes.slice(0, 20).map((anime) => (
              <Link 
                key={anime._id} 
                to={`/anime/${anime._id}`} 
                className="block w-[160px] md:w-[240px] flex-shrink-0"
              >
                <div className="anime-card">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    loading="lazy"
                  />
                  <div className="overlay" />
                  <div className="content">
                    <h3 className="title">{anime.title}</h3>
                    <div className="metadata">
                      <div className="rating">
                        <Star className="rating-star" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hindi Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Hindi</span> Dubbed
          </h2>
          <Link 
            to="/category/hindi-dub" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-sm md:text-lg"
          >
            View All
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {animes.filter(anime => anime.isHindiDub).slice(0, 20).map((anime) => (
              <Link 
                key={anime._id} 
                to={`/anime/${anime._id}`} 
                className="block w-[160px] md:w-[240px] flex-shrink-0"
              >
                <div className="anime-card">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    loading="lazy"
                  />
                  <div className="overlay" />
                  <div className="badge bg-blue-600">Hindi</div>
                  <div className="content">
                    <h3 className="title">{anime.title}</h3>
                    <div className="metadata">
                      <div className="rating">
                        <Star className="rating-star" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Telugu Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">Telugu</span> Dubbed
          </h2>
          <Link 
            to="/category/telugu-dub" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-sm md:text-lg"
          >
            View All
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {animes.filter(anime => anime.isTeluguDub).slice(0, 20).map((anime) => (
              <Link 
                key={anime._id} 
                to={`/anime/${anime._id}`} 
                className="block w-[160px] md:w-[240px] flex-shrink-0"
              >
                <div className="anime-card">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    loading="lazy"
                  />
                  <div className="overlay" />
                  <div className="badge bg-green-600">Telugu</div>
                  <div className="content">
                    <h3 className="title">{anime.title}</h3>
                    <div className="metadata">
                      <div className="rating">
                        <Star className="rating-star" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <BrowseCategories />

      {/* New Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-4xl font-bold flex items-center">
            <span className="text-[#f47521] mr-2">New</span> Episodes
          </h2>
          <Link 
            to="/new-episodes" 
            className="text-[#f47521] hover:text-[#ff8a3d] font-medium flex items-center text-sm md:text-lg"
          >
            View All
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 ml-2" />
          </Link>
        </div>
        {/* Scrollable view for both mobile and desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex space-x-4 md:space-x-6 w-max pb-4">
            {animes
              .filter(anime => {
                return anime.seasons.some(season => 
                  season.episodes.some(episode => episode.isNew === true)
                );
              })
              .slice(0, 20)
              .map((anime) => {
                const latestNewEpisode = anime.seasons
                  .flatMap(season => season.episodes)
                  .filter(episode => episode.isNew === true)
                  .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];

                if (!latestNewEpisode) return null;

                return (
                  <Link 
                    key={anime._id} 
                    to={`/watch/${anime._id}/episode/${latestNewEpisode._id}`} 
                    className="block w-[160px] md:w-[240px] flex-shrink-0"
                  >
                    <div className="anime-card">
                      <img
                        src={latestNewEpisode.thumbnail || anime.image}
                        alt={anime.title}
                        loading="lazy"
                      />
                      <div className="overlay" />
                      <div className="badge bg-[#f47521]">EP {latestNewEpisode.number}</div>
                      <div className="content">
                        <h3 className="title">{anime.title}</h3>
                        <div className="metadata">
                          <div className="rating">
                            <Star className="rating-star" />
                            <span>{anime.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-[#f47521]">•</span>
                          <span>{anime.category}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-white/70 mt-1 line-clamp-1">
                          {latestNewEpisode.title} • {latestNewEpisode.duration}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <section className="py-8 md:py-12 bg-[#141821]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-[#f47521]" />
              Movies
            </h2>
            <Link 
              to="/movies" 
              className="text-sm text-white/70 hover:text-[#f47521] transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
            {movies.slice(0, 12).map((anime) => (
              <AnimeCard key={anime._id} anime={anime} />
            ))}
          </div>
        </div>
      </section>

      {/* Update anime card styles */}
      <style>
        {`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .anime-card {
          aspect-ratio: 2/3;
          position: relative;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          background: #111111;
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
          transition: transform 0.3s ease;
        }
        .anime-card:hover img {
          transform: scale(1.1);
        }
        .anime-card .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
        }
        .anime-card .content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          @media (min-width: 768px) {
            padding: 1.5rem;
          }
          color: white;
        }
        .anime-card .title {
          font-size: 0.75rem;
          @media (min-width: 768px) {
            font-size: 1rem;
          }
          font-weight: 600;
          margin-bottom: 0.25rem;
          @media (min-width: 768px) {
            margin-bottom: 0.5rem;
          }
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .anime-card .metadata {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          @media (min-width: 768px) {
            gap: 0.5rem;
          }
          font-size: 0.625rem;
          @media (min-width: 768px) {
            font-size: 0.875rem;
          }
          color: rgba(255, 255, 255, 0.8);
        }
        .anime-card .rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          @media (min-width: 768px) {
            gap: 0.5rem;
          }
        }
        .anime-card .rating-star {
          color: #f47521;
          width: 0.75rem;
          height: 0.75rem;
          @media (min-width: 768px) {
            width: 1rem;
            height: 1rem;
          }
        }
        .anime-card .badge {
          position: absolute;
          top: 0.375rem;
          right: 0.375rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.625rem;
          @media (min-width: 768px) {
            top: 0.75rem;
            right: 0.75rem;
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }
          font-weight: 600;
          color: white;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
        }
        `}
      </style>
    </div>
  );
}

export default Home;