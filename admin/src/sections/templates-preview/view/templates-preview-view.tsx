import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { api } from 'src/utils/api-client';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import { TEMPLATE_REGISTRY, TemplateRegistryItem } from '../../events/templated';

type DatabaseTemplate = {
  id: string;
  name: string;
  code: string;
  view_page: string | null;
  event_type: {
    name: string;
  };
};

export function TemplatesPreviewView() {
  const [dbTemplates, setDbTemplates] = useState<DatabaseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<TemplateRegistryItem | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await api.get('/templates?limit=1000');
        setDbTemplates(res.data || []);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleOpenPreview = (item: TemplateRegistryItem) => {
    setSelectedItem(item);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedItem(null);
  };

  // Find database templates mapped to a specific registry key
  const getMappedTemplates = (key: string) => {
    return dbTemplates.filter((t) => t.view_page === key);
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: '800' }}>
          Templates Preview
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Explore and preview the interactive page layouts created inside the templates system.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {TEMPLATE_REGISTRY.map((item) => {
            const mapped = getMappedTemplates(item.key);
            const bannerImg = item.defaultFields.find((f) => f.identifier === 'banner_image')?.value;

            return (
              <Grid key={item.key} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  onClick={() => handleOpenPreview(item)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-6px)',
                      boxShadow: (theme: any) => theme.customShadows?.z12 || theme.shadows[12],
                    },
                  }}
                >
                  {/* Card Media Preview */}
                  <Box
                    sx={{
                      pt: '56.25%', // 16:9 ratio
                      position: 'relative',
                      bgcolor: 'background.neutral',
                      overflow: 'hidden',
                    }}
                  >
                    {bannerImg ? (
                      <Box
                        component="img"
                        alt={item.name}
                        src={bannerImg}
                        sx={{
                          top: 0,
                          width: 1,
                          height: 1,
                          objectFit: 'cover',
                          position: 'absolute',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          top: 0,
                          width: 1,
                          height: 1,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Iconify
                          icon={"solar:widget-3-bold" as any}
                          sx={{ width: 48, height: 48, color: 'text.disabled' }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Card Details */}
                  <Stack spacing={2} sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: '700' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                          File: {item.key}.tsx
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed' }} />

                    {/* Mapped Templates Info */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                        Mapped Admin Templates ({mapped.length})
                      </Typography>
                      {mapped.length === 0 ? (
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          No templates mapped to this view page yet.
                        </Typography>
                      ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {mapped.map((t) => (
                            <Chip
                              key={t.id}
                              label={`${t.name} (${t.code})`}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Actions */}
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Iconify icon={"solar:eye-bold" as any} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPreview(item);
                      }}
                    >
                      Live Preview
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Fullscreen Interactive Preview Dialog */}
      <Dialog
        fullScreen
        open={previewOpen}
        onClose={handleClosePreview}
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: 'background.default',
          },
        }}
      >
        {/* Preview Top Header Bar */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleClosePreview}
              startIcon={<Iconify icon={"solar:arrow-left-bold" as any} />}
            >
              Back to List
            </Button>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: '700' }}>
                {selectedItem?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Previewing layout with mock dataset
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<Iconify icon={"solar:checklist-bold" as any} />}
              label={`${selectedItem?.defaultFields.length} Fields Mapped`}
              variant="outlined"
              color="info"
            />
          </Box>
        </Box>

        {/* Preview Main Workspace Layout */}
        {selectedItem && (
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 auto',
              height: 'calc(100vh - 72px)',
              overflow: 'hidden',
            }}
          >
            {/* Left Hand: View Configuration Sidebar */}
            <Box
              sx={{
                width: 320,
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                p: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: '700', mb: 2 }}>
                Mock Configuration
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                These are the variables registered as placeholders for the view page component.
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                    Event Metadata
                  </Typography>
                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Name</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {selectedItem.defaultEvent.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {selectedItem.defaultEvent.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="overline" sx={{ color: 'text.disabled', fontWeight: 'bold' }}>
                    Custom Fields ({selectedItem.defaultFields.length})
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1.5 }}>
                    {selectedItem.defaultFields.map((field) => (
                      <Box key={field.identifier}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: '700' }}>
                            {field.identifier}
                          </Typography>
                          <Chip
                            label={field.type}
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.6rem', textTransform: 'capitalize' }}
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            mt: 0.5,
                            fontSize: '0.825rem',
                            color: 'text.primary',
                            fontFamily: field.type === 'image' ? 'monospace' : 'inherit',
                          }}
                        >
                          {field.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Right Hand: Rendered Component Live View */}
            <Box
              sx={{
                flex: '1 1 auto',
                p: { xs: 2, md: 5 },
                overflowY: 'auto',
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Container maxWidth="md">
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: (theme: any) => theme.customShadows?.z24 || theme.shadows[24],
                    bgcolor: 'background.paper',
                  }}
                >
                  {/* Dynamically Instantiate registered component */}
                  {(() => {
                    const ComponentToRender = selectedItem.component;
                    const parsedFields = selectedItem.defaultFields.map((f) => ({
                      field_id: f.identifier,
                      value: f.value,
                      field: {
                        id: f.identifier,
                        identifier: f.identifier,
                        type: f.type,
                      },
                    }));

                    return (
                      <ComponentToRender
                        event={{
                          name: selectedItem.defaultEvent.name,
                          description: selectedItem.defaultEvent.description,
                          event_date: selectedItem.defaultEvent.event_date,
                          start_date: selectedItem.defaultEvent.start_date,
                        }}
                        fields={parsedFields}
                      />
                    );
                  })()}
                </Box>
              </Container>
            </Box>
          </Box>
        )}
      </Dialog>
    </DashboardContent>
  );
}
