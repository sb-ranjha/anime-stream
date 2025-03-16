import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreError,
  connectFirestoreEmulator
} from 'firebase/firestore';

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

interface AnimeContextType {
  animes: Anime[];
  trending: Anime[];
  addAnime: (anime: Omit<Anime, '_id' | 'seasons'>) => Promise<string>;
  updateAnime: (id: string, anime: Partial<Anime>) => Promise<void>;
  deleteAnime: (id: string) => Promise<void>;
  searchAnimes: (query: string) => Anime[];
  addSeason: (animeId: string, seasonNumber: number) => Promise<void>;
  addEpisode: (animeId: string, seasonId: string, episode: Omit<Episode, '_id'>) => Promise<void>;
  deleteEpisode: (animeId: string, seasonId: string, episodeId: string) => Promise<void>;
  toggleAnimeFlag: (id: string, flag: keyof Anime) => Promise<void>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);
const COLLECTION_NAME = 'animes';

const AnimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const initializeFirestore = async () => {
      try {
        console.log('Initializing Firestore...');
        const collectionRef = collection(db, COLLECTION_NAME);
        
        // Clean up sample animes
        const cleanupSamples = async () => {
          const snapshot = await getDocs(collectionRef);
          const deletePromises = snapshot.docs
            .filter(doc => doc.data().title === "Sample Anime")
            .map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        };

        // Clean up first
        await cleanupSamples();
        
        // Set up real-time listener
        const unsubscribe = onSnapshot(
          collectionRef,
          {
            next: (snapshot: QuerySnapshot<DocumentData>) => {
              console.log('Received data update:', snapshot.size, 'documents');
              const animesData = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                _id: doc.id,
                ...doc.data()
              })) as Anime[];
              setAnimes(animesData);
              setLoading(false);
              setError(null);
            },
            error: (error: FirestoreError) => {
              console.error("Firestore error:", error);
              let errorMessage = 'Database error: ';
              switch (error.code) {
                case 'permission-denied':
                  errorMessage += 'Permission denied. Please check Firestore rules.';
                  break;
                case 'unavailable':
                  errorMessage += 'Service is temporarily unavailable. Please try again later.';
                  break;
                default:
                  errorMessage += `${error.message} (code: ${error.code})`;
              }
              setError(errorMessage);
              setLoading(false);
            }
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error("Error initializing Firestore:", err);
        setError(err instanceof Error ? 
          `Failed to initialize database: ${err.message}` : 
          'Failed to initialize database. Please check your connection and Firestore rules.');
        setLoading(false);
        return () => {};
      }
    };

    initializeFirestore();
  }, []);

  const trending = animes.filter(anime => anime.trending);

  const addAnime = async (anime: Omit<Anime, '_id' | 'seasons'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...anime,
        seasons: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding anime:', error);
      throw new Error('Failed to add anime');
    }
  };

  const updateAnime = async (id: string, updates: Partial<Anime>) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      // Remove undefined values to prevent Firestore errors
      const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      await updateDoc(docRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating anime:', error);
      throw new Error('Failed to update anime');
    }
  };

  const toggleAnimeFlag = async (id: string, flag: keyof Anime) => {
    try {
      const anime = animes.find(a => a._id === id);
      if (!anime) return;

      const updates: Partial<Anime> = {
        [flag]: !anime[flag]
      };

      await updateAnime(id, updates);
    } catch (error) {
      console.error(`Error toggling ${flag}:`, error);
    }
  };

  const deleteAnime = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting anime:', error);
    }
  };

  const searchAnimes = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return animes.filter(anime => 
      anime.title.toLowerCase().includes(lowercaseQuery) ||
      anime.description.toLowerCase().includes(lowercaseQuery) ||
      anime.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const addSeason = async (animeId: string, seasonNumber: number) => {
    try {
      const anime = animes.find(a => a._id === animeId);
      if (!anime) {
        console.error('Anime not found');
        return;
      }

      // Check if season number already exists
      if (anime.seasons.some(s => s.number === seasonNumber)) {
        console.error('Season number already exists');
        return;
      }

      const newSeason = {
        _id: Math.random().toString(36).substr(2, 9),
        number: seasonNumber,
        episodes: []
      };

      const updatedSeasons = [...(anime.seasons || []), newSeason];
      
      // Sort seasons by number
      updatedSeasons.sort((a, b) => a.number - b.number);

      await updateAnime(animeId, {
        seasons: updatedSeasons,
        updatedAt: serverTimestamp()
      });

      console.log('Season added successfully');
    } catch (error) {
      console.error('Error adding season:', error);
      throw new Error('Failed to add season');
    }
  };

  const addEpisode = async (animeId: string, seasonId: string, episode: Omit<Episode, '_id'>) => {
    try {
      const anime = animes.find(a => a._id === animeId);
      if (!anime) return;

      const updatedSeasons = anime.seasons.map(season => {
        if (season._id === seasonId) {
          return {
            ...season,
            episodes: [...season.episodes, {
              ...episode,
              _id: Math.random().toString(36).substr(2, 9),
              isNew: true
            }]
          };
        }
        return season;
      });

      await updateAnime(animeId, { seasons: updatedSeasons });
    } catch (error) {
      console.error('Error adding episode:', error);
    }
  };

  const deleteEpisode = async (animeId: string, seasonId: string, episodeId: string) => {
    try {
      const anime = animes.find(a => a._id === animeId);
      if (!anime) return;

      const updatedSeasons = anime.seasons.map(season => {
        if (season._id === seasonId) {
          return {
            ...season,
            episodes: season.episodes.filter(ep => ep._id !== episodeId)
          };
        }
        return season;
      });

      await updateAnime(animeId, { seasons: updatedSeasons });
    } catch (error) {
      console.error('Error deleting episode:', error);
    }
  };

  if (error) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-500">Error: {error}</div>
    </div>;
  }

  if (loading) {
    return null;
  }

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
      deleteEpisode,
      toggleAnimeFlag
    }}>
      {children}
    </AnimeContext.Provider>
  );
};

const useAnime = () => {
  const context = useContext(AnimeContext);
  if (context === undefined) {
    throw new Error('useAnime must be used within an AnimeProvider');
  }
  return context;
};

export { AnimeProvider, useAnime };