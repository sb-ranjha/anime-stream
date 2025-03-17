import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { ChevronLeft, ChevronRight, Star, Play, Pause, Maximize, SkipBack, SkipForward, Volume2, VolumeX, Loader, Mic } from 'lucide-react';

interface Episode {
  _id: string;
  title: string;
  number: number;
  streamHG?: string;
  doodstream?: string;
  megacloud?: string;
  mega?: string;
  streamtape?: string;
  thumbnail: string;
  duration: string;
  releaseDate: string;
  isNew?: boolean;
}

function WatchAnime() {
  const { animeId, seasonId, episodeId } = useParams();
  const { animes } = useAnime();
  const [watchHistory, setWatchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [recommendations, setRecommendations] = useState<Array<{
    _id: string;
    title: string;
    image: string;
    rating: number;
    category: string;
    matchScore: number;
  }>>([]);
  const [videoSource, setVideoSource] = useState<'streamHG' | 'doodstream' | 'megacloud' | 'mega' | 'streamtape'>('streamHG');
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const anime = animes.find(a => a._id === animeId);
  const season = anime?.seasons.find(s => s._id === seasonId);
  const episode = season?.episodes.find(e => e._id === episodeId);

  if (!anime || !season || !episode) {
    return <div>Episode not found</div>;
  }

  // Reset loading state and iframe when episode or source changes
  useEffect(() => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [episodeId, videoSource]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const currentEpisodeIndex = season.episodes.findIndex(e => e._id === episodeId);
  const prevEpisode = season.episodes[currentEpisodeIndex - 1];
  const nextEpisode = season.episodes[currentEpisodeIndex + 1];

  // Update watch history and generate recommendations
  useEffect(() => {
    if (animeId) {
      // Update watch history
      const newHistory = [animeId, ...watchHistory.filter(id => id !== animeId)].slice(0, 20);
      setWatchHistory(newHistory);
      localStorage.setItem('watchHistory', JSON.stringify(newHistory));

      // Generate recommendations based on current anime and watch history
      const recommendations = animes
        .filter(a => a._id !== animeId)
        .map(a => {
          let matchScore = 0;

          if (a.category === anime.category) matchScore += 3;
          if (Math.abs(a.rating - anime.rating) <= 1) matchScore += 2;
          if (watchHistory.includes(a._id)) matchScore += 1;

          const currentTotalEpisodes = anime.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
          const targetTotalEpisodes = a.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
          if (Math.abs(currentTotalEpisodes - targetTotalEpisodes) <= 5) matchScore += 1;

          return {
            _id: a._id,
            title: a.title,
            image: a.image,
            rating: a.rating,
            category: a.category,
            matchScore
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 12);

      setRecommendations(recommendations);
    }
  }, [animeId, anime, animes]);

  // Add this effect to automatically select available source
  useEffect(() => {
    if (episode) {
      const currentSourceAvailable = 
        (videoSource === 'streamHG' && episode.streamHG) ||
        (videoSource === 'doodstream' && episode.doodstream) ||
        (videoSource === 'megacloud' && episode.megacloud) ||
        (videoSource === 'mega' && episode.mega) ||
        (videoSource === 'streamtape' && episode.streamtape);

      if (!currentSourceAvailable) {
        if (episode.streamHG) {
          setVideoSource('streamHG');
        } else if (episode.doodstream) {
          setVideoSource('doodstream');
        } else if (episode.megacloud) {
          setVideoSource('megacloud');
        } else if (episode.mega) {
          setVideoSource('mega');
        } else if (episode.streamtape) {
          setVideoSource('streamtape');
        }
      }
    }
  }, [episode, videoSource]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 mt-16 md:mt-20">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
          <span className="text-[#f47521]">{anime.title}</span>
        </h1>
        <p className="text-sm md:text-base text-white/70">Season {season.number} - Episode {episode.number}: {episode.title}</p>
      </div>

      {/* Video Player Section */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden">
        <div className="relative pb-[56.25%] h-0">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
              <div className="flex flex-col items-center">
                <Loader className="h-10 w-10 md:h-12 md:w-12 text-[#f47521] animate-spin mb-3 md:mb-4" />
                <p className="text-white text-base md:text-lg">Loading video...</p>
              </div>
            </div>
          )}
          
          {/* Video Players */}
          <div className="absolute top-0 left-0 w-full h-full">
            {videoSource === 'streamHG' && episode.streamHG ? (
              <iframe 
                key={`${iframeKey}-${episodeId}-${videoSource}`}
                src={`https://cybervynx.com/e/${episode.streamHG}?controls=1`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                scrolling="no"
                frameBorder="0"
                onLoad={handleIframeLoad}
                title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
                style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
              />
            ) : videoSource === 'doodstream' && episode.doodstream ? (
              <iframe 
                key={`${iframeKey}-${episodeId}-${videoSource}`}
                src={`https://cybervynx.com/e/${episode.doodstream}?controls=1`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen 
                frameBorder="0"
                scrolling="no"
                onLoad={handleIframeLoad}
                title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
                style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
              />
            ) : videoSource === 'megacloud' && episode.megacloud ? (
              <iframe 
                key={`${iframeKey}-${episodeId}-${videoSource}`}
                src={`https://megacloud.tv/embed-1/e-1/${episode.megacloud}?controls=1`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen 
                frameBorder="0"
                scrolling="no"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
                onLoad={handleIframeLoad}
                title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
                style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
              />
            ) : videoSource === 'mega' && episode.mega ? (
              <iframe 
                key={`${iframeKey}-${episodeId}-${videoSource}`}
                src={`https://mega.nz/embed/${episode.mega}?controls=1`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen 
                frameBorder="0"
                scrolling="no"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups"
                onLoad={handleIframeLoad}
                title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
                style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
              />
            ) : videoSource === 'streamtape' && episode.streamtape ? (
              <iframe 
                key={`${iframeKey}-${episodeId}-${videoSource}`}
                src={`https://watchadsontape.com/e/${episode.streamtape}?controls=1`}
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen"
                scrolling="no"
                frameBorder="0"
                onLoad={handleIframeLoad}
                title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
                style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }}
              />
            ) : (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900">
                <p className="text-white text-lg">No video source available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Source Selector */}
      <div className="sticky top-0 z-10 bg-[#141821] py-2">
        {(episode.streamHG || episode.doodstream || episode.megacloud || episode.mega || episode.streamtape) && (
          <div className="bg-gray-900 p-2 md:p-3 rounded-lg mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center mr-3">
              <Play className="h-4 w-4 md:h-5 md:w-5 text-[#f47521] mr-2" />
              <span className="text-white font-medium text-sm md:text-base">Sources:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {episode.streamHG && (
                <button 
                  onClick={() => setVideoSource('streamHG')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                    videoSource === 'streamHG' 
                      ? 'bg-[#f47521] text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  StreamHG
                </button>
              )}
              {episode.doodstream && (
                <button 
                  onClick={() => setVideoSource('doodstream')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                    videoSource === 'doodstream' 
                      ? 'bg-[#f47521] text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  VidSrc
                </button>
              )}
              {episode.megacloud && (
                <button 
                  onClick={() => setVideoSource('megacloud')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                    videoSource === 'megacloud' 
                      ? 'bg-[#f47521] text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  MegaCloud
                </button>
              )}
              {episode.mega && (
                <button 
                  onClick={() => setVideoSource('mega')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                    videoSource === 'mega' 
                      ? 'bg-[#f47521] text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Mega
                </button>
              )}
              {episode.streamtape && (
                <button 
                  onClick={() => setVideoSource('streamtape')}
                  className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${
                    videoSource === 'streamtape' 
                      ? 'bg-[#f47521] text-white' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  Streamtape
                </button>
              )}
            </div>
          </div>
        )}

        {/* Episode Navigation */}
        <div className="flex justify-between items-center mt-4">
          {prevEpisode ? (
            <Link
              to={`/watch/anime/${animeId}/${seasonId}/${prevEpisode._id}`}
              className="flex items-center text-[#f47521] hover:text-[#ff8a3d] text-sm md:text-base"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 mr-1" />
              Previous Episode
            </Link>
          ) : (
            <div />
          )}
          {nextEpisode ? (
            <Link
              to={`/watch/anime/${animeId}/${seasonId}/${nextEpisode._id}`}
              className="flex items-center text-[#f47521] hover:text-[#ff8a3d] text-sm md:text-base"
            >
              Next Episode
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* All Episodes Section */}
      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white">All Episodes</h2>
        <div className="relative bg-[#141821] rounded-lg">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto no-scrollbar touch-pan-x"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex space-x-4 p-4" style={{ minWidth: 'min-content' }}>
              {season.episodes.map((ep) => (
                <Link
                  key={ep._id}
                  to={`/watch/anime/${animeId}/${seasonId}/${ep._id}`}
                  className={`relative group flex-shrink-0 w-[160px] md:w-[200px] bg-[#1e2330] rounded-lg overflow-hidden transition-transform hover:scale-105 ${ep._id === episodeId ? 'ring-2 ring-[#f47521]' : ''}`}
                >
                  <div className="relative">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium text-sm md:text-base">Episode {ep.number}</span>
                    </div>
                    {/* Current episode indicator */}
                    {ep._id === episodeId && (
                      <div className="absolute top-0 left-0 right-0 bg-[#f47521] text-white text-xs text-center py-1">
                        Now Playing
                      </div>
                    )}
                    {ep.isNew && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#f47521] text-white text-xs rounded-full">
                        New
                      </div>
                    )}
                  </div>
                  {/* Episode info below thumbnail */}
                  <div className="p-3">
                    <p className="text-sm font-medium text-white truncate">Episode {ep.number}</p>
                    <p className="text-xs text-white/70 truncate mt-0.5">{ep.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          {/* Gradient shadows for scroll indication */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#141821] to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141821] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white">Recommended for You</h2>
          <div className="text-xs md:text-sm text-white/70">Based on your watch history</div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {recommendations.map((rec) => (
            <Link 
              key={rec._id}
              to={`/anime/${rec._id}`}
              className="group transform transition-all duration-300 hover:scale-105"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={rec.image}
                  alt={rec.title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 md:opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 md:transform md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-2 mb-1 md:mb-2">{rec.title}</h3>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span>{rec.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-300 text-xs">{rec.category}</span>
                  </div>
                </div>
                {rec.matchScore >= 4 && (
                  <div className="absolute top-1 md:top-2 right-1 md:right-2">
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-[#f47521] text-white text-[10px] md:text-xs font-bold rounded-full">
                      Perfect Match
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Add CSS to ensure proper iframe display and controls visibility */}
      <style dangerouslySetInnerHTML={{
        __html: `
          iframe {
            border: none;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          
          /* Ensure video controls are always visible */
          iframe::-webkit-media-controls {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          
          iframe::-webkit-media-controls-enclosure {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          /* Fix for Firefox */
          iframe[controls] {
            z-index: 2147483647 !important;
          }

          /* Prevent controls from being hidden */
          iframe:hover::-webkit-media-controls-panel,
          iframe:focus::-webkit-media-controls-panel {
            display: flex !important;
            opacity: 1 !important;
          }
        `
      }} />
    </div>
  );
}

export default WatchAnime;