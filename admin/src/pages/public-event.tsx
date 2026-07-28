import { CONFIG } from 'src/config-global';

import { PublicEventView } from 'src/sections/events/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Event Preview - ${CONFIG.appName}`}</title>

      <PublicEventView />
    </>
  );
}
