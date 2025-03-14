import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function AnimeDetails() {
  const { _id } = useParams();
  const { animes } = useAnime();
  const anime = animes.find(a => a._id === _id);

  if (!anime) {
    return <div>Anime not found</div>;
  }

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="w-full h-[400px] object-cover"
            src={anime.image}
            alt={anime.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#23252b] to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
          <div className="flex gap-8">
            <img
              src={anime.image}
              alt={anime.title}
              className="w-48 h-72 object-cover rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-bold mb-4">{anime.title}</h1>
              <p className="text-gray-300 mb-4">{anime.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                  {anime.category}
                </span>
                <span className="text-yellow-400">★ {anime.rating.toFixed(1)}</span>
              </div>
              {anime.seasons[0]?.episodes[0] && (
                <Link
                  to={`/watch/${anime._id}/${anime.seasons[0]._id}/${anime.seasons[0].episodes[0]._id}`}
                  className="inline-flex items-center bg-[#f47521] text-white px-6 py-3 rounded-md hover:bg-[#ff8a3d]"
                >
                  <Play className="h-5 w-5 mr-2" /> Start Watching
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {anime.seasons.map((season) => (
          <div key={season._id} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Season {season.number}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {season.episodes.map((episode) => (
                <Link
                  key={episode._id}
                  to={`/watch/${anime._id}/${season._id}/${episode._id}`}
                  className="group"
                >
                  <div className="relative">
                    <img
                      src={episode.thumbnail}
                      alt={episode.title}
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <Play className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mt-2 font-medium">Episode {episode.number}</h3>
                  <p className="text-sm text-gray-400">{episode.title}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimeDetails;