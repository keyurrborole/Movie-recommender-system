import poster1 from "@/assets/poster-1.jpg";
import poster2 from "@/assets/poster-2.jpg";
import poster3 from "@/assets/poster-3.jpg";
import poster4 from "@/assets/poster-4.jpg";
import poster5 from "@/assets/poster-5.jpg";
import poster6 from "@/assets/poster-6.jpg";

export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  director: string;
  synopsis: string;
  duration: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Neon Requiem",
    year: 2024,
    genre: ["Sci-Fi", "Thriller"],
    rating: 4.2,
    poster: poster1,
    director: "Lena Zhao",
    synopsis: "In a rain-soaked cyberpunk metropolis, a rogue detective hunts an AI that has learned to dream.",
    duration: "2h 18m",
  },
  {
    id: 2,
    title: "Golden Hour",
    year: 2023,
    genre: ["Romance", "Drama"],
    rating: 4.5,
    poster: poster2,
    director: "Marco Bellucci",
    synopsis: "Two strangers meet at sunset and share one perfect evening that changes everything.",
    duration: "1h 52m",
  },
  {
    id: 3,
    title: "The Lost Temple",
    year: 2024,
    genre: ["Adventure", "Fantasy"],
    rating: 3.8,
    poster: poster3,
    director: "Priya Anand",
    synopsis: "An archaeologist discovers a temple that exists between dimensions, guarding an ancient power.",
    duration: "2h 34m",
  },
  {
    id: 4,
    title: "Whisper in the Pines",
    year: 2023,
    genre: ["Horror", "Mystery"],
    rating: 4.0,
    poster: poster4,
    director: "Erik Larsson",
    synopsis: "A family moves to an isolated forest cabin, only to realize something watches from the mist.",
    duration: "1h 47m",
  },
  {
    id: 5,
    title: "Astral Drift",
    year: 2024,
    genre: ["Sci-Fi", "Drama"],
    rating: 4.7,
    poster: poster5,
    director: "Yuki Tanaka",
    synopsis: "An astronaut on a solo mission begins receiving transmissions from a version of herself in another universe.",
    duration: "2h 05m",
  },
  {
    id: 6,
    title: "Midnight Circuit",
    year: 2023,
    genre: ["Crime", "Noir"],
    rating: 4.3,
    poster: poster6,
    director: "James Okafor",
    synopsis: "A washed-up journalist stumbles onto a conspiracy that connects the city's most powerful figures.",
    duration: "2h 11m",
  },
];
