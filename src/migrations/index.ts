import * as migration_20260831_150231_products_cms from './20260831_150231_products_cms';
import * as migration_20260831_153924_product_type from './20260831_153924_product_type';

export const migrations = [
  {
    up: migration_20260831_150231_products_cms.up,
    down: migration_20260831_150231_products_cms.down,
    name: '20260831_150231_products_cms',
  },
  {
    up: migration_20260831_153924_product_type.up,
    down: migration_20260831_153924_product_type.down,
    name: '20260831_153924_product_type'
  },
];
