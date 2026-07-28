import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { api } from 'src/utils/api-client';
import { decryptData } from 'src/utils/crypto';

import { CONFIG } from 'src/config-global';

import { getTemplateComponent } from '../templated';
import { WeddingTemplate } from '../templated/wedding-template';

// ----------------------------------------------------------------------

export function PublicEventView() {
  const { slug } = useParams<{ slug: string }>();

  const [eventData, setEventData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicEvent() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.get(`/events/public/${slug}`);
        if (res && res.data) {
          const decryptedJson = await decryptData(res.data, CONFIG.responseEncryptionKey);
          const decryptedObj = JSON.parse(decryptedJson);
          setEventData(decryptedObj);
        } else {
          setEventData(res);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load event. It may not exist or is set to private.');
      } finally {
        setLoading(false);
      }
    }
    fetchPublicEvent();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.neutral' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !eventData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.neutral', p: 3 }}>
        <Container maxWidth="xs">
          <Alert severity="error" sx={{ width: 1 }}>
            {error || 'Event not found.'}
          </Alert>
        </Container>
      </Box>
    );
  }

  // Find enabled template (it is filtered by backend to only return the enabled one)
  const enabledTemplate = eventData.event_templates?.[0];

  if (!enabledTemplate) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.neutral', p: 3 }}>
        <Container maxWidth="sm">
          <Alert severity="warning" sx={{ width: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              No Template Enabled
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              The organizer has not enabled a design template for the event &quot;{eventData.name}&quot; yet. Please check back later!
            </Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  const SelectedComponent = enabledTemplate.template.view_page
    ? getTemplateComponent(enabledTemplate.template.view_page)
    : null;
  const ComponentToRender = SelectedComponent || WeddingTemplate;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.neutral', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 5 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: (theme: any) => theme.customShadows?.z24 || theme.shadows[24],
            bgcolor: 'background.paper',
          }}
        >
          <ComponentToRender
            event={{
              name: eventData.name,
              description: eventData.description,
              event_date: eventData.event_date,
              start_date: eventData.start_date,
            }}
            fields={enabledTemplate.event_template_fields}
          />
        </Box>
      </Container>
    </Box>
  );
}
