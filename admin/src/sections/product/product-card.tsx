import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import type { TemplateProps } from './product-table-row';

// ----------------------------------------------------------------------

type TemplateCardProps = {
  template: TemplateProps;
  onEdit: () => void;
  onDelete: () => void;
};

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'disabled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const renderStatus = (
    <Label
      variant="soft"
      color={getStatusColor(template.status)}
      sx={{
        top: 12,
        left: 12,
        zIndex: 9,
        position: 'absolute',
        textTransform: 'capitalize',
      }}
    >
      {template.status}
    </Label>
  );

  const renderAction = (
    <IconButton
      onClick={handleOpenPopover}
      size="small"
      sx={{
        top: 12,
        right: 12,
        zIndex: 9,
        position: 'absolute',
        bgcolor: 'rgba(0, 0, 0, 0.4)',
        color: 'common.white',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.6)',
        },
      }}
    >
      <Iconify icon="eva:more-vertical-fill" />
    </IconButton>
  );

  const renderImg = (
    <Box
      sx={{
        top: 0,
        width: 1,
        height: 1,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.neutral',
      }}
    >
      {template.preview_image ? (
        <Box
          component="img"
          alt={template.name}
          src={template.preview_image}
          sx={{
            width: 1,
            height: 1,
            objectFit: 'cover',
          }}
        />
      ) : (
        <Iconify icon={"solar:camera-minimalistic-bold" as any} sx={{ width: 48, height: 48, color: 'text.disabled' }} />
      )}
    </Box>
  );

  return (
    <>
      <Card
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: '2px solid transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            transform: 'translateY(-4px)',
            boxShadow: (theme: any) => theme.customShadows?.z8 || theme.shadows[8],
          },
        }}
      >
        <Box sx={{ pt: '100%', position: 'relative', borderRadius: 1.5, overflow: 'hidden', m: 1.5 }}>
          {template.status && renderStatus}
          {renderAction}
          {renderImg}
        </Box>

        <Stack spacing={1.5} sx={{ p: 2, pt: 0.5 }}>
          <Box>
            <Typography variant="subtitle1" noWrap sx={{ fontWeight: '700' }}>
              {template.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Label color="default" variant="soft" sx={{ height: 20, fontSize: '0.7rem' }}>
                {template.code}
              </Label>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {template.event_type?.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: '700', color: 'primary.main' }}>
              ${Number(template.price).toFixed(2)}
            </Typography>
            {template.strikethrough_price && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.disabled',
                  textDecoration: 'line-through',
                }}
              >
                ${Number(template.strikethrough_price).toFixed(2)}
              </Typography>
            )}
          </Box>

          {template.template_fields?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 0.5 }}>
              {template.template_fields.map(({ field }) => (
                <Chip
                  key={field.id}
                  label={field.identifier}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          )}
        </Stack>
      </Card>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 120,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 1.5,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEdit();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
