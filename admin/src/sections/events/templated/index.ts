import { WeddingTemplate } from './wedding-template';
import { CinematicGoldTemplate } from './cinematic-gold-template';
import { CosmicTemplate } from './cosmic-template';

export type TemplateRegistryItem = {
  key: string;
  name: string;
  component: React.ComponentType<any>;
  defaultFields: { identifier: string; value: string; type: string }[];
  defaultEvent: {
    name: string;
    description: string;
    event_date: string;
    start_date: string;
  };
};

export const TEMPLATE_REGISTRY: TemplateRegistryItem[] = [
  {
    key: 'wedding-template',
    name: 'Wedding Invitation Template',
    component: WeddingTemplate,
    defaultFields: [
      { identifier: 'title', value: 'The Wedding of Liam & Olivia', type: 'text' },
      {
        identifier: 'banner_image',
        value: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
      },
      { identifier: 'venue_location', value: 'The Royal Gardens, London, UK', type: 'location' },
      {
        identifier: 'detailed_description',
        value: 'We invite you to share in our joy as we exchange our vows and begin our new life together.',
        type: 'long_text',
      },
      { identifier: 'spouse_1', value: 'Olivia Smith', type: 'text' },
      { identifier: 'spouse_2', value: 'Liam Johnson', type: 'text' },
      { identifier: 'event_date', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), type: 'date' },
    ],
    defaultEvent: {
      name: 'Olivia & Liam\'s Wedding',
      description: 'Wedding ceremony and reception celebration',
      event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    key: 'cinematic-gold-template',
    name: 'Cinematic Gold Template',
    component: CinematicGoldTemplate,
    defaultFields: [
      { identifier: 'banner_image', value: 'https://360invites.com/themes/glanz/images/11019.jpg', type: 'image' },
      { identifier: 'spouse_1', value: 'Alex Mark', type: 'text' },
      { identifier: 'spouse_2', value: 'Isha John', type: 'text' },
      { identifier: 'spouse_1_image', value: 'https://360invites.com/storage/210/groom_photo_1766664192.jpeg', type: 'image' },
      { identifier: 'spouse_2_image', value: 'https://360invites.com/storage/209/bride_photo_1766664044.jpeg', type: 'image' },
      { identifier: 'spouse_1_details', value: 'Alex Mark son of Mark Louis and Betty Friedan', type: 'long_text' },
      { identifier: 'spouse_2_details', value: 'Isha John daughter of John Wayne and Mary Luke', type: 'long_text' },
      { identifier: 'ceremony_time', value: 'Time : 10:00 AM - 12:00 PM', type: 'text' },
      { identifier: 'ceremony_address', value: 'Santa Cruz Cathedral Basilica, Fort Nagar, Fort Kochi', type: 'location' },
      { identifier: 'reception_time', value: 'Time : 12:00 PM - 4:00 PM', type: 'text' },
      { identifier: 'reception_address', value: 'Hotel Fort Queen, Manthra Rd, Pandikudy, Thamaraparambu, Fort Kochi', type: 'location' },
      { identifier: 'youtube_video_id', value: 'Czd5zGd9DlY', type: 'text' },
      { identifier: 'event_date', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), type: 'date' },
    ],
    defaultEvent: {
      name: 'Alex Mark & Isha John Wedding',
      description: 'Join us in celebrating the wedding of Alex and Isha.',
      event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  {
    key: 'cosmic-template',
    name: 'Cosmic Floral Template',
    component: CosmicTemplate,
    defaultFields: [
      { identifier: 'background_image', value: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=2000', type: 'image' },
      { identifier: 'background_music', value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', type: 'text' },
      { identifier: 'spouse_1', value: 'Alan Mark', type: 'text' },
      { identifier: 'spouse_2', value: 'Eva John', type: 'text' },
      { identifier: 'spouse_1_image', value: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500', type: 'image' },
      { identifier: 'spouse_2_image', value: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500', type: 'image' },
      { identifier: 'spouse_1_details', value: 'Son of Mr & Mrs Mark', type: 'long_text' },
      { identifier: 'spouse_2_details', value: 'Daughter of Mr & Mrs John', type: 'long_text' },
      { identifier: 'ceremony_time', value: '10:00 AM - 12:00 PM', type: 'text' },
      { identifier: 'ceremony_address', value: 'Santa Cruz Cathedral Basilica, Fort Kochi', type: 'location' },
      { identifier: 'reception_time', value: '12:00 PM - 4:00 PM', type: 'text' },
      { identifier: 'reception_address', value: 'Hotel Fort Queen, Manthra Rd, Fort Kochi', type: 'location' },
      { identifier: 'youtube_video_id', value: 'Czd5zGd9DlY', type: 'text' },
      { identifier: 'event_date', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), type: 'date' },
    ],
    defaultEvent: {
      name: 'Alan & Eva Wedding',
      description: 'We are getting married! Join us for the adventure.',
      event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
];

export const getTemplateComponent = (key: string) => {
  const found = TEMPLATE_REGISTRY.find((item) => item.key === key);
  return found ? found.component : null;
};
