import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
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

export type EventTypeProps = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  identifier: string;
  user_id: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type EventTypeTableRowProps = {
  row: EventTypeProps;
  selected: boolean;
  onSelectRow: () => void;
  onEditRow: () => void;
  onDeleteRow: () => void;
};

export function EventTypeTableRow({
  row,
  selected,
  onSelectRow,
  onEditRow,
  onDeleteRow,
}: EventTypeTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              <Iconify icon={(row.icon || 'solar:tag-bold') as any} />
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: 'subtitle2' }}>{row.name}</Box>
              <Box sx={{ fontSize: 'caption.fontSize', color: 'text.secondary' }}>
                {row.identifier}
              </Box>
            </Box>
          </Box>
        </TableCell>

        <TableCell>{row.description || '-'}</TableCell>

        <TableCell>
          {row.icon ? (
            <Label color="default" startIcon={<Iconify icon={row.icon as any} />}>
              {row.icon}
            </Label>
          ) : (
            '-'
          )}
        </TableCell>

        <TableCell>
          {row.user ? (
            <Box>
              <Box sx={{ fontWeight: 'body2' }}>{row.user.name}</Box>
              <Box sx={{ fontSize: 'caption.fontSize', color: 'text.secondary' }}>
                {row.user.email}
              </Box>
            </Box>
          ) : (
            <Label color="success" variant="soft">
              Global
            </Label>
          )}
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
