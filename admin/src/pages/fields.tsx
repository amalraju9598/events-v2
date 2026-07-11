import { CONFIG } from 'src/config-global';

import { FieldsView } from 'src/sections/fields/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Fields - ${CONFIG.appName}`}</title>

      <FieldsView />
    </>
  );
}
