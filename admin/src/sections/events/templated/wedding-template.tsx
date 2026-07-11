import { varAlpha } from 'minimal-shared/utils';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type FieldValue = {
  field_id: string;
  value: string;
  field: {
    id: string;
    identifier: string;
    type: string;
  };
};

type Props = {
  event: {
    name: string;
    description: string | null;
    event_date: string;
    start_date: string;
  };
  fields: FieldValue[];
};

export function WeddingTemplate({ event, fields }: Props) {
  // Extract values from custom fields
  const title = fields.find((f) => f.field.identifier === 'title')?.value || 'Wedding Invitation';
  const bannerImage = fields.find((f) => f.field.identifier === 'banner_image')?.value || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&auto=format&fit=crop&q=80';
  const venueLocation = fields.find((f) => f.field.identifier === 'venue_location')?.value || 'The Grand Ballroom, 5th Avenue';
  const detailedDescription = fields.find((f) => f.field.identifier === 'detailed_description')?.value || event.description || 'You are cordially invited to celebrate our wedding ceremony.';
  const spouse1 = fields.find((f) => f.field.identifier === 'spouse_1')?.value || 'Bride';
  const spouse2 = fields.find((f) => f.field.identifier === 'spouse_2')?.value || 'Groom';

  // Parse target date and time
  const targetDateStr = fields.find((f) => f.field.identifier === 'event_date')?.value || event.event_date;
  const targetDate = new Date(targetDateStr);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const tDate = new Date(targetDateStr);
      const difference = +tDate - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  const countdownItem = (value: number, label: string) => (
    <Box
      sx={{
        textAlign: 'center',
        px: { xs: 1.5, sm: 2.5 },
        py: 1.5,
        borderRadius: 1.5,
        minWidth: { xs: 65, sm: 85 },
        bgcolor: (theme) => varAlpha(theme.palette.common.whiteChannel, 0.15),
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'common.white', mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        {String(value).padStart(2, '0')}
      </Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 }}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 500,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url(${bannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'common.white',
        p: 4,
        fontFamily: "'Playfair Display', 'Didot', 'serif'",
      }}
    >
      {/* Wedding Invite Frame */}
      <Card
        sx={{
          maxWidth: 600,
          w: 1,
          bgcolor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          p: { xs: 3, md: 5 },
          borderRadius: 2.5,
          textAlign: 'center',
          color: 'common.white',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: 'primary.light',
            letterSpacing: 4,
            fontWeight: 'bold',
            fontSize: 12,
            mb: 2,
            display: 'block',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontFamily: 'serif',
            fontWeight: 'light',
            mb: 1,
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
          }}
        >
          {spouse1}
        </Typography>

        <Typography variant="h6" sx={{ fontStyle: 'italic', my: 1, color: 'primary.light' }}>
          &
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontFamily: 'serif',
            fontWeight: 'light',
            mb: 3,
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
          }}
        >
          {spouse2}
        </Typography>

        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
          &ldquo;{detailedDescription}&rdquo;
        </Typography>

        <Typography
          variant="h5"
          sx={{
            letterSpacing: 2,
            fontWeight: 'medium',
            color: 'primary.light',
            mb: 1.5,
          }}
        >
          {targetDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.8, mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          📍 {venueLocation}
        </Typography>

        <Typography variant="subtitle2" sx={{ letterSpacing: 2, mb: 2, textTransform: 'uppercase', opacity: 0.8 }}>
          Countdown To Celebration
        </Typography>

        {timeLeft.isOver ? (
          <Typography variant="h5" sx={{ fontStyle: 'italic', color: 'primary.light' }}>
            The wedding celebration has taken place! 🎉
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1 }}>
            {countdownItem(timeLeft.days, 'Days')}
            {countdownItem(timeLeft.hours, 'Hours')}
            {countdownItem(timeLeft.minutes, 'Mins')}
            {countdownItem(timeLeft.seconds, 'Secs')}
          </Box>
        )}
      </Card>
    </Box>
  );
}
