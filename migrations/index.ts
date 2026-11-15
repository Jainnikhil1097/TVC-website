import * as migration_20260930_165035_initial from './20260930_165035_initial';
import * as migration_20261010_161422_remove_careers from './20261010_161422_remove_careers';
import * as migration_20261010_161439_home_redesign from './20261010_161439_home_redesign';
import * as migration_20261115_021116_hero_photos from './20261115_021116_hero_photos';

export const migrations = [
  {
    up: migration_20260930_165035_initial.up,
    down: migration_20260930_165035_initial.down,
    name: '20260930_165035_initial',
  },
  {
    up: migration_20261010_161422_remove_careers.up,
    down: migration_20261010_161422_remove_careers.down,
    name: '20261010_161422_remove_careers',
  },
  {
    up: migration_20261010_161439_home_redesign.up,
    down: migration_20261010_161439_home_redesign.down,
    name: '20261010_161439_home_redesign',
  },
  {
    up: migration_20261115_021116_hero_photos.up,
    down: migration_20261115_021116_hero_photos.down,
    name: '20261115_021116_hero_photos'
  },
];
