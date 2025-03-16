import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovie } from '../context/MovieContext';
import { Play, ArrowLeft } from 'lucide-react';

const WatchMovie = () => {
  const { movieId } = useParams();
  const { movies, loading } = useMovie();
  const navigate = useNavigate();
  const [activeSource, setActiveSource] = useState<'streamHG' | 'doodstream' | 'megacloud' | 'streamtape'>('streamHG');
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Find movie first
  const movie = movies.find(m => m._id === movieId);

  // Helper function to get video URL
  const getVideoUrl = (source: string | undefined, type: 'streamHG' | 'doodstream' | 'megacloud' | 'streamtape') => {
    if (!source) return null;
    
    switch (type) {
      case 'streamHG':
        return `https://cybervynx.com/e/${source}`;
      case 'doodstream':
        return `https://doodstream.com/e/${source}`;
      case 'megacloud':
        return `https://megacloud.tv/embed-${source}`;
      case 'streamtape':
        return `https://streamtape.com/e/${source}`;
      default:
        return null;
    }
  };

  // Handle loading state
  useEffect(() => {
    setIsLoading(true);
    setVideoError(false);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [movieId, activeSource]);

  // Find first available source
  useEffect(() => {
    if (movie && !movie[activeSource]) {
      const availableSource = ['streamHG', 'doodstream', 'megacloud', 'streamtape'].find(
        source => movie[source as keyof typeof movie]
      );
      if (availableSource) {
        setActiveSource(availableSource as typeof activeSource);
      }
    }
  }, [movie, activeSource]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#141821] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#f47521]"></div>
      </div>
    );
  }

  // Show not found state
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141821] flex flex-col items-center justify-center p-4">
        <p className="text-xl text-gray-400 mb-4">Movie not found</p>
        <button
          onClick={() => navigate('/movies')}
          className="flex items-center gap-2 px-4 py-2 bg-[#f47521] text-white rounded-md hover:bg-[#f47521]/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Movies
        </button>
      </div>
    );
  }

  const currentVideoUrl = getVideoUrl(movie[activeSource], activeSource);

  const handleVideoError = () => {
    setVideoError(true);
  };

  return (
    <div className="min-h-screen bg-[#141821] pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800/50 rounded-lg overflow-hidden">
          {/* Video Player */}
          <div className="relative aspect-video">
            {currentVideoUrl ? (
              <>
                <iframe
                  src={currentVideoUrl}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                  style={{ border: 'none' }}
                  onError={handleVideoError}
                />
                {videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center p-4">
                      <p className="text-gray-400 mb-2">Failed to load video from {activeSource}</p>
                      <p className="text-gray-500 text-sm">Please try another source</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center p-4">
                  <p className="text-gray-400 mb-2">No video source available</p>
                  <p className="text-gray-500 text-sm">Please try another source</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Sources */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              {(['streamHG', 'doodstream', 'megacloud', 'streamtape'] as const).map(source => {
                if (!movie[source]) return null;
                return (
                  <button
                    key={source}
                    onClick={() => {
                      setActiveSource(source);
                      setVideoError(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeSource === source
                        ? 'bg-[#f47521] text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Play className="h-4 w-4" />
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800/50">
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span>{movie.duration}</span>
              <span>•</span>
              <span>{movie.genre.join(', ')}</span>
              <span>•</span>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchMovie; 