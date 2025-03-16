import React from 'react';
import { useAnime } from '../context/AnimeContext';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

function NewEpisodes() {
  const { animes } = useAnime();

  // Get all episodes from the last 7 days
  const newEpisodes = animes
    .flatMap(anime => 
      anime.seasons.flatMap(season =>
        season.episodes.map(episode => ({
          anime,
          episode,
          season,
          releaseDate: new Date(episode.releaseDate)
        }))
      )
    )
    .filter(({ releaseDate }) => {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return releaseDate >= sevenDaysAgo;
    })
    .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());

  return (
    <div className="pt-20 min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-8">
          <span className="text-[#f47521]">New</span> Episodes
          <span className="ml-3 text-sm text-gray-400">({newEpisodes.length} episodes)</span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {newEpisodes.map(({ anime, episode, season }) => {
            const daysAgo = Math.ceil(
              (new Date().getTime() - new Date(episode.releaseDate).getTime()) / 
              (1000 * 60 * 60 * 24)
            );

            return (
              <Link 
                key={`${anime._id}-${episode._id}`}
                to={`/watch/${anime._id}/${season._id}/${episode._id}`}
                className="block group"
              >
                <div className="relative aspect-video md:aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={episode.thumbnail || anime.image}
                    alt={`${anime.title} Episode ${episode.number}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  
                  {/* Episode badge with days ago */}
                  <div className="absolute top-2 right-2 bg-[#f47521] text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-sm">
                    <span>EP {episode.number}</span>
                    <span className={`text-[10px] font-medium ${daysAgo === 1 ? 'text-white' : 'text-white/75'}`}>
                      {daysAgo}d
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-sm md:text-base font-semibold line-clamp-2 mb-1">
                      {anime.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-[#f47521]">•</span>
                      <span>{anime.category}</span>
                    </div>

                    <p className="text-[10px] md:text-xs text-white/70 mt-1 line-clamp-1">
                      {episode.title} • {episode.duration}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-white/50 mt-0.5">
                      Released {new Date(episode.releaseDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {newEpisodes.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No new episodes in the last 7 days.
          </div>
        )}
      </div>
    </div>
  );
}

export default NewEpisodes; 