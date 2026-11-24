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
      'Twilight Coastline', 'Rain on Glass', 'Amber Horizon', 'Afterhours Terrace',
      'Deep Blue Echoes', 'Silent City Lights', 'Moonlit Tide', 'Mirage in Motion',
      'Endless Boulevard', 'Golden Hour Drift',
    ],
    moods: ['Late-Night', 'Hypnotic', 'Sensual', 'Melancholic', 'Cinematic', 'Introspective', 'Dreamy', 'Mysterious'],
    instruments: ['Sub-Bass', 'Synth Pads', 'Rhodes', 'Saxophone', 'Piano', 'Guitar', 'Flute', 'Percussion'],
  },
  'Tech House': {
    defaultBpm: 130,
    temas: [
      'Urban Pulse', 'Concrete Jungle', 'Midnight Drive', 'Hypnotic State',
      'Underground Whispers', 'Neon Shadows', 'Lost in the Rhythm', 'Sunset Grooves',
    ],
    moods: ['Hypnotic', 'Cinematic', 'Sensual', 'Mysterious', 'Euphoric', 'Introspective', 'Late-Night', 'Energetic'],
    instruments: ['Sub-Bass', 'Percussion', 'Synth Pads', 'Drum Machine', 'Analog Synths', 'Vocal Chops', 'Low Toms', 'FX Risers'],
  },
  'Progressive House': {
    defaultBpm: 124,
    temas: [
      'Oceanic Depths', 'Desert Mirage', 'Cosmic Lounge', 'Ibiza Sunrise',
      'Midnight Drive', 'Lost in the Rhythm', 'Velvet Nights', 'Neon Shadows',
    ],
    moods: ['Cinematic', 'Hypnotic', 'Euphoric', 'Melancholic', 'Dreamy', 'Late-Night', 'Introspective', 'Anthemic'],
    instruments: ['Synth Pads', 'Sub-Bass', 'Strings', 'Analog Synths', 'Piano', 'Percussion', 'Arpeggiator', 'Slap Bass'],
  },
  'Vocal House': {
    defaultBpm: 124,
    temas: [
      'Velvet Nights', 'Sunset Grooves', 'Ibiza Sunrise', 'Lost in the Rhythm',
      'Neon Shadows', 'Midnight Drive', 'Cosmic Lounge',
      'Midnight Bloom', 'Golden Rooftop', 'Summer Coastal Drive', 'Echoes Between Us',
      'Chasing Daylight', 'Silk & Static', 'Fading City Lights', 'Endless Horizon',
      'Warm Rain at Dawn',
    ],
    moods: ['Euphoric', 'Sensual', 'Late-Night', 'Soulful', 'Anthemic', 'Dreamy', 'Cinematic', 'Energetic'],
    instruments: ['Piano', 'Sub-Bass', 'Synth Pads', 'Rhodes', 'Strings', 'Saxophone', 'Percussion', 'Bass Guitar'],
  },
  'Nu Disco': {
    defaultBpm: 118,
    temas: [
      'Sunset Grooves', 'Velvet Nights', 'Neon Arcade', 'Cosmic Lounge',
      'Electric Youth', 'Midnight Drive',
      'Mirrorball Horizon', 'Palm Boulevard', 'Midnight Boogie', 'Analog Sunset',
      'Retro Rooftop', 'Starlight Riviera', 'Chrome & Velvet', 'Disco Mirage',
      'Pacific Coast Twilight', 'Golden Cassette',
    ],
    moods: ['Euphoric', 'Sensual', 'Nostalgic', 'Groovy', 'Energetic', 'Dreamy', 'Late-Night', 'Cinematic'],
    instruments: ['Bass Guitar', 'Electric Guitar', 'Analog Synths', 'Rhodes', 'Strings', 'Saxophone', 'Percussion', 'Drum Machine'],
  },
  'Afro House': {
    defaultBpm: 122,
    temas: [
      'Desert Mirage', 'Sunset Grooves', 'Oceanic Depths', 'Ibiza Sunrise',
      'Lost in the Rhythm', 'Concrete Jungle',
    ],
    moods: ['Hypnotic', 'Cinematic', 'Mysterious', 'Euphoric', 'Tribal', 'Sensual', 'Late-Night', 'Introspective'],
    instruments: ['Percussion', 'Sub-Bass', 'Flute', 'Synth Pads', 'Congas & Shakers', 'Kalimba', 'Guitar', 'Strings'],
  },
  'Organic House': {
    defaultBpm: 120,
    temas: [
      'Desert Mirage', 'Oceanic Depths', 'Ibiza Sunrise', 'Cosmic Lounge',
      'Underground Whispers', 'Velvet Nights',
    ],
    moods: ['Dreamy', 'Introspective', 'Late-Night', 'Melancholic', 'Hypnotic', 'Cinematic', 'Mysterious', 'Sensual'],
    instruments: ['Guitar', 'Flute', 'Percussion', 'Synth Pads', 'Strings', 'Sub-Bass', 'Piano', 'Oud / Plucked'],
  },
  'Melodic Techno': {
    defaultBpm: 128,
    temas: [
      'Hypnotic State', 'Neon Shadows', 'Concrete Jungle', 'Urban Pulse',
      'Fading Signal', 'Static Heartbeat', 'Midnight Drive',
    ],
    moods: ['Hypnotic', 'Cinematic', 'Mysterious', 'Melancholic', 'Euphoric', 'Dark', 'Introspective', 'Energetic'],
    instruments: ['Analog Synths', 'Sub-Bass', 'Synth Pads', 'Drum Machine', 'Arpeggiator', 'Strings', 'Percussion', 'FX Risers'],
  },
  'Classic Rock': {
    defaultBpm: 120,
    temas: [
      'Highway of Ghosts', 'Ashes & Gasoline', 'Midnight Thunder', 'Velvet Rebellion',
      'Broken Mirrors', 'Iron & Gold', 'Wild Horizon',
    ],
    moods: ['Anthemic', 'Rebellious', 'Energetic', 'Nostalgic', 'Gritty', 'Soulful', 'Cinematic', 'Melancholic'],
    instruments: ['Electric Guitar', 'Bass Guitar', 'Acoustic Drums', 'Piano', 'Hammond Organ', 'Slide Guitar', 'Guitar', 'Harmonica'],
  },
  'Alternative Rock': {
    defaultBpm: 128,
    temas: [
      'Broken Mirrors', 'Static Heartbeat', 'Electric Youth', 'Velvet Rebellion',
      'Fading Signal', 'Concrete Jungle', 'Paper Crown',
    ],
    moods: ['Anthemic', 'Energetic', 'Melancholic', 'Introspective', 'Gritty', 'Rebellious', 'Cinematic', 'Nostalgic'],
    instruments: ['Electric Guitar', 'Distorted Guitar', 'Bass Guitar', 'Acoustic Drums', 'Guitar', 'Piano', 'Strings', 'Synth Pads'],
  },
  'Grunge': {
    defaultBpm: 118,
    temas: [
      'Rust & Rain', 'Broken Mirrors', 'Bleed the Static', 'Paper Crown',
      'Concrete Rain', 'Hollow Echoes', 'Seattle Fog', 'Cracked Halo',
    ],
    moods: ['Gritty', 'Melancholic', 'Rebellious', 'Angsty', 'Introspective', 'Raw', 'Mysterious', 'Brooding'],
    instruments: ['Distorted Guitar', 'Electric Guitar', 'Bass Guitar', 'Acoustic Drums', 'Guitar', 'Fuzz Bass', 'Cello', 'Clean Chorus Guitar'],
  },
  'Indie Rock': {
    defaultBpm: 124,
    temas: [
      'Electric Youth', 'Polaroid Ghosts', 'Fading Signal', 'Paper Crown',
      'Late Night Train', 'Golden Dust',
    ],
    moods: ['Nostalgic', 'Dreamy', 'Energetic', 'Melancholic', 'Introspective', 'Anthemic', 'Euphoric', 'Bittersweet'],
    instruments: ['Electric Guitar', 'Bass Guitar', 'Acoustic Drums', 'Analog Synths', 'Guitar', 'Piano', 'Synth Pads', 'Tambourine'],
  },
  'Hard Rock': {
    defaultBpm: 132,
    temas: [
      'Midnight Thunder', 'Ashes & Gasoline', 'Iron & Gold', 'Velvet Rebellion',
      'Shadow Engine', 'Blackout City',
    ],
    moods: ['Rebellious', 'Energetic', 'Anthemic', 'Gritty', 'Aggressive', 'Cinematic', 'Euphoric', 'Dark'],
    instruments: ['Distorted Guitar', 'Electric Guitar', 'Bass Guitar', 'Acoustic Drums', 'Guitar Solo', 'Hammond Organ', 'Piano', 'Percussion'],
  },
  'New Wave': {
    defaultBpm: 126,
    temas: [
      'Echoes of 1984', 'Neon Arcade', 'Fading Signal', 'Chrome Tears',
      'Midnight Radio', 'Synthetic Love', 'Glass Skyline',
    ],
    moods: ['Nostalgic', 'Nocturnal', 'Cinematic', 'Melancholic', 'Dreamy', 'Hypnotic', 'Retro-Futuristic', 'Dramatic'],
    instruments: ['Analog Synths', 'Chorus Guitar', 'Drum Machine', 'Synth Bass', 'Synth Pads', 'Electric Guitar', 'Saxophone', 'Bass Guitar'],
  },
  'Post-Punk': {
    defaultBpm: 132,
    temas: [
      'Cold Concrete', 'Fading Signal', 'Static Heartbeat', 'Shadow Cathedral',
      'Chrome Tears', 'Echoes of 1984', 'Grey Horizon',
    ],
    moods: ['Mysterious', 'Melancholic', 'Hypnotic', 'Dark', 'Introspective', 'Nocturnal', 'Nostalgic', 'Rebellious'],
    instruments: ['Bass Guitar', 'Chorus Guitar', 'Drum Machine', 'Analog Synths', 'Electric Guitar', 'Synth Pads', 'Acoustic Drums', 'Reverb Snare'],
  },
  'Synth-Pop': {
    defaultBpm: 122,
    temas: [
      'Neon Arcade', 'Electric Youth', 'Echoes of 1984', 'Starlight Mirage',
      'Synthetic Love', 'Midnight Radio', 'Digital Sunset',
    ],
    moods: ['Euphoric', 'Nostalgic', 'Dreamy', 'Cinematic', 'Energetic', 'Retro-Futuristic', 'Sensual', 'Melancholic'],
    instruments: ['Analog Synths', 'Drum Machine', 'Synth Pads', 'Synth Bass', 'Arpeggiator', 'Piano', 'Electric Guitar', 'Saxophone'],
  },
  'Pop': {
    defaultBpm: 116,
    temas: [
      'Glass Heart', 'Starlight Mirage', 'Midnight Confessions', 'City of Dreams',
      'Silver Horizon', 'Electric Youth', 'Velvet Nights',
    ],
    moods: ['Euphoric', 'Dreamy', 'Sensual', 'Cinematic', 'Nostalgic', 'Introspective', 'Energetic', 'Melancholic'],
    instruments: ['Synth Pads', 'Sub-Bass', 'Piano', 'Electric Guitar', 'Guitar', 'Percussion', 'Strings', 'Drum Machine'],
  },
}

export function getThemesForGenre(genero) {
  return GENRE_CONFIG[genero]?.temas ?? GENRE_CONFIG['Deep House'].temas
}

export function getDefaultBpmForGenre(genero) {
  return GENRE_CONFIG[genero]?.defaultBpm ?? 124
}

export function getMoodsForGenre(genero) {
  return GENRE_CONFIG[genero]?.moods ?? GENRE_CONFIG['Deep House'].moods
}

export function getInstrumentsForGenre(genero) {
  return GENRE_CONFIG[genero]?.instruments ?? GENRE_CONFIG['Deep House'].instruments
}
