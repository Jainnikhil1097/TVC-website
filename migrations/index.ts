import * as migration_20260930_165035_initial from './20260930_165035_initial';
import * as migration_20261010_161422_remove_careers from './20261010_161422_remove_careers';
import * as migration_20261010_161439_home_redesign from './20261010_161439_home_redesign';
import * as migration_20261115_021116_hero_photos from './20261115_021116_hero_photos';
import * as migration_20261115_090414_one_pager from './20261115_090414_one_pager';
import * as migration_20261115_100753_remove_hero_photos from './20261115_100753_remove_hero_photos';
import * as migration_20261118_051153_home_order from './20261118_051153_home_order';
import * as migration_20261118_164050_team_departments from './20261118_164050_team_departments';
import * as migration_20261120_070035_client_feedback from './20261120_070035_client_feedback';
import * as migration_20261120_114545_home_content from './20261120_114545_home_content';
import * as migration_20261120_114630_home_content_data from './20261120_114630_home_content_data';
import * as migration_20261121_113533_new_companies from './20261121_113533_new_companies';
import * as migration_20261121_114440_remove_pre_fund from './20261121_114440_remove_pre_fund';
import * as migration_20261121_120638_featured_greentech from './20261121_120638_featured_greentech';
import * as migration_20261123_050340_gift_disclosures from './20261123_050340_gift_disclosures';
import * as migration_20261123_050447_gift_disclosures_data from './20261123_050447_gift_disclosures_data';
import * as migration_20261123_051931_home_sector_icons from './20261123_051931_home_sector_icons';
import * as migration_20261123_124801_team_rows_prefund from './20261123_124801_team_rows_prefund';
import * as migration_20261123_124829_prefund_companies from './20261123_124829_prefund_companies';
import * as migration_20261124_015323_impact_redesign from './20261124_015323_impact_redesign';
import * as migration_20261124_015451_impact_content_data from './20261124_015451_impact_content_data';
import * as migration_20261124_093917_pillar_points from './20261124_093917_pillar_points';
import * as migration_20261124_093958_pillar_points_data from './20261124_093958_pillar_points_data';
import * as migration_20261125_101456_nov25_feedback from './20261125_101456_nov25_feedback';
import * as migration_20261125_101520_nov25_feedback_data from './20261125_101520_nov25_feedback_data';
import * as migration_20261125_113237_news_photos from './20261125_113237_news_photos';
import * as migration_20261125_113250_press_prefund_data from './20261125_113250_press_prefund_data';
import * as migration_20261125_114203_careers_email from './20261125_114203_careers_email';
import * as migration_20261125_114204_careers_gift_data from './20261125_114204_careers_gift_data';

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
    name: '20261115_021116_hero_photos',
  },
  {
    up: migration_20261115_090414_one_pager.up,
    down: migration_20261115_090414_one_pager.down,
    name: '20261115_090414_one_pager',
  },
  {
    up: migration_20261115_100753_remove_hero_photos.up,
    down: migration_20261115_100753_remove_hero_photos.down,
    name: '20261115_100753_remove_hero_photos',
  },
  {
    up: migration_20261118_051153_home_order.up,
    down: migration_20261118_051153_home_order.down,
    name: '20261118_051153_home_order',
  },
  {
    up: migration_20261118_164050_team_departments.up,
    down: migration_20261118_164050_team_departments.down,
    name: '20261118_164050_team_departments',
  },
  {
    up: migration_20261120_070035_client_feedback.up,
    down: migration_20261120_070035_client_feedback.down,
    name: '20261120_070035_client_feedback',
  },
  {
    up: migration_20261120_114545_home_content.up,
    down: migration_20261120_114545_home_content.down,
    name: '20261120_114545_home_content',
  },
  {
    up: migration_20261120_114630_home_content_data.up,
    down: migration_20261120_114630_home_content_data.down,
    name: '20261120_114630_home_content_data',
  },
  {
    up: migration_20261121_113533_new_companies.up,
    down: migration_20261121_113533_new_companies.down,
    name: '20261121_113533_new_companies',
  },
  {
    up: migration_20261121_114440_remove_pre_fund.up,
    down: migration_20261121_114440_remove_pre_fund.down,
    name: '20261121_114440_remove_pre_fund',
  },
  {
    up: migration_20261121_120638_featured_greentech.up,
    down: migration_20261121_120638_featured_greentech.down,
    name: '20261121_120638_featured_greentech',
  },
  {
    up: migration_20261123_050340_gift_disclosures.up,
    down: migration_20261123_050340_gift_disclosures.down,
    name: '20261123_050340_gift_disclosures',
  },
  {
    up: migration_20261123_050447_gift_disclosures_data.up,
    down: migration_20261123_050447_gift_disclosures_data.down,
    name: '20261123_050447_gift_disclosures_data',
  },
  {
    up: migration_20261123_051931_home_sector_icons.up,
    down: migration_20261123_051931_home_sector_icons.down,
    name: '20261123_051931_home_sector_icons',
  },
  {
    up: migration_20261123_124801_team_rows_prefund.up,
    down: migration_20261123_124801_team_rows_prefund.down,
    name: '20261123_124801_team_rows_prefund',
  },
  {
    up: migration_20261123_124829_prefund_companies.up,
    down: migration_20261123_124829_prefund_companies.down,
    name: '20261123_124829_prefund_companies',
  },
  {
    up: migration_20261124_015323_impact_redesign.up,
    down: migration_20261124_015323_impact_redesign.down,
    name: '20261124_015323_impact_redesign',
  },
  {
    up: migration_20261124_015451_impact_content_data.up,
    down: migration_20261124_015451_impact_content_data.down,
    name: '20261124_015451_impact_content_data',
  },
  {
    up: migration_20261124_093917_pillar_points.up,
    down: migration_20261124_093917_pillar_points.down,
    name: '20261124_093917_pillar_points',
  },
  {
    up: migration_20261124_093958_pillar_points_data.up,
    down: migration_20261124_093958_pillar_points_data.down,
    name: '20261124_093958_pillar_points_data',
  },
  {
    up: migration_20261125_101456_nov25_feedback.up,
    down: migration_20261125_101456_nov25_feedback.down,
    name: '20261125_101456_nov25_feedback',
  },
  {
    up: migration_20261125_101520_nov25_feedback_data.up,
    down: migration_20261125_101520_nov25_feedback_data.down,
    name: '20261125_101520_nov25_feedback_data',
  },
  {
    up: migration_20261125_113237_news_photos.up,
    down: migration_20261125_113237_news_photos.down,
    name: '20261125_113237_news_photos',
  },
  {
    up: migration_20261125_113250_press_prefund_data.up,
    down: migration_20261125_113250_press_prefund_data.down,
    name: '20261125_113250_press_prefund_data',
  },
  {
    up: migration_20261125_114203_careers_email.up,
    down: migration_20261125_114203_careers_email.down,
    name: '20261125_114203_careers_email',
  },
  {
    up: migration_20261125_114204_careers_gift_data.up,
    down: migration_20261125_114204_careers_gift_data.down,
    name: '20261125_114204_careers_gift_data'
  },
];
