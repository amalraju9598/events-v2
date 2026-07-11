import { CONFIG } from 'src/config-global';

import { TemplatesPreviewView } from 'src/sections/templates-preview/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Templates Preview - ${CONFIG.appName}`}</title>

      <TemplatesPreviewView />
    </>
  );
}
