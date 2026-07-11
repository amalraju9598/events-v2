import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type EventProps = {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  start_date: string;
  end_date: string;
  event_date: string;
  url: string | null;
  event_type_id: string;
  slug: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile_pic: string | null;
  };
  event_type: {
    id: string;
    name: string;
    icon: string | null;
  };
};

type Props = {
  event: EventProps;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};

export function EventCard({ event, onEdit, onDelete, onView }: Props) {
  // Generates a consistent, visually pleasing cover photo using the event's slug
  const coverUrl = `https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=60`;

  return (
    <Card sx={{ position: 'relative', '&:hover .event-actions': { opacity: 1 } }}>
      <Box
        sx={{
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
        }}
      >
        <Box
          component="img"
          src="/assets/icons/shape-avatar.svg"
          sx={{
            left: 0,
            width: 88,
            zIndex: 9,
            height: 36,
            bottom: -16,
            position: 'absolute',
            color: 'background.paper',
          }}
        />

        <Avatar
          alt={event.user.name}
          src={event.user.profile_pic || ''}
          sx={{
            left: 24,
            zIndex: 9,
            bottom: -24,
            position: 'absolute',
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {event.user.name.charAt(0).toUpperCase()}
        </Avatar>

        <Box
          component="img"
          alt={event.name}
          src={coverUrl}
          sx={{
            top: 0,
            width: 1,
            height: 1,
            objectFit: 'cover',
            position: 'absolute',
          }}
        />
      </Box>

      <Box sx={{ p: (theme) => theme.spacing(6, 3, 3, 3) }}>
        <Typography
          variant="caption"
          component="div"
          sx={{ mb: 1, color: 'text.disabled', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Iconify icon={"solar:calendar-bold" as any} width={14} />
          {fDate(event.event_date)}
        </Typography>

        <Link
          color="inherit"
          variant="subtitle2"
          underline="hover"
          onClick={onView}
          sx={{
            height: 44,
            overflow: 'hidden',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {event.name}
        </Link>

        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 1 }}>
          {event.description || 'No description provided.'}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              fontWeight: 'medium',
            }}
          >
            {event.event_type.name}
          </Typography>

          <Box
            className="event-actions"
            sx={{
              display: 'flex',
              gap: 0.5,
              opacity: 0.7,
              transition: 'opacity 0.2s',
            }}
          >
            <IconButton size="small" onClick={onEdit}>
              <Iconify icon={"solar:pen-bold" as any} width={16} />
            </IconButton>
            <IconButton size="small" color="error" onClick={onDelete}>
              <Iconify icon={"solar:trash-bin-trash-bold" as any} width={16} />
            </IconButton>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onView}
          sx={{ mt: 2 }}
          startIcon={<Iconify icon={"solar:eye-bold" as any} />}
        >
          View Details
        </Button>
      </Box>
    </Card>
  );
}
