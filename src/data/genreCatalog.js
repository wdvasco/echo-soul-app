export const GENRE_GROUPS = [
  {
    label: 'Eletrônica / Club',
    genres: [
      'Deep House',
      'Tech House',
      'Progressive House',
      'Vocal House',
      'Nu Disco',
      'Afro House',
      'Organic House',
      'Melodic Techno',
    ],
  },
  {
    label: 'Rock & Grunge',
    genres: [
      'Classic Rock',
      'Alternative Rock',
      'Grunge',
      'Indie Rock',
      'Hard Rock',
    ],
  },
  {
    label: 'New Wave & 80s',
    genres: [
      'New Wave',
      'Post-Punk',
      'Synth-Pop',
    ],
  },
  {
    label: 'Pop',
    genres: [
      'Pop',
    ],
  },
]

export const GENRE_CONFIG = {
  'Deep House': {
    defaultBpm: 124,
    temas: [
      'Neon Shadows', 'Midnight Drive', 'Sunset Grooves', 'Oceanic Depths',
      'Velvet Nights', 'Ibiza Sunrise', 'Cosmic Lounge', 'Underground Whispers',
    ],
  },
  'Tech House': {
    defaultBpm: 130,
    temas: [
      'Urban Pulse', 'Concrete Jungle', 'Midnight Drive', 'Hypnotic State',
      'Underground Whispers', 'Neon Shadows', 'Lost in the Rhythm', 'Sunset Grooves',
    ],
  },
  'Progressive House': {
    defaultBpm: 124,
    temas: [
      'Oceanic Depths', 'Desert Mirage', 'Cosmic Lounge', 'Ibiza Sunrise',
      'Midnight Drive', 'Lost in the Rhythm', 'Velvet Nights', 'Neon Shadows',
    ],
  },
  'Vocal House': {
    defaultBpm: 124,
    temas: [
      'Velvet Nights', 'Sunset Grooves', 'Ibiza Sunrise', 'Lost in the Rhythm',
      'Neon Shadows', 'Midnight Drive', 'Cosmic Lounge',
    ],
  },
  'Nu Disco': {
    defaultBpm: 118,
    temas: [
      'Sunset Grooves', 'Velvet Nights', 'Neon Arcade', 'Cosmic Lounge',
      'Electric Youth', 'Midnight Drive',
    ],
  },
  'Afro House': {
    defaultBpm: 122,
    temas: [
      'Desert Mirage', 'Sunset Grooves', 'Oceanic Depths', 'Ibiza Sunrise',
      'Lost in the Rhythm', 'Concrete Jungle',
    ],
  },
  'Organic House': {
    defaultBpm: 120,
    temas: [
      'Desert Mirage', 'Oceanic Depths', 'Ibiza Sunrise', 'Cosmic Lounge',
      'Underground Whispers', 'Velvet Nights',
    ],
  },
  'Melodic Techno': {
    defaultBpm: 128,
    temas: [
      'Hypnotic State', 'Neon Shadows', 'Concrete Jungle', 'Urban Pulse',
      'Fading Signal', 'Static Heartbeat', 'Midnight Drive',
    ],
  },
  'Classic Rock': {
    defaultBpm: 120,
    temas: [
      'Highway of Ghosts', 'Ashes & Gasoline', 'Midnight Thunder', 'Velvet Rebellion',
      'Broken Mirrors', 'Iron & Gold', 'Wild Horizon',
    ],
  },
  'Alternative Rock': {
    defaultBpm: 128,
    temas: [
      'Broken Mirrors', 'Static Heartbeat', 'Electric Youth', 'Velvet Rebellion',
      'Fading Signal', 'Concrete Jungle', 'Paper Crown',
    ],
  },
  'Grunge': {
    defaultBpm: 118,
    temas: [
      'Rust & Rain', 'Broken Mirrors', 'Bleed the Static', 'Paper Crown',
      'Concrete Rain', 'Hollow Echoes', 'Seattle Fog', 'Cracked Halo',
    ],
  },
  'Indie Rock': {
    defaultBpm: 124,
    temas: [
      'Electric Youth', 'Polaroid Ghosts', 'Fading Signal', 'Paper Crown',
      'Late Night Train', 'Golden Dust',
    ],
  },
  'Hard Rock': {
    defaultBpm: 132,
    temas: [
      'Midnight Thunder', 'Ashes & Gasoline', 'Iron & Gold', 'Velvet Rebellion',
      'Shadow Engine', 'Blackout City',
    ],
  },
  'New Wave': {
    defaultBpm: 126,
    temas: [
      'Echoes of 1984', 'Neon Arcade', 'Fading Signal', 'Chrome Tears',
      'Midnight Radio', 'Synthetic Love', 'Glass Skyline',
    ],
  },
  'Post-Punk': {
    defaultBpm: 132,
    temas: [
      'Cold Concrete', 'Fading Signal', 'Static Heartbeat', 'Shadow Cathedral',
      'Chrome Tears', 'Echoes of 1984', 'Grey Horizon',
    ],
  },
  'Synth-Pop': {
    defaultBpm: 122,
    temas: [
      'Neon Arcade', 'Electric Youth', 'Echoes of 1984', 'Starlight Mirage',
      'Synthetic Love', 'Midnight Radio', 'Digital Sunset',
    ],
  },
  'Pop': {
    defaultBpm: 116,
    temas: [
      'Glass Heart', 'Starlight Mirage', 'Midnight Confessions', 'City of Dreams',
      'Silver Horizon', 'Electric Youth', 'Velvet Nights',
    ],
  },
}

export function getThemesForGenre(genero) {
  return GENRE_CONFIG[genero]?.temas ?? GENRE_CONFIG['Deep House'].temas
}

export function getDefaultBpmForGenre(genero) {
  return GENRE_CONFIG[genero]?.defaultBpm ?? 124
}
