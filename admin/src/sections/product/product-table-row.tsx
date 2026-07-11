import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type TemplateProps = {
  id: string;
  name: string;
  slug: string;
  code: string;
  price: number;
  strikethrough_price: number | null;
  preview_image: string | null;
  view_page?: string | null;
  status: 'draft' | 'active' | 'disabled';
  event_type_id: string;
  event_type: {
    id: string;
    name: string;
    identifier: string;
  };
  template_fields: {
    field: {
      id: string;
      identifier: string;
      type: string;
    };
  }[];
};

type TemplateTableRowProps = {
  row: TemplateProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: () => void;
  onDeleteRow: () => void;
};

export function TemplateTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: TemplateTableRowProps) {
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

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt={row.name}
              src={row.preview_image || ''}
              variant="rounded"
              sx={{ width: 48, height: 48, bgcolor: 'background.neutral' }}
            >
              <Iconify icon={"solar:camera-minimalistic-bold" as any} />
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: 'subtitle2' }}>{row.name}</Box>
              <Box sx={{ fontSize: 'caption.fontSize', color: 'text.secondary', display: 'flex', gap: 1 }}>
                <span>Slug: {row.slug}</span>
                <span>•</span>
                <span>Code: {row.code}</span>
              </Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell>{row.event_type?.name || '-'}</TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ fontWeight: 'subtitle2' }}>${Number(row.price).toFixed(2)}</Box>
            {row.strikethrough_price && (
              <Box sx={{ textDecoration: 'line-through', color: 'text.disabled', fontSize: 'caption.fontSize' }}>
                ${Number(row.strikethrough_price).toFixed(2)}
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell>
          <Label color={getStatusColor(row.status)} variant="soft">
            {row.status}
          </Label>
        </TableCell>

        <TableCell>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
            {row.template_fields?.length > 0 ? (
              row.template_fields.map(({ field }) => (
                <Chip
                  key={field.id}
                  label={`${field.identifier}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              ))
            ) : (
              <Box sx={{ color: 'text.disabled', fontSize: 'caption.fontSize' }}>No fields</Box>
            )}
          </Box>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleClosePopover();
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              onDeleteRow();
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
