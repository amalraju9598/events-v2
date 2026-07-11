import { CONFIG } from 'src/config-global';

import { EventDetailsView } from 'src/sections/events/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Event Details - ${CONFIG.appName}`}</title>

      <EventDetailsView />
    </>
  );
}
