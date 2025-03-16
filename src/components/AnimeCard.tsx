import React from 'react';
import { Link } from 'react-router-dom';

interface Episode {
  _id: string;
  title: string;
  number: number;
  doodstream?: string;
  megacloud?: string;
  mega?: string;
  streamtape?: string;
  thumbnail: string;
  duration: string;
  releaseDate: string;
  isNew?: boolean;
}

interface Season {
  _id: string;
  number: number;
  episodes: Episode[];
}

interface Anime {
  _id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  trending: boolean;
  seasonTrending?: boolean;
  rating: number;
  seasons: Season[];
  isHindiDub?: boolean;
  isTeluguDub?: boolean;
  isNewEpisode?: boolean;
  isMovie?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface AnimeCardProps {
  anime: Anime;
}

function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link to={`/anime/${anime._id}`} className="group relative">
      <img
        className="w-full h-64 object-cover rounded-lg transition-transform group-hover:scale-105"
        src={anime.image}
        alt={anime.title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
        <div className="absolute bottom-0 p-4">
          <h3 className="text-sm font-semibold">{anime.title}</h3>
          <p className="text-xs text-gray-300">{anime.category}</p>
          <div className="flex items-center mt-1">
            <span className="text-xs text-yellow-400">★ {anime.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-300 ml-2">
              {anime.seasons.length} Season{anime.seasons.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default AnimeCard;