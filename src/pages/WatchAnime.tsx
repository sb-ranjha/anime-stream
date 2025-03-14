import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { ChevronLeft, ChevronRight, Star, Play, Pause, Maximize, SkipBack, SkipForward, Volume2, VolumeX, Loader, Mic } from 'lucide-react';

function WatchAnime() {
  const { animeId, seasonId, episodeId } = useParams();
  const { animes } = useAnime();
  const [watchHistory, setWatchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('watchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [recommendations, setRecommendations] = useState<Array<{
    id: string;
    title: string;
    image: string;
    rating: number;
    category: string;
    matchScore: number;
  }>>([]);
  const [videoSource, setVideoSource] = useState<'doodstream' | 'megacloud' | 'mega'>('doodstream');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const anime = animes.find(a => a.id === animeId);
  const season = anime?.seasons.find(s => s.id === seasonId);
  const episode = season?.episodes.find(e => e.id === episodeId);

  if (!anime || !season || !episode) {
    return <div>Episode not found</div>;
  }

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Set initial video source from episode data
  useEffect(() => {
    if (episode) {
      // Set default video source based on available URLs
      if (episode.doodstream) {
        setVideoSource('doodstream');
      } else if (episode.megacloud) {
        setVideoSource('megacloud');
      } else if (episode.mega) {
        setVideoSource('mega');
      }
      setIsLoading(true); // Reset loading state when changing episodes
    }
  }, [episode]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const currentEpisodeIndex = season.episodes.findIndex(e => e.id === episodeId);
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
        .filter(a => a.id !== animeId) // Exclude current anime
        .map(a => {
          let matchScore = 0;

          // Category match
          if (a.category === anime.category) matchScore += 3;

          // Rating similarity (within 1 point)
          if (Math.abs(a.rating - anime.rating) <= 1) matchScore += 2;

          // Previously watched
          if (watchHistory.includes(a.id)) matchScore += 1;

          // Similar number of episodes
          const currentTotalEpisodes = anime.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
          const targetTotalEpisodes = a.seasons.reduce((acc, s) => acc + s.episodes.length, 0);
          if (Math.abs(currentTotalEpisodes - targetTotalEpisodes) <= 5) matchScore += 1;

          return {
            id: a.id,
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

  // Handle mouse movement to show/hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Handle play/pause toggle
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    
    // Try to send play/pause message to iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: isPlaying ? 'pause' : 'play' },
          '*'
        );
      }
    } catch (error) {
      console.error('Failed to control iframe playback:', error);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // Try to send mute message to iframe
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: 'mute', value: !isMuted },
          '*'
        );
      }
    } catch (error) {
      console.error('Failed to control iframe volume:', error);
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    } else {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    }
  };

  // Handle seeking forward/backward
  const seekVideo = (seconds: number) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { action: 'seek', value: seconds },
          '*'
        );
      }
    } catch (error) {
      console.error('Failed to seek in iframe:', error);
    }
  };

  // Prevent right-click on video container
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Handle click on the video overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    togglePlay();
  };

  // Handle touch start for swipe gestures
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartTime(Date.now());
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
  };

  // Handle touch end for swipe gestures
  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Only process swipes that are quick enough (less than 500ms)
    if (touchDuration < 500) {
      const touchDiff = touchEndX - touchStartX;
      
      // Minimum distance for a swipe
      if (Math.abs(touchDiff) > 50) {
        if (touchDiff > 0) {
          // Swipe right - seek backward
          seekVideo(-10);
        } else {
          // Swipe left - seek forward
          seekVideo(10);
        }
      }
    }
    
    // Set timeout to hide controls
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Double tap to toggle fullscreen
  const handleDoubleTap = () => {
    toggleFullscreen();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{anime.title}</h1>
        <p className="text-sm md:text-base text-gray-400">Season {season.number} - Episode {episode.number}: {episode.title}</p>
      </div>

      <div 
        className="aspect-video mb-4 md:mb-8 bg-black rounded-lg overflow-hidden relative" 
        ref={videoContainerRef}
        onMouseMove={handleMouseMove}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      >
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
            <div className="flex flex-col items-center">
              <Loader className="h-10 w-10 md:h-12 md:w-12 text-[#f47521] animate-spin mb-3 md:mb-4" />
              <p className="text-white text-base md:text-lg">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Embedded Video Player */}
        <div className="w-full h-full">
          {videoSource === 'doodstream' && episode.doodstream ? (
            <iframe 
              ref={iframeRef}
              src={`https://doodstream.com/e/${episode.doodstream}`}
              className="w-full h-full"
              allowFullScreen 
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              onLoad={handleIframeLoad}
              title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
            ></iframe>
          ) : videoSource === 'megacloud' && episode.megacloud ? (
            <iframe 
              ref={iframeRef}
              src={`https://megacloud.tv/e/${episode.megacloud}`}
              className="w-full h-full"
              allowFullScreen 
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              onLoad={handleIframeLoad}
              title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
            ></iframe>
          ) : videoSource === 'mega' && episode.mega ? (
            <iframe 
              ref={iframeRef}
              src={`https://mega.nz/embed/${episode.mega}`}
              className="w-full h-full"
              allowFullScreen 
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              onLoad={handleIframeLoad}
              title={`${anime.title} - Season ${season.number} Episode ${episode.number}`}
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <p className="text-white text-lg">No video source available</p>
            </div>
          )}
        </div>

        {/* Transparent overlay to prevent direct interaction with iframe */}
        <div 
          className="absolute inset-0 z-10"
          onClick={handleOverlayClick}
          style={{ pointerEvents: showControls ? 'none' : 'auto' }}
        ></div>

        {/* Mobile swipe indicator - briefly shown when controls are visible */}
        {isMobile && showControls && (
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-6 pointer-events-none z-20 opacity-50">
            <div className="bg-black/50 rounded-full p-2">
              <ChevronLeft className="h-8 w-8 text-white" />
            </div>
            <div className="bg-black/50 rounded-full p-2">
              <ChevronRight className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* Custom Video Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-4 transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress bar (visual only) */}
          <div className="w-full h-1 md:h-1.5 bg-gray-600 rounded-full mb-3 md:mb-4 cursor-pointer">
            <div className="h-full bg-[#f47521] rounded-full w-1/3"></div>
          </div>
          
          {/* Mobile controls layout */}
          {isMobile ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <button 
                    onClick={togglePlay}
                    className="text-white hover:text-[#f47521] transition-colors"
                  >
                    {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                  </button>
                  
                  <button 
                    onClick={() => seekVideo(-10)}
                    className="text-white hover:text-[#f47521] transition-colors"
                  >
                    <SkipBack className="h-6 w-6" />
                  </button>
                  
                  <button 
                    onClick={() => seekVideo(10)}
                    className="text-white hover:text-[#f47521] transition-colors"
                  >
                    <SkipForward className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-5">
                  <button 
                    onClick={toggleMute}
                    className="text-white hover:text-[#f47521] transition-colors"
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </button>
                  
                  <button 
                    onClick={toggleFullscreen}
                    className="text-white hover:text-[#f47521] transition-colors"
                  >
                    <Maximize className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-white text-xs">
                  <span>00:00</span>
                  <span className="mx-1">/</span>
                  <span>{episode.duration}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {prevEpisode && (
                    <Link
                      to={`/watch/${animeId}/${seasonId}/${prevEpisode.id}`}
                      className="bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs flex items-center"
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Prev
                    </Link>
                  )}
                  
                  {nextEpisode && (
                    <Link
                      to={`/watch/${animeId}/${seasonId}/${nextEpisode.id}`}
                      className="bg-gray-800/80 text-white px-3 py-1 rounded-full text-xs flex items-center"
                    >
                      Next
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Desktop controls layout */
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay}
                  className="text-white hover:text-[#f47521] transition-colors"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                
                <button 
                  onClick={() => seekVideo(-10)}
                  className="text-white hover:text-[#f47521] transition-colors"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={() => seekVideo(10)}
                  className="text-white hover:text-[#f47521] transition-colors"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={toggleMute}
                  className="text-white hover:text-[#f47521] transition-colors"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <div className="text-white text-sm">
                  <span>00:00</span>
                  <span className="mx-1">/</span>
                  <span>{episode.duration}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {prevEpisode && (
                  <Link
                    to={`/watch/${animeId}/${seasonId}/${prevEpisode.id}`}
                    className="text-white hover:text-[#f47521] transition-colors text-sm flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Link>
                )}
                
                {nextEpisode && (
                  <Link
                    to={`/watch/${animeId}/${seasonId}/${nextEpisode.id}`}
                    className="text-white hover:text-[#f47521] transition-colors text-sm flex items-center"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                )}
                
                <button 
                  onClick={toggleFullscreen}
                  className="text-white hover:text-[#f47521] transition-colors"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Source Selector - Only show if sources are available */}
      {(episode.doodstream || episode.megacloud || episode.mega) && (
        <div className="bg-gray-900 p-2 md:p-3 rounded-lg mb-4 flex items-center">
          <div className="flex items-center mr-3 md:mr-4">
            <Mic className="h-4 w-4 md:h-5 md:w-5 text-white mr-2" />
            <span className="text-white font-medium text-sm md:text-base">DUB:</span>
          </div>
          
          <div className="flex space-x-2 md:space-x-3">
            {episode.doodstream && (
              <button 
                onClick={() => setVideoSource('doodstream')}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${videoSource === 'doodstream' ? 'bg-[#f47521] text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                VidSrc
              </button>
            )}
            {episode.megacloud && (
              <button 
                onClick={() => setVideoSource('megacloud')}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${videoSource === 'megacloud' ? 'bg-[#f47521] text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                MegaCloud
              </button>
            )}
            {episode.mega && (
              <button 
                onClick={() => setVideoSource('mega')}
                className={`px-3 md:px-4 py-1 md:py-1.5 rounded text-xs md:text-sm font-medium transition-colors ${videoSource === 'mega' ? 'bg-[#f47521] text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
              >
                Mega
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Episode Navigation */}
      <div className="flex justify-between items-center mb-4 md:mb-8">
        {prevEpisode ? (
          <Link
            to={`/watch/${animeId}/${seasonId}/${prevEpisode.id}`}
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
            to={`/watch/${animeId}/${seasonId}/${nextEpisode.id}`}
            className="flex items-center text-[#f47521] hover:text-[#ff8a3d] text-sm md:text-base"
          >
            Next Episode
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 ml-1" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* All Episodes Section */}
      <div className="bg-gray-800 rounded-lg p-4 md:p-6 mb-8 md:mb-12">
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">All Episodes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {season.episodes.map((ep) => (
            <Link
              key={ep.id}
              to={`/watch/${animeId}/${seasonId}/${ep.id}`}
              className={`relative group ${ep.id === episodeId ? 'ring-2 ring-[#f47521]' : ''}`}
            >
              <img
                src={ep.thumbnail}
                alt={ep.title}
                className="w-full aspect-video object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium text-sm md:text-base">Episode {ep.number}</span>
              </div>
              {/* Mobile-friendly indicator for current episode */}
              {ep.id === episodeId && (
                <div className="absolute bottom-0 left-0 right-0 bg-[#f47521] text-white text-xs text-center py-1 md:hidden">
                  Current
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-4 md:space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-bold">Recommended for You</h2>
          <div className="text-xs md:text-sm text-gray-400">Based on your watch history</div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {recommendations.map((rec) => (
            <Link 
              key={rec.id}
              to={`/anime/${rec.id}`}
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

      {/* Add CSS to hide external player elements */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Hide share buttons and other external controls */
        iframe {
          position: relative;
          z-index: 1;
        }
        
        /* Adjust iframe positioning to hide controls */
        iframe {
          margin-bottom: -40px !important;
          height: calc(100% + 40px) !important;
        }
        `
      }} />
    </div>
  );
}

export default WatchAnime;