import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnime } from '../context/AnimeContext';
import { ChevronDown, ChevronUp, Plus, Trash, Search, Edit2, X, ArrowUp, ArrowDown, Globe2, Star, Play, Info } from 'lucide-react';

const animeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Must be a valid URL'),
  category: z.string().min(1, 'Category is required'),
  trending: z.boolean(),
  seasonTrending: z.boolean(),
  rating: z.number().min(0).max(10),
  isHindiDub: z.boolean().optional(),
  isTeluguDub: z.boolean().optional(),
  isNewEpisode: z.boolean().optional(),
  isMovie: z.boolean().optional()
});

const episodeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  number: z.number().min(1, 'Episode number is required'),
  doodstream: z.string().optional(),
  megacloud: z.string().optional(),
  mega: z.string().optional(),
  streamtape: z.string().optional(),
  thumbnail: z.string().url('Must be a valid URL'),
  duration: z.string().optional(),
  releaseDate: z.string().min(1, 'Release date is required')
}).refine(data => data.doodstream || data.megacloud || data.mega || data.streamtape, {
  message: "At least one video source must be provided",
  path: ["doodstream"]
});

type AnimeFormData = z.infer<typeof animeSchema>;
type EpisodeFormData = z.infer<typeof episodeSchema>;

interface Episode {
  _id: string;
  title: string;
  number: number;
  doodstream?: string;
  megacloud?: string;
  mega?: string;
  streamtape?: string;
  thumbnail: string;
  duration?: string;
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

const AdminPanel = () => {
  const { animes, addAnime, updateAnime, deleteAnime, addSeason, addEpisode, deleteEpisode, toggleAnimeFlag } = useAnime();
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEpisode, setEditingEpisode] = useState<{ _id: string; seasonId: string; animeId: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'anime' | 'episode';
    _id: string;
    seasonId?: string;
    animeId?: string;
    title: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'title' | 'category' | 'rating';
    direction: 'asc' | 'desc';
  }>({ key: 'title', direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'all' | 'popular' | 'hindiDub' | 'teluguDub' | 'newAnime' | 'movies'>('all');
  const [latestEpisodes, setLatestEpisodes] = useState<Array<{
    animeId: string;
    seasonId: string;
    episodeId: string;
    animeTitle: string;
    episodeNumber: number;
    episodeTitle: string;
    thumbnail: string;
    duration: string;
    releaseDate: string;
  }>>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const animeForm = useForm<AnimeFormData>({
    resolver: zodResolver(animeSchema),
    defaultValues: {
      trending: false,
      seasonTrending: false,
      rating: 0,
      isHindiDub: false,
      isTeluguDub: false,
      isNewEpisode: false,
      isMovie: false
    }
  });

  const episodeForm = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      number: 1,
      title: '',
      doodstream: '',
      megacloud: '',
      mega: '',
      streamtape: '',
      thumbnail: '',
      duration: '',
      releaseDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmitAnime = (data: AnimeFormData) => {
    addAnime(data);
    animeForm.reset();
  };

  const onSubmitEpisode = (data: EpisodeFormData) => {
    if (selectedAnime && selectedSeason) {
      const anime = animes.find(a => a._id === selectedAnime);
      const season = anime?.seasons.find(s => s._id === selectedSeason);
      
      // Check if episode number already exists in the season
      const isDuplicateNumber = season?.episodes.some(ep => ep.number === data.number);

      if (isDuplicateNumber) {
        episodeForm.setError('number', {
          type: 'manual',
          message: `Episode ${data.number} already exists in this season`
        });
        return;
      }

      const formattedData = {
        ...data,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        duration: data.duration || '',  // Provide empty string as default
        isNew: true
      };
      
      addEpisode(selectedAnime, selectedSeason, formattedData);
      episodeForm.reset();
      
      if (anime) {
        updateAnime(selectedAnime, { 
          isNewEpisode: true,
          seasons: anime.seasons.map(s => 
            s._id === selectedSeason 
              ? {
                  ...s,
                  episodes: [...s.episodes, { ...formattedData, _id: Date.now().toString() }]
                }
              : s
          )
        });
      }
    }
  };

  const handleAddSeason = (animeId: string) => {
    const anime = animes.find(a => a._id === animeId);
    if (anime) {
      const nextSeasonNumber = (anime.seasons || []).length + 1;
      addSeason(animeId, nextSeasonNumber);
    }
  };

  const filteredAnime = useMemo(() => {
    let filtered = [...animes];

    // Apply section filters first
    switch (activeSection) {
      case 'teluguDub':
        filtered = filtered.filter(anime => anime.isTeluguDub === true);
        break;
      case 'hindiDub':
        filtered = filtered.filter(anime => anime.isHindiDub === true);
        break;
      case 'popular':
        filtered = filtered.filter(anime => anime.trending === true);
        break;
      case 'newAnime':
        filtered = filtered.filter(anime => anime.isNewEpisode === true);
        break;
      case 'movies':
        filtered = filtered.filter(anime => anime.isMovie === true);
        break;
      // 'all' case doesn't need filtering
    }

    // Then apply search filter
    if (searchQuery) {
      filtered = filtered.filter(anime =>
        anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anime.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Finally apply category filter
    if (filterCategory && filterCategory !== 'All Categories') {
      filtered = filtered.filter(anime => anime.category === filterCategory);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      if (sortConfig.key === 'rating') {
        return sortConfig.direction === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
      const aValue = a[sortConfig.key].toLowerCase();
      const bValue = b[sortConfig.key].toLowerCase();
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [animes, activeSection, searchQuery, filterCategory, sortConfig]);

  const handleSort = (key: 'title' | 'category' | 'rating') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(animes.map(anime => anime.category)));
  }, [animes]);

  const handleUpdateEpisode = (data: EpisodeFormData) => {
    if (editingEpisode) {
      const { animeId, seasonId, _id } = editingEpisode;
      const anime = animes.find(a => a._id === animeId);
      if (!anime) return;
      
      const season = anime.seasons.find(s => s._id === seasonId);
      
      // Check if episode number exists when updating (excluding the current episode)
      const isDuplicateNumber = season?.episodes.some(ep => 
        ep.number === data.number && ep._id !== _id
      );

      if (isDuplicateNumber) {
        episodeForm.setError('number', {
          type: 'manual',
          message: `Episode ${data.number} already exists in this season`
        });
        return;
      }

      const formattedData = {
        ...data,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        duration: data.duration || '',  // Provide empty string as default
        isNew: true
      };

      updateAnime(animeId, {
        isNewEpisode: true,
        seasons: anime.seasons.map(season =>
          season._id === seasonId ? {
            ...season,
            episodes: season.episodes.map(ep =>
              ep._id === _id ? { ...ep, ...formattedData } : ep
            )
          } : season
        )
      });
      setEditingEpisode(null);
      episodeForm.reset();
    } else {
      onSubmitEpisode(data);
    }
  };

  const handleEpisodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await episodeForm.handleSubmit(handleUpdateEpisode)();
    } catch (error) {
      console.error('Episode form error:', error);
    }
  };

  // Remove the automatic new episode status check
  useEffect(() => {
    const checkNewEpisodes = () => {
      animes.forEach(anime => {
        // We don't automatically update isNewEpisode anymore
        // It will be controlled manually through the toggle
      });
    };

    checkNewEpisodes();
    const interval = setInterval(checkNewEpisodes, 3600000);
    return () => clearInterval(interval);
  }, [animes, updateAnime]);

  const updateLatestEpisodes = useMemo(() => {
    const episodes = animes.flatMap(anime => 
      anime.seasons.flatMap(season => 
        season.episodes.map(episode => ({
          animeId: anime._id,
          seasonId: season._id,
          episodeId: episode._id,
          animeTitle: anime.title,
          episodeNumber: episode.number,
          episodeTitle: episode.title,
          thumbnail: episode.thumbnail,
          duration: episode.duration,
          releaseDate: episode.releaseDate
        }))
      )
    );

    return episodes.sort((a, b) => 
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    ).slice(0, 10);
  }, [animes]);

  useEffect(() => {
    setLatestEpisodes(updateLatestEpisodes);
  }, [updateLatestEpisodes]);

  const handleDeleteClick = (type: 'anime' | 'episode', _id: string, title: string, animeId?: string, seasonId?: string) => {
    setDeleteConfirmation({ type, _id, animeId, seasonId, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'anime') {
      deleteAnime(deleteConfirmation._id);
    } else {
      if (deleteConfirmation.animeId && deleteConfirmation.seasonId) {
        deleteEpisode(deleteConfirmation.animeId, deleteConfirmation.seasonId, deleteConfirmation._id);
      }
    }
    setDeleteConfirmation(null);
  };

  // Update the handleNavigationClick function
  const handleNavigationClick = (section: 'all' | 'popular' | 'hindiDub' | 'teluguDub' | 'newAnime' | 'movies') => {
    setActiveSection(section);
    setFilterCategory(''); // Reset category filter when changing sections
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 bg-white dark:bg-[#141821] mt-16 sm:mt-20">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Sidebar Navigation - Collapsible on mobile */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 sm:p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Quick Navigation</h2>
            </div>
            
            {/* Navigation buttons in grid for mobile, stack for desktop */}
            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              <button
                onClick={() => handleNavigationClick('all')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'all' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> 
                <span className="truncate">All Anime ({animes.length})</span>
              </button>
              <button
                onClick={() => handleNavigationClick('popular')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'popular' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Star className="h-4 w-4" /> 
                <span className="truncate">Popular ({animes.filter(anime => anime.trending).length})</span>
              </button>
              <button
                onClick={() => handleNavigationClick('hindiDub')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'hindiDub' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> 
                <span className="truncate">Hindi Dubbed ({animes.filter(anime => anime.isHindiDub).length})</span>
              </button>
              <button
                onClick={() => handleNavigationClick('teluguDub')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'teluguDub' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> 
                <span className="truncate">Telugu Dubbed ({animes.filter(anime => anime.isTeluguDub).length})</span>
              </button>
              <button
                onClick={() => handleNavigationClick('newAnime')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'newAnime' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Play className="h-4 w-4" /> 
                <span className="truncate">New Anime ({animes.filter(anime => anime.isNewEpisode).length})</span>
              </button>
              <button
                onClick={() => handleNavigationClick('movies')}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                  activeSection === 'movies' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Play className="h-4 w-4" /> 
                <span className="truncate">Movies ({animes.filter(anime => anime.isMovie).length})</span>
              </button>
            </nav>

            {/* Quick Search and Filter - Full width on mobile */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 rounded-md pl-9 pr-3 py-2 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">Admin Panel</h1>
      
          {/* Add Anime Form - Responsive grid */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <Plus className="h-5 w-5 text-[#f47521] mr-2" /> Add New Anime
            </h2>
            <form onSubmit={animeForm.handleSubmit(onSubmitAnime)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  {...animeForm.register('title')}
                  className="w-full bg-gray-700 rounded-md px-4 py-2"
                  placeholder="Enter anime title"
                />
                {animeForm.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{animeForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  {...animeForm.register('category')}
                  className="w-full bg-gray-700 rounded-md px-4 py-2"
                >
                  <option value="">Select category</option>
                  <option value="Action">Action</option>
                  <option value="Romance">Romance</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Drama">Drama</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                </select>
                {animeForm.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{animeForm.formState.errors.category.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...animeForm.register('description')}
                  className="w-full bg-gray-700 rounded-md px-4 py-2"
                  rows={4}
                  placeholder="Enter anime description"
                />
                {animeForm.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{animeForm.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  {...animeForm.register('image')}
                  className="w-full bg-gray-700 rounded-md px-4 py-2"
                  placeholder="Enter image URL"
                />
                {animeForm.formState.errors.image && (
                  <p className="text-red-500 text-sm mt-1">{animeForm.formState.errors.image.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rating (0-10)</label>
                <input
                  type="number"
                  {...animeForm.register('rating', { valueAsNumber: true })}
                  className="w-full bg-gray-700 rounded-md px-4 py-2"
                  min="0"
                  max="10"
                  step="0.1"
                />
                {animeForm.formState.errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{animeForm.formState.errors.rating.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...animeForm.register('trending')}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Trending</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...animeForm.register('seasonTrending')}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Season Trending</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...animeForm.register('isHindiDub')}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Hindi Dub</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...animeForm.register('isTeluguDub')}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Telugu Dub</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...animeForm.register('isMovie')}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Movie</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-[#f47521] text-white px-4 py-2 rounded-md hover:bg-[#f47521]/80 transition-colors"
                >
                  Add Anime
                </button>
              </div>
            </form>
          </div>

          {/* Manage Anime Section - Responsive layout */}
          <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg">
            <div className="flex flex-col gap-4">
              {/* Header with responsive search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Manage Anime</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="relative flex-grow sm:w-64">
                    <input
                      type="text"
                      placeholder="Search anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-700 rounded-md pl-9 pr-3 py-2 text-sm"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full sm:w-48 bg-gray-700 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Anime Cards - Responsive grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredAnime.map((anime) => (
                  <div key={anime._id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-start gap-4 p-3 sm:p-4">
                      {/* Anime Image - Responsive size */}
                      <div className="w-full sm:w-40 lg:w-48 aspect-[3/4] rounded-lg overflow-hidden shrink-0">
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Anime Details - Responsive layout */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg sm:text-xl font-semibold truncate">{anime.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-[#f47521]" />
                              {anime.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{anime.category}</span>
                            <span>•</span>
                            <span>{anime.seasons.length} Season(s)</span>
                            <span>•</span>
                            <span>{anime.seasons.reduce((acc, season) => acc + season.episodes.length, 0)} Episode(s)</span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{anime.description}</p>
                        </div>

                        {/* Feature Toggles - Responsive grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'trending')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.trending ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            Trending
                          </button>
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'seasonTrending')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.seasonTrending ? 'bg-[#f47521] text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            Season
                          </button>
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'isHindiDub')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.isHindiDub ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            Hindi
                          </button>
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'isTeluguDub')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.isTeluguDub ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            Telugu
                          </button>
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'isNewEpisode')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.isNewEpisode ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            New
                          </button>
                          <button
                            onClick={() => toggleAnimeFlag(anime._id, 'isMovie')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              anime.isMovie ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            Movie
                          </button>
                        </div>

                        {/* Actions - Responsive layout */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => setSelectedAnime(selectedAnime === anime._id ? null : anime._id)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all duration-200 text-sm font-medium w-full sm:w-auto"
                          >
                            {selectedAnime === anime._id ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                <span>Hide Seasons</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                <span>Show Seasons</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick('anime', anime._id, anime.title)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white transition-all duration-200 text-sm font-medium w-full sm:w-auto"
                          >
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Seasons/Episodes Section - Responsive layout */}
                    {selectedAnime === anime._id && (
                      <div className="border-t border-gray-600 p-3 sm:p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">Seasons</h4>
                          <button
                            onClick={() => handleAddSeason(anime._id)}
                            className="flex items-center gap-1 text-sm bg-[#f47521] px-3 py-1 rounded hover:bg-[#f47521]/80 transition-colors"
                          >
                            <Plus className="h-4 w-4" /> Add Season
                          </button>
                        </div>

                        {/* Season List */}
                        <div className="space-y-4">
                          {anime.seasons.map((season) => (
                            <div key={season._id} className="bg-gray-800 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">Season {season.number}</h5>
                                <button
                                  onClick={() => setSelectedSeason(selectedSeason === season._id ? null : season._id)}
                                  className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                  {selectedSeason === season._id ? 'Hide Episodes' : 'Show Episodes'}
                                </button>
                              </div>

                              {selectedSeason === season._id && (
                                <div className="mt-3">
                                  {/* Episode Form - Better desktop layout */}
                                  <form onSubmit={handleEpisodeSubmit} className="bg-[#1e2330] rounded-lg p-3 sm:p-6 mb-4 episode-form">
                                    <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-white flex items-center gap-2">
                                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-[#f47521]" />
                                      {editingEpisode ? 'Edit Episode' : 'Add Episode'}
                                    </h3>
                                    
                                    <div className="space-y-4 sm:space-y-6">
                                      {/* Basic Info - 2 columns on desktop */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium mb-1.5 text-gray-200">Title</label>
                                          <input
                                            {...episodeForm.register('title')}
                                            className="w-full bg-[#272b38] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                            placeholder="Episode title"
                                          />
                                          {episodeForm.formState.errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{episodeForm.formState.errors.title.message}</p>
                                          )}
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1.5 text-gray-200">Number</label>
                                          <input
                                            type="number"
                                            {...episodeForm.register('number', { valueAsNumber: true })}
                                            className="w-full bg-[#272b38] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                            placeholder="#"
                                          />
                                          {episodeForm.formState.errors.number && (
                                            <p className="text-red-500 text-xs mt-1">{episodeForm.formState.errors.number.message}</p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Video Sources - Grid layout on desktop */}
                                      <div className="bg-[#272b38] rounded-lg p-4">
                                        <h4 className="text-sm font-medium mb-3 text-white flex items-center gap-2">
                                          <Play className="h-4 w-4" />
                                          Video Sources
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">DoodStream</label>
                                            <input
                                              {...episodeForm.register('doodstream')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="Video ID"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">MegaCloud</label>
                                            <input
                                              {...episodeForm.register('megacloud')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="Video ID"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">Mega.nz</label>
                                            <input
                                              {...episodeForm.register('mega')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="Video ID"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">Streamtape</label>
                                            <input
                                              {...episodeForm.register('streamtape')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="Video ID"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Additional Details - Grid layout on desktop */}
                                      <div className="bg-[#272b38] rounded-lg p-4">
                                        <h4 className="text-sm font-medium mb-3 text-white flex items-center gap-2">
                                          <Info className="h-4 w-4" />
                                          Additional Details
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">Thumbnail URL</label>
                                            <input
                                              {...episodeForm.register('thumbnail')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="Enter thumbnail URL"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">Duration</label>
                                            <input
                                              {...episodeForm.register('duration')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                              placeholder="24:30"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-300">Release Date</label>
                                            <input
                                              type="date"
                                              {...episodeForm.register('releaseDate')}
                                              className="w-full bg-[#1e2330] rounded text-sm px-3 py-2 text-white border border-gray-600"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                      <p className="text-sm text-gray-400 flex items-center gap-2">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f47521]"></span>
                                        At least one video source required
                                      </p>
                                      <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {editingEpisode && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingEpisode(null);
                                              episodeForm.reset({
                                                title: '',
                                                number: 1,
                                                doodstream: '',
                                                megacloud: '',
                                                mega: '',
                                                streamtape: '',
                                                thumbnail: '',
                                                duration: '',
                                                releaseDate: new Date().toISOString().split('T')[0]
                                              });
                                            }}
                                            className="flex-1 sm:flex-none px-4 py-2 rounded-md bg-[#272b38] text-gray-300 text-sm font-medium hover:bg-[#2f3446] transition-colors flex items-center justify-center gap-2"
                                          >
                                            <X className="h-4 w-4" />
                                            Cancel
                                          </button>
                                        )}
                                        <button
                                          type="submit"
                                          className="flex-1 sm:flex-none px-4 py-2 rounded-md bg-[#f47521] text-white text-sm font-medium hover:bg-[#f47521]/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                          {editingEpisode ? (
                                            <>
                                              <Edit2 className="h-4 w-4" />
                                              Update Episode
                                            </>
                                          ) : (
                                            <>
                                              <Plus className="h-4 w-4" />
                                              Add Episode
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  </form>

                                  {/* Episode List */}
                                  <div className="relative">
                                    <div 
                                      ref={scrollContainerRef}
                                      className="overflow-x-auto no-scrollbar touch-pan-x"
                                      onTouchStart={handleTouchStart}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                      <div className="flex space-x-4 pb-4" style={{ minWidth: 'min-content' }}>
                                {season.episodes
                                  .slice()
                                  .sort((a, b) => a.number - b.number)
                                  .map((episode) => (
                                  <div 
                                    key={episode._id} 
                                    className="flex-shrink-0 w-[280px] bg-gray-700 rounded-lg overflow-hidden group hover:bg-gray-600 transition-colors"
                                  >
                                    <div className="relative">
                                      <img 
                                        src={episode.thumbnail} 
                                        alt={episode.title}
                                        className="w-full aspect-video object-cover"
                                      />
                                      {episode.isNew && (
                                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#f47521] text-white text-xs rounded-full">
                                          New
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-4">
                                      <h4 className="font-medium">Episode {episode.number}</h4>
                                      <p className="text-sm text-gray-400 truncate">{episode.title}</p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                        <span>{episode.duration}</span>
                                        <span>•</span>
                                        <span>{new Date(episode.releaseDate).toLocaleDateString()}</span>
                                      </div>
                                      {/* Video source indicators */}
                                      <div className="flex flex-wrap gap-2 mt-3">
                                        {episode.doodstream && (
                                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">VidSrc</span>
                                        )}
                                        {episode.megacloud && (
                                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">MegaCloud</span>
                                        )}
                                        {episode.mega && (
                                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full">Mega</span>
                                        )}
                                      </div>
                                      {/* Action buttons */}
                                      <div className="flex items-center gap-2 mt-4">
                                        <button
                                          onClick={() => {
                                            if (editingEpisode?._id === episode._id) {
                                              setEditingEpisode(null);
                                              episodeForm.reset({
                                                title: '',
                                                number: 1,
                                                doodstream: '',
                                                megacloud: '',
                                                mega: '',
                                                streamtape: '',
                                                thumbnail: '',
                                                duration: '',
                                                releaseDate: new Date().toISOString().split('T')[0]
                                              });
                                            } else {
                                              setEditingEpisode({
                                                _id: episode._id,
                                                seasonId: season._id,
                                                animeId: anime._id
                                              });
                                              // Set all form values with existing episode data
                                              episodeForm.setValue('title', episode.title);
                                              episodeForm.setValue('number', episode.number);
                                              episodeForm.setValue('doodstream', episode.doodstream || '');
                                              episodeForm.setValue('megacloud', episode.megacloud || '');
                                              episodeForm.setValue('mega', episode.mega || '');
                                              episodeForm.setValue('streamtape', episode.streamtape || '');
                                              episodeForm.setValue('thumbnail', episode.thumbnail);
                                              episodeForm.setValue('duration', episode.duration);
                                              episodeForm.setValue('releaseDate', episode.releaseDate);
                                              
                                              // Scroll the form into view
                                              const formElement = document.querySelector('.episode-form');
                                              formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                          }}
                                          className="flex-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                                        >
                                          {editingEpisode?._id === episode._id ? 'Cancel Edit' : 'Edit'}
                                        </button>
                                        <button
                                          onClick={() => handleDeleteClick('episode', episode._id, episode.title, anime._id, season._id)}
                                          className="flex-1 px-3 py-1.5 bg-red-600/20 text-red-500 text-sm rounded hover:bg-red-600/30 transition-colors"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                      </div>
                                    </div>
                                    {/* Gradient shadows for scroll indication */}
                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#141821] to-transparent pointer-events-none" />
                                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#141821] to-transparent pointer-events-none" />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Responsive sizing */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Confirm Delete</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete {deleteConfirmation.type === 'anime' ? 'anime' : 'episode'} "
              <span className="font-medium text-gray-900 dark:text-white">{deleteConfirmation.title}</span>"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;