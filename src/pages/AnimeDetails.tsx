import React, { useRef, useState, TouchEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Home } from 'lucide-react';
import { useAnime } from '../context/AnimeContext';

function AnimeDetails() {
  const { _id } = useParams();
  const { animes } = useAnime();
  const anime = animes.find(a => a._id === _id);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  if (!anime) {
    return (
      <div className="min-h-screen bg-[#141821] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <div className="relative w-48 h-48 mx-auto mb-4">
              {/* 404 Image */}
              <div className="absolute inset-0 bg-[#1e2330] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#f47521] text-7xl font-bold opacity-20">404</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#141821] to-transparent" />
              </div>
              {/* Sad anime emoticon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl transform -rotate-90">(╥﹏╥)</div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Anime Not Found</h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Sorry, we couldn't find the anime you're looking for. It might have been removed or never existed.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-[#f47521] text-white font-medium rounded-lg hover:bg-[#ff8a3d] transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          {/* Random recommendations */}
          {animes.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-semibold text-white mb-4">Maybe you'd like these instead?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {animes.slice(0, 4).map((anime) => (
                  <Link
                    key={anime._id}
                    to={`/anime/${anime._id}`}
                    className="group"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2">
                      <img
                        src={anime.image}
                        alt={anime.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-white text-sm font-medium truncate">{anime.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141821]">
      {/* Mobile Hero Banner */}
      <div className="md:hidden relative pt-14">
        <div className="relative">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              className="w-full h-[500px] object-cover"
              src={anime.image}
              alt={anime.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141821] via-[#141821]/70 to-[#141821]/40" />
          </div>
          
          {/* Content */}
          <div className="relative px-4 pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Poster */}
              <div className="w-[200px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-6">
                <img 
                  src={anime.image} 
                  alt={anime.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* Info */}
              <div className="w-full pb-8">
                <h1 className="text-2xl font-bold text-white mb-3">{anime.title}</h1>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{anime.rating.toFixed(1)}</span>
                  </div>
                  <span className="px-2 py-1 bg-[#1e2330]/80 rounded-full text-xs text-gray-300">
                    {anime.category}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-6 max-w-md mx-auto">
                  {anime.description}
                </p>
                <Link
                  to={`/watch/anime/${anime._id}/${anime.seasons[0]?._id}/${anime.seasons[0]?.episodes[0]?._id}`}
                  className="inline-flex items-center px-6 py-3 bg-[#f47521] text-white text-sm font-medium rounded-lg hover:bg-[#ff8a3d] transition-colors"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Watching
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Hero Banner */}
      <div className="hidden md:block relative h-[500px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src={anime.image}
            alt={anime.title}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#141821]/70 to-[#141821]" />
        </div>

        {/* Content */}
        <div className="relative h-full">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="flex gap-8 items-start mt-20">
              <img 
                src={anime.image} 
                alt={anime.title}
                className="w-44 aspect-[2/3] object-cover rounded-lg shadow-2xl"
              />
              <div className="flex-1 pt-4">
                <h1 className="text-4xl font-bold text-white mb-4">{anime.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="h-5 w-5 mr-1" />
                    <span className="text-base font-medium">{anime.rating.toFixed(1)}</span>
                  </div>
                  <span className="bg-[#1e2330]/60 px-3 py-1 rounded-full text-sm text-gray-300">
                    {anime.category}
                  </span>
                </div>
                <p className="text-gray-300 mb-6 max-w-3xl">{anime.description}</p>
                <Link
                  to={`/watch/anime/${anime._id}/${anime.seasons[0]?._id}/${anime.seasons[0]?.episodes[0]?._id}`}
                  className="inline-flex items-center px-8 py-3 bg-[#f47521] text-white font-medium rounded-lg hover:bg-[#ff8a3d] transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Watching
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-0">
        {anime.seasons.map((season) => (
          <div key={season._id} className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Season {season.number}
            </h2>
            
            <div className="relative bg-[#1e2330] rounded-lg -mx-4 sm:mx-0">
              <div 
                ref={scrollContainerRef}
                className="overflow-x-auto no-scrollbar touch-pan-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex space-x-3 p-3 md:space-x-4 md:p-4" style={{ minWidth: 'min-content' }}>
                  {season.episodes.map((episode) => (
                    <Link
                      key={episode._id}
                      to={`/watch/anime/${anime._id}/${season._id}/${episode._id}`}
                      className="group flex-shrink-0 w-[160px] md:w-[200px] bg-[#141821] rounded-lg overflow-hidden hover:scale-105 transition-transform"
                    >
                      <div className="relative">
                        <img
                          src={episode.thumbnail}
                          alt={episode.title}
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        {episode.isNew && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#f47521] text-white text-[10px] rounded-full">
                            New
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-medium text-white">Episode {episode.number}</h3>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{episode.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Gradient shadows for scroll indication */}
              <div className="absolute left-0 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-r from-[#1e2330] to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-6 md:w-8 bg-gradient-to-l from-[#1e2330] to-transparent pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnimeDetails;