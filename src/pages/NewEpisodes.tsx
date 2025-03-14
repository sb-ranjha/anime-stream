import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function NewEpisodes() {
  const { animes } = useAnime();
  const animesWithNewEpisodes = animes.filter(anime => 
    anime.seasons.some(season => 
      season.episodes.some(episode => episode.isNew)
    )
  );

  return (
    <div className="pt-14 bg-white dark:bg-[#141821]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            <span className="text-[#f47521]">New</span> Episodes
          </h1>
          <div className="text-sm text-gray-500">
            {animesWithNewEpisodes.length} {animesWithNewEpisodes.length === 1 ? 'Anime' : 'Animes'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {animesWithNewEpisodes.map((anime) => {
            const latestNewEpisode = anime.seasons
              .flatMap(season => season.episodes)
              .filter(episode => episode.isNew)
              .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())[0];

            return (
              <Link 
                key={anime._id}
                to={`/anime/${anime._id}`}
                className="group relative"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <img
                    src={latestNewEpisode?.thumbnail || anime.image}
                    alt={anime.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-[#f47521] text-white text-xs font-bold rounded">
                      Episode {latestNewEpisode?.number}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-base font-semibold text-white mb-2">{anime.title}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-gray-300">{anime.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300 text-sm">{anime.category}</span>
                    </div>
                    {latestNewEpisode && (
                      <p className="text-xs text-gray-400">
                        {latestNewEpisode.title} • {latestNewEpisode.duration}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {animesWithNewEpisodes.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl text-gray-400 mb-4">No new episodes available</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewEpisodes; 