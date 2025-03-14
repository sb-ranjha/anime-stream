import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAnime } from '../context/AnimeContext';
import { ChevronDown, ChevronUp, Plus, Trash, Search, Edit2, X, ArrowUp, ArrowDown, Globe2, Star, Play } from 'lucide-react';

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
  isNewEpisode: z.boolean().optional()
});

const episodeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  number: z.number().min(1, 'Episode number is required'),
  videoUrl: z.string().url('Must be a valid URL'),
  thumbnail: z.string().url('Must be a valid URL'),
  duration: z.string().min(1, 'Duration is required'),
  releaseDate: z.string().min(1, 'Release date is required')
});

type AnimeFormData = z.infer<typeof animeSchema>;
type EpisodeFormData = z.infer<typeof episodeSchema>;

const AdminPanel = () => {
  const { animes, addAnime, updateAnime, deleteAnime, addSeason, addEpisode, deleteEpisode } = useAnime();
  const [selectedAnime, setSelectedAnime] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEpisode, setEditingEpisode] = useState<{ id: string; seasonId: string; animeId: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'anime' | 'episode';
    id: string;
    seasonId?: string;
    animeId?: string;
    title: string;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: 'title' | 'category' | 'rating';
    direction: 'asc' | 'desc';
  }>({ key: 'title', direction: 'asc' });
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'all' | 'popular' | 'hindiDub' | 'teluguDub' | 'newEpisodes'>('all');
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

  const animeForm = useForm<AnimeFormData>({
    resolver: zodResolver(animeSchema),
    defaultValues: {
      trending: false,
      seasonTrending: false,
      rating: 0,
      isHindiDub: false,
      isTeluguDub: false,
      isNewEpisode: false
    }
  });

  const episodeForm = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      number: 1,
      title: '',
      videoUrl: '',
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
      const formattedData = {
        ...data,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        isNew: true
      };
      
      addEpisode(selectedAnime, selectedSeason, formattedData);
      episodeForm.reset();
      
      const anime = animes.find(a => a.id === selectedAnime);
      if (anime) {
        updateAnime(selectedAnime, { 
          isNewEpisode: true,
          seasons: anime.seasons.map(s => 
            s.id === selectedSeason 
              ? {
                  ...s,
                  episodes: [...s.episodes, { ...formattedData, id: Date.now().toString() }]
                }
              : s
          )
        });
      }
    }
  };

  const handleAddSeason = (animeId: string) => {
    const anime = animes.find(a => a.id === animeId);
    if (anime) {
      const nextSeasonNumber = anime.seasons.length + 1;
      addSeason(animeId, nextSeasonNumber);
    }
  };

  const filteredAndSortedAnimes = useMemo(() => {
    let filtered = animes.filter(anime => {
      const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          anime.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || anime.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

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
  }, [animes, searchQuery, sortConfig, filterCategory]);

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
      const { animeId, seasonId, id } = editingEpisode;
      const formattedData = {
        ...data,
        releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
        isNew: true
      };

      const anime = animes.find(a => a.id === animeId);
      if (anime) {
        updateAnime(animeId, {
          isNewEpisode: true,
          seasons: anime.seasons.map(season =>
            season.id === seasonId ? {
              ...season,
              episodes: season.episodes.map(ep =>
                ep.id === id ? { ...ep, ...formattedData } : ep
              )
            } : season
          )
        });
      }
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

  const filteredAnimesBySection = useMemo(() => {
    // First apply search and category filters
    let filtered = animes.filter(anime => {
      const matchesSearch = anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          anime.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filterCategory || anime.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Then apply section-specific filters
    switch (activeSection) {
      case 'popular':
        return filtered.filter(anime => anime.trending === true);
      case 'hindiDub':
        return filtered.filter(anime => anime.isHindiDub === true);
      case 'teluguDub':
        return filtered.filter(anime => anime.isTeluguDub === true);
      case 'newEpisodes':
        // Only show animes that are marked as having new episodes
        return filtered.filter(anime => anime.isNewEpisode === true);
      default:
        return filtered;
    }
  }, [animes, searchQuery, filterCategory, activeSection]);

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
          animeId: anime.id,
          seasonId: season.id,
          episodeId: episode.id,
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

  const handleDeleteClick = (type: 'anime' | 'episode', id: string, title: string, animeId?: string, seasonId?: string) => {
    setDeleteConfirmation({ type, id, animeId, seasonId, title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmation) return;

    if (deleteConfirmation.type === 'anime') {
      deleteAnime(deleteConfirmation.id);
    } else {
      if (deleteConfirmation.animeId && deleteConfirmation.seasonId) {
        deleteEpisode(deleteConfirmation.animeId, deleteConfirmation.seasonId, deleteConfirmation.id);
      }
    }
    setDeleteConfirmation(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 bg-white dark:bg-[#141821]">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 sticky top-20">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Quick Navigation</h2>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('all')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeSection === 'all' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> All Anime ({animes.length})
              </button>
              <button
                onClick={() => setActiveSection('popular')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeSection === 'popular' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Star className="h-4 w-4" /> Popular ({animes.filter(anime => anime.trending).length})
              </button>
              <button
                onClick={() => setActiveSection('hindiDub')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeSection === 'hindiDub' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> Hindi Dubbed ({animes.filter(anime => anime.isHindiDub).length})
              </button>
              <button
                onClick={() => setActiveSection('teluguDub')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeSection === 'teluguDub' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Globe2 className="h-4 w-4" /> Telugu Dubbed ({animes.filter(anime => anime.isTeluguDub).length})
              </button>
              <button
                onClick={() => setActiveSection('newEpisodes')}
                className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeSection === 'newEpisodes' 
                    ? 'bg-[#f47521] text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Play className="h-4 w-4" /> New Episodes ({animes.filter(anime => anime.isNewEpisode).length})
              </button>
            </nav>

            {/* Quick Search and Filter */}
            <div className="mt-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 rounded-md pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Admin Panel</h1>
      
      {/* Add Anime Form */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <Plus className="h-5 w-5 text-[#f47521] mr-2" /> Add New Anime
            </h2>
            <form onSubmit={animeForm.handleSubmit(onSubmitAnime)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="md:col-span-2">
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

              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
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
              </div>

              <div className="md:col-span-2">
          <button
            type="submit"
                  className="w-full bg-[#f47521] text-white px-4 py-2 rounded-md hover:bg-[#f47521]/80 transition-colors"
          >
            Add Anime
          </button>
              </div>
        </form>
      </div>

          {/* Manage Anime Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 md:p-6 rounded-lg">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Anime</h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  <div className="relative flex-grow md:w-64">
                    <input
                      type="text"
                      placeholder="Search anime..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-700 rounded-md pl-10 pr-4 py-2"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full md:w-48 bg-gray-700 rounded-md px-4 py-2"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Header */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center gap-4 text-sm font-medium">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 hover:text-[#f47521] transition-colors flex-1"
                >
                  Title
                  {sortConfig.key === 'title' && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-2 hover:text-[#f47521] transition-colors w-32"
                >
                  Category
                  {sortConfig.key === 'category' && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleSort('rating')}
                  className="flex items-center gap-2 hover:text-[#f47521] transition-colors w-32"
                >
                  Rating
                  {sortConfig.key === 'rating' && (
                    sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </button>
                <div className="w-32">Actions</div>
              </div>

              {/* Anime List */}
              <div className="space-y-4">
                {filteredAndSortedAnimes.map((anime) => (
                  <div key={anime.id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row items-start gap-4 p-4">
                      {/* Anime Image */}
                      <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={anime.image}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Anime Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-xl font-semibold">{anime.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-[#f47521]" />
                              {anime.rating.toFixed(1)}
                            </span>
                            <span>{anime.category}</span>
                            <span>{anime.seasons.length} Season(s)</span>
                            <span>{anime.seasons.reduce((acc, season) => acc + season.episodes.length, 0)} Episode(s)</span>
                          </div>
                          <p className="text-sm text-gray-300 line-clamp-2">{anime.description}</p>
                          
                          {/* Feature Toggles */}
                          <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => updateAnime(anime.id, { trending: !anime.trending })}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                anime.trending ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Trending
                            </button>
                            <button
                              onClick={() => updateAnime(anime.id, { seasonTrending: !anime.seasonTrending })}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                anime.seasonTrending ? 'bg-[#f47521] text-white' : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Season
                            </button>
                            <button
                              onClick={() => updateAnime(anime.id, { isHindiDub: !anime.isHindiDub })}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                anime.isHindiDub ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Hindi
                            </button>
                            <button
                              onClick={() => updateAnime(anime.id, { isTeluguDub: !anime.isTeluguDub })}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                anime.isTeluguDub ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              Telugu
                  </button>
                            <button
                              onClick={() => updateAnime(anime.id, { isNewEpisode: !anime.isNewEpisode })}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                anime.isNewEpisode ? 'bg-purple-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              New
                            </button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setSelectedAnime(selectedAnime === anime.id ? null : anime.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 transition-colors text-sm"
                  >
                    {selectedAnime === anime.id ? (
                              <>Hide Seasons <ChevronUp className="h-4 w-4" /></>
                    ) : (
                              <>Show Seasons <ChevronDown className="h-4 w-4" /></>
                    )}
                  </button>
                  <button
                            onClick={() => handleDeleteClick('anime', anime.id, anime.title)}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-600 hover:bg-red-500 transition-colors text-sm"
                  >
                            Delete <Trash className="h-4 w-4" />
                  </button>
                        </div>
                </div>
              </div>

                    {/* Seasons Section */}
              {selectedAnime === anime.id && (
                <div className="border-t border-gray-600 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Seasons</h4>
                    <button
                      onClick={() => handleAddSeason(anime.id)}
                            className="flex items-center gap-1 text-sm bg-[#f47521] px-3 py-1 rounded hover:bg-[#f47521]/80 transition-colors"
                    >
                            <Plus className="h-4 w-4" /> Add Season
                    </button>
                  </div>

                        {/* Season List */}
                        <div className="space-y-4">
                  {anime.seasons.map((season) => (
                            <div key={season.id} className="bg-gray-800 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                        <h5 className="font-medium">Season {season.number}</h5>
                        <button
                          onClick={() => setSelectedSeason(selectedSeason === season.id ? null : season.id)}
                                  className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          {selectedSeason === season.id ? 'Hide Episodes' : 'Show Episodes'}
                        </button>
                      </div>

                      {selectedSeason === season.id && (
                                <div className="mt-4 space-y-4">
                                  {/* Episode Form */}
                                  <form onSubmit={handleEpisodeSubmit} className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-600/50">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                                      <Plus className="h-5 w-5 text-[#f47521]" />
                                      {editingEpisode ? 'Edit Episode' : 'Add New Episode'}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Episode Title</label>
                              <input
                                {...episodeForm.register('title')}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all placeholder:text-gray-500"
                                          placeholder="Enter episode title"
                                        />
                                        {episodeForm.formState.errors.title && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.title.message}
                                          </p>
                                        )}
                            </div>

                            <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Episode Number</label>
                              <input
                                type="number"
                                {...episodeForm.register('number', { valueAsNumber: true })}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all placeholder:text-gray-500"
                                          min="1"
                                          placeholder="Enter episode number"
                                        />
                                        {episodeForm.formState.errors.number && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.number.message}
                                          </p>
                                        )}
                            </div>

                            <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Video URL</label>
                              <input
                                {...episodeForm.register('videoUrl')}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all placeholder:text-gray-500"
                                          placeholder="Enter video URL"
                                        />
                                        {episodeForm.formState.errors.videoUrl && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.videoUrl.message}
                                          </p>
                                        )}
                            </div>

                            <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Thumbnail URL</label>
                              <input
                                {...episodeForm.register('thumbnail')}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all placeholder:text-gray-500"
                                          placeholder="Enter thumbnail URL"
                                        />
                                        {episodeForm.formState.errors.thumbnail && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.thumbnail.message}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Duration</label>
                                        <input
                                          {...episodeForm.register('duration')}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all placeholder:text-gray-500"
                                          placeholder="e.g. 24:30"
                                        />
                                        {episodeForm.formState.errors.duration && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.duration.message}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-200">Release Date</label>
                                        <input
                                          type="date"
                                          {...episodeForm.register('releaseDate')}
                                          className="w-full bg-gray-800/80 rounded-lg px-4 py-3 border border-gray-600 focus:border-[#f47521] focus:ring-2 focus:ring-[#f47521]/20 transition-all text-gray-200"
                                        />
                                        {episodeForm.formState.errors.releaseDate && (
                                          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                                            {episodeForm.formState.errors.releaseDate.message}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between gap-4">
                                      <div className="flex items-center text-gray-400 text-sm">
                                        <span className="inline-block w-1 h-1 rounded-full bg-[#f47521] mr-2"></span>
                                        All fields are required
                            </div>
                                      <div className="flex items-center gap-3">
                                        {editingEpisode && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingEpisode(null);
                                              episodeForm.reset();
                                            }}
                                            className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-300 font-medium flex items-center gap-2"
                                          >
                                            <X className="h-4 w-4" />
                                            Cancel
                                          </button>
                                        )}
                            <button
                              type="submit"
                                          className="px-6 py-2.5 rounded-lg bg-[#f47521] hover:bg-[#f47521]/90 transition-colors font-medium text-white flex items-center gap-2"
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
                                  <div className="space-y-3">
                            {season.episodes.map((episode) => (
                                      <div 
                                        key={episode.id} 
                                        className="bg-gray-700 rounded-lg p-4 flex items-center justify-between group hover:bg-gray-600 transition-colors"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="h-16 w-28 rounded-md overflow-hidden">
                                            <img 
                                              src={episode.thumbnail} 
                                              alt={episode.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                <div>
                                            <h4 className="font-medium flex items-center gap-2">
                                              Episode {episode.number}
                                              {episode.isNew && (
                                                <span className="px-2 py-0.5 bg-[#f47521] text-white text-xs rounded-full">New</span>
                                              )}
                                            </h4>
                                            <p className="text-sm text-gray-400">{episode.title}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                              <span>{episode.duration}</span>
                                              <span>•</span>
                                              <span>{new Date(episode.releaseDate).toLocaleDateString()}</span>
                                            </div>
                                          </div>
                                </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => {
                                              if (editingEpisode?.id === episode.id) {
                                                setEditingEpisode(null);
                                                episodeForm.reset();
                                              } else {
                                                setEditingEpisode({
                                                  id: episode.id,
                                                  seasonId: season.id,
                                                  animeId: anime.id
                                                });
                                                episodeForm.reset({
                                                  title: episode.title,
                                                  number: episode.number,
                                                  videoUrl: episode.videoUrl,
                                                  thumbnail: episode.thumbnail,
                                                  duration: episode.duration,
                                                  releaseDate: episode.releaseDate
                                                });
                                              }
                                            }}
                                            className="p-2 rounded-full hover:bg-gray-500 transition-colors"
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </button>
                                <button
                                            onClick={() => handleDeleteClick('episode', episode.id, episode.title, anime.id, season.id)}
                                            className="p-2 rounded-full hover:bg-red-500 transition-colors"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                                        </div>
                              </div>
                            ))}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
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