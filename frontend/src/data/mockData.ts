import type { Channel, Movie, Series, Playlist } from '../types';

export const channels: Channel[] = [
  { id: '1', name: 'ESPN HD', logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Sports', currentProgram: 'SportsCenter Live', nextProgram: 'NFL Countdown', isFavorite: true },
  { id: '2', name: 'CNN International', logo: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'News', currentProgram: 'World News Tonight', nextProgram: 'The Situation Room', isFavorite: false },
  { id: '3', name: 'HBO Max', logo: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Entertainment', currentProgram: 'Succession S4', nextProgram: 'The Wire', isFavorite: true },
  { id: '4', name: 'Discovery Channel', logo: 'https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Documentary', currentProgram: 'Planet Earth III', nextProgram: 'Blue Planet', isFavorite: false },
  { id: '5', name: 'Fox Sports', logo: 'https://images.pexels.com/photos/163398/pexels-photo-163398.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Sports', currentProgram: 'Champions League', nextProgram: 'NBA Tonight', isFavorite: true },
  { id: '6', name: 'BBC World', logo: 'https://images.pexels.com/photos/1557547/pexels-photo-1557547.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'News', currentProgram: 'BBC World News', nextProgram: 'HARDtalk', isFavorite: false },
  { id: '7', name: 'National Geographic', logo: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Documentary', currentProgram: 'Wild Yellowstone', nextProgram: 'Mars: Inside SpaceX', isFavorite: false },
  { id: '8', name: 'Netflix Live', logo: 'https://images.pexels.com/photos/1440727/pexels-photo-1440727.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', category: 'Entertainment', currentProgram: 'Stranger Things S5', nextProgram: 'Wednesday S2', isFavorite: true },
];

export const movies: Movie[] = [
  { id: '1', title: 'Dune: Part Two', poster: 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Sci-Fi', year: 2024, rating: 8.5, duration: '2h 46m', synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', isFavorite: true },
  { id: '2', title: 'Oppenheimer', poster: 'https://images.pexels.com/photos/6941097/pexels-photo-6941097.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Biography', year: 2023, rating: 8.9, duration: '3h 0m', synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.', isFavorite: false },
  { id: '3', title: 'The Batman', poster: 'https://images.pexels.com/photos/4662144/pexels-photo-4662144.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Action', year: 2022, rating: 7.9, duration: '2h 56m', synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.', isFavorite: true },
  { id: '4', title: 'Top Gun: Maverick', poster: 'https://images.pexels.com/photos/7568748/pexels-photo-7568748.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Action', year: 2022, rating: 8.3, duration: '2h 10m', synopsis: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator.', isFavorite: false },
  { id: '5', title: 'Avatar: The Way of Water', poster: 'https://images.pexels.com/photos/4226896/pexels-photo-4226896.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Sci-Fi', year: 2022, rating: 7.6, duration: '3h 12m', synopsis: 'Jake Sully and Neytiri have formed a family and do everything to stay together.', isFavorite: false },
  { id: '6', title: 'John Wick 4', poster: 'https://images.pexels.com/photos/6053651/pexels-photo-6053651.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Action', year: 2023, rating: 7.7, duration: '2h 49m', synopsis: 'John Wick uncovers a path to defeating The High Table.', isFavorite: true },
];

export const seriesData: Series[] = [
  { id: '1', title: 'House of the Dragon', poster: 'https://images.pexels.com/photos/6615261/pexels-photo-6615261.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Fantasy', year: 2022, rating: 8.4, synopsis: 'The story of House Targaryen set 200 years before Game of Thrones.', seasons: 2, isFavorite: true },
  { id: '2', title: 'The Last of Us', poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Drama', year: 2023, rating: 8.8, synopsis: 'Joel and Ellie navigate post-apocalyptic America in search of safety.', seasons: 2, isFavorite: false },
  { id: '3', title: 'Succession', poster: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Drama', year: 2018, rating: 8.9, synopsis: 'The Roy family controls one of the biggest media and entertainment conglomerates in the world.', seasons: 4, isFavorite: true },
  { id: '4', title: 'Wednesday', poster: 'https://images.pexels.com/photos/6347896/pexels-photo-6347896.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Comedy', year: 2022, rating: 8.1, synopsis: 'Wednesday Addams navigates the supernatural world of Nevermore Academy.', seasons: 2, isFavorite: false },
  { id: '5', title: 'Andor', poster: 'https://images.pexels.com/photos/4200745/pexels-photo-4200745.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Sci-Fi', year: 2022, rating: 8.4, synopsis: 'Prequel series to Rogue One following Cassian Andor.', seasons: 2, isFavorite: false },
  { id: '6', title: 'Shogun', poster: 'https://images.pexels.com/photos/5490235/pexels-photo-5490235.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1', genre: 'Historical', year: 2024, rating: 9.0, synopsis: 'Based on the novel by James Clavell, set in feudal Japan.', seasons: 1, isFavorite: true },
];

export const playlists: Playlist[] = [
  { id: '1', name: 'My IPTV Subscription', type: 'xtream', status: 'active', channelCount: 12450, lastSync: '2 min ago' },
  { id: '2', name: 'Sports Pack M3U', type: 'm3u', status: 'active', channelCount: 340, lastSync: '1 hour ago' },
  { id: '3', name: 'Family Bundle', type: 'activation', status: 'syncing', channelCount: 8200, lastSync: 'Syncing...' },
];

export const epgCategories = ['All', 'Sports', 'News', 'Movies', 'Entertainment', 'Documentary', 'Kids'];

export const epgData = [
  { channel: 'ESPN HD', logo: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'SportsCenter Live', nowTime: '20:00 - 21:00', next: 'NFL Countdown', nextTime: '21:00 - 22:00' },
  { channel: 'CNN International', logo: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'World News Tonight', nowTime: '20:00 - 20:30', next: 'The Situation Room', nextTime: '20:30 - 21:30' },
  { channel: 'HBO Max', logo: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'Succession S4 Finale', nowTime: '20:00 - 22:00', next: 'The Wire S1E1', nextTime: '22:00 - 23:00' },
  { channel: 'Discovery', logo: 'https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'Planet Earth III', nowTime: '19:00 - 20:00', next: 'Blue Planet Special', nextTime: '20:00 - 21:00' },
  { channel: 'Fox Sports', logo: 'https://images.pexels.com/photos/163398/pexels-photo-163398.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', now: 'Champions League Live', nowTime: '19:45 - 22:00', next: 'NBA Tonight', nextTime: '22:00 - 23:00' },
];
