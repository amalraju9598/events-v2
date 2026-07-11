import { WeddingTemplate } from './wedding-template';

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
];

export const getTemplateComponent = (key: string) => {
  const found = TEMPLATE_REGISTRY.find((item) => item.key === key);
  return found ? found.component : null;
};
