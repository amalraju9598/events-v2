import { varAlpha } from 'minimal-shared/utils';

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
  latestPost?: boolean;
  latestPostLarge?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
};

export function EventCard({ event, latestPost = false, latestPostLarge = false, onEdit, onDelete, onView }: Props) {
  // Generates a consistent, visually pleasing cover photo using the event's slug
  const coverUrl = `https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80`;

  const renderAvatar = (
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
        ...((latestPostLarge || latestPost) && {
          top: 24,
        }),
      }}
    >
      {event.user.name.charAt(0).toUpperCase()}
    </Avatar>
  );

  const renderTitle = (
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
        ...(latestPostLarge && { typography: 'h5', height: 60 }),
        ...((latestPostLarge || latestPost) && {
          color: 'common.white',
        }),
      }}
    >
      {event.name}
    </Link>
  );

  const renderCover = (
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
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 1,
        color: 'text.disabled',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      <Iconify icon={"solar:calendar-bold" as any} width={14} />
      {fDate(event.event_date)}
    </Typography>
  );

  const renderActions = (
    <Box
      sx={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        gap: 0.5,
        bgcolor: (theme) => varAlpha(theme.palette.background.paperChannel, 0.8),
        backdropFilter: 'blur(4px)',
        borderRadius: 1,
        p: 0.5,
        boxShadow: (theme) => theme.customShadows?.z8 || 1,
      }}
    >
      <IconButton size="small" onClick={onEdit}>
        <Iconify icon="solar:pen-bold" width={16} />
      </IconButton>
      <IconButton size="small" color="error" onClick={onDelete}>
        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
      </IconButton>
    </Box>
  );

  return (
    <Card
      sx={{
        position: 'relative',
        '&:hover .event-view-btn': { opacity: 1 },
      }}
    >
      {renderActions}

      <Box
        sx={(theme) => ({
          position: 'relative',
          pt: 'calc(100% * 3 / 4)',
          ...((latestPostLarge || latestPost) && {
            pt: 'calc(100% * 4 / 3)',
            '&:after': {
              top: 0,
              content: "''",
              width: '100%',
              height: '100%',
              position: 'absolute',
              bgcolor: varAlpha(theme.palette.grey['900Channel'], 0.72),
            },
          }),
          ...(latestPostLarge && {
            pt: {
              xs: 'calc(100% * 4 / 3)',
              sm: 'calc(100% * 3 / 4.66)',
            },
          }),
        })}
      >
        {renderAvatar}
        {renderCover}
      </Box>

      <Box
        sx={(theme) => ({
          p: theme.spacing(6, 3, 3, 3),
          ...((latestPostLarge || latestPost) && {
            width: 1,
            bottom: 0,
            position: 'absolute',
            zIndex: 9,
          }),
        })}
      >
        {renderDate}
        {renderTitle}

        {!(latestPostLarge || latestPost) && (
          <>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 1, mb: 2 }}>
              {event.description || 'No description provided.'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            </Box>

            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              onClick={onView}
              sx={{ mt: 2 }}
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              View Details
            </Button>
          </>
        )}

        {(latestPostLarge || latestPost) && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'common.white',
                fontWeight: 'medium',
              }}
            >
              {event.event_type.name}
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={onView}
              className="event-view-btn"
              sx={{
                opacity: 0.8,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 },
              }}
              startIcon={<Iconify icon="solar:eye-bold" />}
            >
              Details
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
}
