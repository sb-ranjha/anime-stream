import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useAnime } from '../context/AnimeContext';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';

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

  const anime = animes.find(a => a.id === animeId);
  const season = anime?.seasons.find(s => s.id === seasonId);
  const episode = season?.episodes.find(e => e.id === episodeId);

  if (!anime || !season || !episode) {
    return <div>Episode not found</div>;
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{anime.title}</h1>
        <p className="text-gray-400">Season {season.number} - Episode {episode.number}: {episode.title}</p>
      </div>

      <div className="aspect-video mb-8 bg-black rounded-lg overflow-hidden">
        <ReactPlayer
          url={episode.videoUrl}
          width="100%"
          height="100%"
          controls
          playing
        />
      </div>

      <div className="flex justify-between items-center mb-8">
        {prevEpisode ? (
          <Link
            to={`/watch/${animeId}/${seasonId}/${prevEpisode.id}`}
            className="flex items-center text-[#f47521] hover:text-[#ff8a3d]"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous Episode
          </Link>
        ) : (
          <div />
        )}
        {nextEpisode ? (
          <Link
            to={`/watch/${animeId}/${seasonId}/${nextEpisode.id}`}
            className="flex items-center text-[#f47521] hover:text-[#ff8a3d]"
          >
            Next Episode
            <ChevronRight className="h-5 w-5 ml-1" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">All Episodes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                <span className="text-white font-medium">Episode {ep.number}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <div className="text-sm text-gray-400">Based on your watch history</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{rec.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-4 w-4 mr-1" />
                      <span>{rec.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-300">{rec.category}</span>
                  </div>
                </div>
                {rec.matchScore >= 4 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-[#f47521] text-white text-xs font-bold rounded-full">
                      Perfect Match
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WatchAnime;