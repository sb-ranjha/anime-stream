import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAnime } from '../context/AnimeContext';
import { Play, Star, Clock, Calendar } from 'lucide-react';

const WatchMovie = () => {
  const { id } = useParams();
  const { animes } = useAnime();
  const [activeSource, setActiveSource] = useState('doodstream');
  const [movie, setMovie] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const currentMovie = animes.find(anime => anime._id === id);
    setMovie(currentMovie);

    // Get recommendations based on category
    if (currentMovie) {
      const similarMovies = animes.filter(anime => 
        anime.isMovie && 
        anime._id !== id && 
        (anime.category === currentMovie.category || anime.rating >= currentMovie.rating)
      ).slice(0, 12);
      setRecommendations(similarMovies);
    }
  }, [id, animes]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141821] pt-20 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const getVideoUrl = (source: string) => {
    switch (source) {
      case 'doodstream':
        return `https://dood.wf/e/${movie.seasons[0]?.episodes[0]?.doodstream}`;
      case 'megacloud':
        return `https://megacloud.tv/embed-1/e-1/${movie.seasons[0]?.episodes[0]?.megacloud}`;
      case 'streamtape':
        return `https://streamtape.com/e/${movie.seasons[0]?.episodes[0]?.streamtape}`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#141821] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player Section */}
        <div className="bg-black/50 rounded-lg overflow-hidden mb-8">
          <div className="relative pt-[56.25%]">
            <iframe
              src={getVideoUrl(activeSource)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen"
            />
          </div>
        </div>

        {/* Video Sources */}
        <div className="flex gap-4 mb-8">
          {movie.seasons[0]?.episodes[0]?.doodstream && (
            <button
              onClick={() => setActiveSource('doodstream')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeSource === 'doodstream' 
                  ? 'bg-[#f47521] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              VidSrc
            </button>
          )}
          {movie.seasons[0]?.episodes[0]?.megacloud && (
            <button
              onClick={() => setActiveSource('megacloud')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeSource === 'megacloud' 
                  ? 'bg-[#f47521] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              MegaCloud
            </button>
          )}
          {movie.seasons[0]?.episodes[0]?.streamtape && (
            <button
              onClick={() => setActiveSource('streamtape')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeSource === 'streamtape' 
                  ? 'bg-[#f47521] text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              StreamTape
            </button>
          )}
        </div>

        {/* Movie Info */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 shrink-0">
              <img 
                src={movie.image} 
                alt={movie.title}
                className="w-full rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{movie.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-[#f47521]" />
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{movie.category}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>2h 30m</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>2024</span>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{movie.description}</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((rec) => (
              <Link 
                key={rec._id} 
                to={`/watch/${rec._id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#f47521]/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-medium text-sm line-clamp-1">{rec.title}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#f47521]">{rec.category}</span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-[#f47521]" />
                    <span className="text-gray-400">{rec.rating.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchMovie; 