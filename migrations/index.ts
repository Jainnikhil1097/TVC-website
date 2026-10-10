import * as migration_20260930_165035_initial from './20260930_165035_initial';

export const migrations = [
  {
    up: migration_20260930_165035_initial.up,
    down: migration_20260930_165035_initial.down,
    name: '20260930_165035_initial'
  },
];
