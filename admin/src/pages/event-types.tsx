import { CONFIG } from 'src/config-global';
import { EventTypesView } from 'src/sections/event-types/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Event Types - ${CONFIG.appName}`}</title>

      <EventTypesView />
    </>
  );
}
