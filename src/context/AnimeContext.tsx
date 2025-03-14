import React, { createContext, useContext, useState, useEffect } from 'react';

interface Episode {
  id: string;
  title: string;
  number: number;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  releaseDate: string;
  isNew?: boolean;
}

interface Season {
  id: string;
  number: number;
  episodes: Episode[];
}

interface Anime {
  id: string;
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
}

interface AnimeContextType {
  animes: Anime[];
  trending: Anime[];
  addAnime: (anime: Omit<Anime, 'id' | 'seasons'>) => void;
  updateAnime: (id: string, anime: Partial<Anime>) => void;
  deleteAnime: (id: string) => void;
  searchAnimes: (query: string) => Anime[];
  addSeason: (animeId: string, seasonNumber: number) => void;
  addEpisode: (animeId: string, seasonId: string, episode: Omit<Episode, 'id'>) => void;
  deleteEpisode: (animeId: string, seasonId: string, episodeId: string) => void;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export function AnimeProvider({ children }: { children: React.ReactNode }) {
  const [animes, setAnimes] = useState<Anime[]>(() => {
    const saved = localStorage.getItem('animes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('animes', JSON.stringify(animes));
  }, [animes]);

  const trending = animes.filter(anime => anime.trending);

  const addAnime = (anime: Omit<Anime, 'id' | 'seasons'>) => {
    const newAnime = {
      ...anime,
      id: Math.random().toString(36).substr(2, 9),
      seasons: []
    };
    setAnimes(prev => [...prev, newAnime]);
  };

  const updateAnime = (id: string, updates: Partial<Anime>) => {
    setAnimes(prev => prev.map(anime => 
      anime.id === id ? { ...anime, ...updates } : anime
    ));
  };

  const deleteAnime = (id: string) => {
    setAnimes(prev => prev.filter(anime => anime.id !== id));
  };

  const searchAnimes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return animes.filter(anime => 
      anime.title.toLowerCase().includes(lowercaseQuery) ||
      anime.description.toLowerCase().includes(lowercaseQuery) ||
      anime.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addSeason = (animeId: string, seasonNumber: number) => {
    setAnimes(prev => prev.map(anime => {
      if (anime.id === animeId) {
        return {
          ...anime,
          seasons: [
            ...anime.seasons,
            {
              id: Math.random().toString(36).substr(2, 9),
              number: seasonNumber,
              episodes: []
            }
          ]
        };
      }
      return anime;
    }));
  };

  const addEpisode = (animeId: string, seasonId: string, episode: Omit<Episode, 'id'>) => {
    setAnimes(prev => prev.map(anime => {
      if (anime.id === animeId) {
        return {
          ...anime,
          seasons: anime.seasons.map(season => {
            if (season.id === seasonId) {
              return {
                ...season,
                episodes: [
                  ...season.episodes,
                  {
                    ...episode,
                    id: Math.random().toString(36).substr(2, 9),
                    isNew: true
                  }
                ]
              };
            }
            return season;
          })
        };
      }
      return anime;
    }));
  };

  const deleteEpisode = (animeId: string, seasonId: string, episodeId: string) => {
    setAnimes(prev => prev.map(anime => {
      if (anime.id === animeId) {
        return {
          ...anime,
          seasons: anime.seasons.map(season => {
            if (season.id === seasonId) {
              return {
                ...season,
                episodes: season.episodes.filter(ep => ep.id !== episodeId)
              };
            }
            return season;
          })
        };
      }
      return anime;
    }));
  };

  return (
    <AnimeContext.Provider value={{
      animes,
      trending,
      addAnime,
      updateAnime,
      deleteAnime,
      searchAnimes,
      addSeason,
      addEpisode,
      deleteEpisode
    }}>
      {children}
    </AnimeContext.Provider>
  );
}

export function useAnime() {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
}