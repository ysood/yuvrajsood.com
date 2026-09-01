import * as migration_20260831_150231_products_cms from './20260831_150231_products_cms';
import * as migration_20260831_153924_product_type from './20260831_153924_product_type';
import * as migration_20260831_183656_site_settings from './20260831_183656_site_settings';
import * as migration_20260901_021916_drop_media_sizes from './20260901_021916_drop_media_sizes';
import * as migration_20260901_124400_optional_purchase_link from './20260901_124400_optional_purchase_link';

export const migrations = [
  {
    up: migration_20260831_150231_products_cms.up,
    down: migration_20260831_150231_products_cms.down,
    name: '20260831_150231_products_cms',
  },
  {
    up: migration_20260831_153924_product_type.up,
    down: migration_20260831_153924_product_type.down,
    name: '20260831_153924_product_type',
  },
  {
    up: migration_20260831_183656_site_settings.up,
    down: migration_20260831_183656_site_settings.down,
    name: '20260831_183656_site_settings',
  },
  {
    up: migration_20260901_021916_drop_media_sizes.up,
    down: migration_20260901_021916_drop_media_sizes.down,
    name: '20260901_021916_drop_media_sizes',
  },
  {
    up: migration_20260901_124400_optional_purchase_link.up,
    down: migration_20260901_124400_optional_purchase_link.down,
    name: '20260901_124400_optional_purchase_link'
  },
];
