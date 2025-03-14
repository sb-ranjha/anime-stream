import React, { useState, useEffect } from 'react';
import { Play, Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';
import AnimeCard from '../components/AnimeCard';
import { Link } from 'react-router-dom';

function Home() {
  const { trending, animes } = useAnime();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  
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

  useEffect(() => {
    if (topTrending.length === 0) return;

    const interval = setInterval(goToNextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [topTrending.length]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, SLIDE_DURATION / 100);

    return () => clearInterval(progressInterval);
  }, [currentSlide]);

  return (
    <div className="pt-14 bg-white dark:bg-[#141821]">
      {/* Featured Trending Anime Hero Section */}
      {topTrending[currentSlide] && (
        <div className="relative aspect-[3/4] md:aspect-auto md:h-[85vh] w-full group overflow-hidden bg-[#141821]">
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
                key={topTrending[currentSlide].id}
                className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-in-out md:scale-105"
                src={topTrending[currentSlide].image}
                alt={topTrending[currentSlide].title}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/60" />
              {/* Gradient overlays - only show on desktop */}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#141821] via-[#141821]/80 to-transparent" />
              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#141821] via-transparent to-[#141821]" />
            </div>
          </div>

          {/* Mobile Content Container */}
          <div className="md:hidden relative h-full flex flex-col items-start justify-end z-10 px-4 pb-16">
            <div className="w-full space-y-3">
              {/* Spotlight tag */}
              <div className="inline-block bg-[#f47521] px-2 py-0.5 rounded text-xs font-medium">
                <span className="text-white">#{currentSlide + 1} Spotlight</span>
              </div>

              {/* Title */}
              <h1 className="text-xl font-bold text-white text-left">
                {topTrending[currentSlide].title}
              </h1>

              {/* Sub | Dub • Category */}
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <span>Sub | Dub</span>
                <span className="text-[#f47521]">•</span>
                <span>{topTrending[currentSlide].category}</span>
              </div>

              {/* Single line description */}
              <p className="text-xs text-white/80 line-clamp-1 text-left">
                {topTrending[currentSlide].description}
              </p>

              {/* Action Button */}
              <div className="flex items-center pt-3">
                <Link
                  to={`/anime/${topTrending[currentSlide].id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center bg-[#f47521] text-white px-4 py-2 rounded-md text-sm font-bold"
                >
                  <Play className="h-4 w-4 mr-2" fill="currentColor" /> START WATCHING E1
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

                <div className="flex items-center gap-4 pt-8">
                  <Link
                    to={`/anime/${topTrending[currentSlide].id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center bg-[#f47521] text-white px-8 py-3.5 rounded-md hover:bg-[#ff8a3d] text-lg font-bold transition-all duration-300 hover:scale-105 z-20 relative"
                  >
                    <Play className="h-5 w-5 mr-2" fill="currentColor" /> START WATCHING E1
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-3.5 rounded-md border-2 border-white/20 hover:border-[#f47521] hover:bg-[#f47521]/10 transition-all duration-300"
                    aria-label="Add to watchlist"
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
        </div>

          {/* Navigation Arrows - only show on desktop */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrevSlide();
            }}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white z-20 transition-all duration-300 hover:bg-[#f47521] focus:outline-none opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNextSlide();
            }}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-black/40 text-white z-20 transition-all duration-300 hover:bg-[#f47521] focus:outline-none opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-10 h-10" />
            </button>

          {/* Slide Indicators */}
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
                className={`w-2 h-2 md:w-8 md:h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-[#f47521] md:w-8' 
                    : 'bg-white/50 md:hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Top 10 Trending Now Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-12 flex items-center">
          <span className="text-[#f47521] mr-2">Top 10</span> Trending Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {topTrending.map((anime, index) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
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

      {/* Season Trending Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes.filter(anime => anime.seasonTrending).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded">Season</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-300 text-sm">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Releases Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-12 flex items-center">
          <span className="text-[#f47521] mr-2">Latest</span> Releases
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes.slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{anime.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hindi Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-[#1a1b1f]">
        <div className="flex justify-between items-center mb-12">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes.filter(anime => anime.isHindiDub).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">Hindi</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-300 text-sm">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Telugu Dubbed Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes.filter(anime => anime.isTeluguDub).slice(0, 6).map((anime) => (
            <Link 
              key={anime.id} 
              to={`/anime/${anime.id}`} 
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">Telugu</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-2">{anime.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-300 text-sm">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-[#1a1b1f]">
        <h2 className="text-4xl font-bold mb-12">
          <span className="text-[#f47521]">Browse</span> Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-12">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {animes
            .filter(anime => {
              // Check if any episode is marked as new
              return anime.seasons.some(season =>
                season.episodes.some(episode => episode.isNew)
              );
            })
            .slice(0, 6)
            .map((anime) => {
              // Find the latest new episode
              const latestNewEpisode = anime.seasons
                .flatMap(season => season.episodes)
                .filter(episode => episode.isNew)
                .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];

              return (
                <Link 
                  key={anime.id} 
                  to={`/anime/${anime.id}`} 
                  className="group transform transition-all duration-300 hover:scale-105"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                    <img
                      src={latestNewEpisode?.thumbnail || anime.image}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-[#f47521] text-white text-xs rounded-full">
                        Episode {latestNewEpisode?.number}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{anime.title}</h3>
                      {latestNewEpisode && (
                        <p className="text-xs text-gray-300 mt-1">
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