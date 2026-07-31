import { varAlpha } from 'minimal-shared/utils';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

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

export function CinematicGoldTemplate({ event, fields }: Props) {
  const getFieldValue = (id: string, defaultVal: string) =>
    fields.find((f) => f.field.identifier === id)?.value || defaultVal;

  const bannerImage = getFieldValue('banner_image', 'https://360invites.com/themes/glanz/images/11019.jpg');
  const spouse1 = getFieldValue('spouse_1', 'Alex Mark');
  const spouse2 = getFieldValue('spouse_2', 'Isha John');
  const spouse1Image = getFieldValue('spouse_1_image', 'https://360invites.com/storage/210/groom_photo_1766664192.jpeg');
  const spouse2Image = getFieldValue('spouse_2_image', 'https://360invites.com/storage/209/bride_photo_1766664044.jpeg');
  const spouse1Details = getFieldValue('spouse_1_details', 'Alex Mark son of Mark Louis and Betty Friedan');
  const spouse2Details = getFieldValue('spouse_2_details', 'Isha John daughter of John Wayne and Mary Luke');
  const ceremonyTime = getFieldValue('ceremony_time', 'Time : 10:00 AM - 12:00 PM');
  const ceremonyAddress = getFieldValue('ceremony_address', 'Santa Cruz Cathedral Basilica, Fort Nagar, Fort Kochi');
  const receptionTime = getFieldValue('reception_time', 'Time : 12:00 PM - 4:00 PM');
  const receptionAddress = getFieldValue('reception_address', 'Hotel Fort Queen, Manthra Rd, Pandikudy, Thamaraparambu, Fort Kochi');
  const youtubeVideoId = getFieldValue('youtube_video_id', 'Czd5zGd9DlY');

  const targetDateStr = getFieldValue('event_date', event.event_date);
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
    <Box sx={{
      textAlign: 'center', p: 1, color: '#d4af37', border: '1px solid #d4af37',
      borderRadius: 1, minWidth: 60, bgcolor: 'rgba(0,0,0,0.5)'
    }}>
      <Typography variant="h4" sx={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>{String(value).padStart(2, '0')}</Typography>
      <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>{label}</Typography>
    </Box>
  );

  return (
    <Box sx={{ fontFamily: 'serif', bgcolor: '#000', color: '#fff', width: '100%', overflowX: 'hidden' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        `}
      </style>

      {/* Sticky Header */}
      <Box sx={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 70,
        bgcolor: 'rgba(0,0,0,0.95)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 8 },
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box>
          <Typography sx={{ fontWeight: 'bold', letterSpacing: 1, fontSize: '1.1rem' }}>
            {spouse1.toUpperCase()} & {spouse2.toUpperCase()}
          </Typography>
          <Typography sx={{ fontStyle: 'italic', color: '#ccc', fontSize: '0.8rem' }}>
            {targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
          {['Home', 'Wedding', 'Gallery', 'Reception', 'Count Down'].map(item => (
            <Typography key={item} sx={{ cursor: 'pointer', fontSize: '0.9rem', '&:hover': { color: '#d4af37' } }}>
              {item}
            </Typography>
          ))}
        </Box>
      </Box>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative', height: '100vh',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${bannerImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: { xs: 'scroll', md: 'fixed' },
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', p: 3, pt: '70px'
      }}>
        <Box component="img" src="https://360invites.com/themes/glanz/images/animations/ourwedding_gold.gif" alt="" sx={{ height: { xs: 200, md: 330 }, mb: 4 }} />
        <Typography variant="h3" sx={{ color: '#d4af37', mb: 2 }}>{spouse1} & {spouse2}</Typography>
        <Typography variant="h5" sx={{ color: '#fff' }}>
          {targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>

      {/* Wedding Invitation Section */}
      <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#000' }}>
        <Typography sx={{ fontFamily: "'Dancing Script', cursive", fontSize: { xs: '3rem', md: '4.5rem' }, color: '#fff', mb: 3 }}>
          Wedding <span style={{ color: '#d4af37' }}>Invitation</span>
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 2, fontSize: '1.1rem' }}>
          With joyful hearts we invite you to celebrate the union of {spouse1} and {spouse2} as they join together in marriage.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: '#fff', color: '#000', borderRadius: 8, px: 4, py: 1, '&:hover': { bgcolor: '#ddd' } }}>
          View Map
        </Button>
      </Box>

      {/* Bride and Groom Section */}
      <Grid container sx={{ bgcolor: '#000' }}>
        <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 1 }, bgcolor: '#f5f5f5', color: '#000', p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: { xs: 400, md: 500 } }}>
          <Typography sx={{ fontFamily: "'Dancing Script', cursive", fontSize: '4rem', mb: 1, color: '#222' }}>{spouse1}</Typography>
          <Typography variant="body2" sx={{ color: '#666', maxWidth: 300 }}>{spouse1Details}</Typography>
        </Grid>
        <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 2 } }}>
          <Box sx={{
            height: { xs: 400, md: 500 }, width: '100%',
            backgroundImage: `url(${spouse1Image})`, backgroundSize: 'cover', backgroundPosition: 'center'
          }} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ order: { xs: 4, md: 3 } }}>
          <Box sx={{
            height: { xs: 400, md: 500 }, width: '100%',
            backgroundImage: `url(${spouse2Image})`, backgroundSize: 'cover', backgroundPosition: 'center'
          }} />
        </Grid>
        <Grid item xs={12} md={6} sx={{ order: { xs: 3, md: 4 }, bgcolor: '#f5f5f5', color: '#000', p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', height: { xs: 400, md: 500 } }}>
          <Typography sx={{ fontFamily: "'Dancing Script', cursive", fontSize: '4rem', mb: 1, color: '#222' }}>{spouse2}</Typography>
          <Typography variant="body2" sx={{ color: '#666', maxWidth: 300 }}>{spouse2Details}</Typography>
        </Grid>
      </Grid>

      {/* Save the Date (Video) */}
      <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#000' }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 5 }}>Save the Date</Typography>
        <Box sx={{ maxWidth: 800, mx: 'auto', position: 'relative', pt: '56.25%' }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </Box>

      {/* Count Down Section */}
      <Box sx={{
        py: 10, px: 3, textAlign: 'center', position: 'relative',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://360invites.com/themes/glanz/images/14630573088_e3cb39d65b_k.jpg)`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: { xs: 'scroll', md: 'fixed' }
      }}>
        <Box component="img" src="https://360invites.com/themes/glanz/images/animations/save_gold.gif" alt="" sx={{ height: { xs: 150, md: 280 }, mb: 4 }} />
        <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
          {targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
        <Typography variant="h5" sx={{ color: '#d4af37', mb: 3 }}>{ceremonyTime}</Typography>
        <Typography variant="h6" sx={{ color: '#fff', mb: 4, maxWidth: 600, mx: 'auto' }}>{ceremonyAddress}</Typography>
        <Button variant="contained" sx={{ bgcolor: '#fff', color: '#000', borderRadius: 8, px: 4, '&:hover': { bgcolor: '#ddd' }, mb: 5 }}>
          View Map
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          {countdownItem(timeLeft.days, 'Days')}
          {countdownItem(timeLeft.hours, 'Hours')}
          {countdownItem(timeLeft.minutes, 'Minutes')}
          {countdownItem(timeLeft.seconds, 'Seconds')}
        </Box>
      </Box>

      {/* Reception Section */}
      <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#000' }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 5 }}>Reception</Typography>
        <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
          {targetDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
        </Typography>
        <Typography variant="h5" sx={{ color: '#d4af37', mb: 3 }}>{receptionTime}</Typography>
        <Typography variant="h6" sx={{ color: '#fff', mb: 4, maxWidth: 600, mx: 'auto' }}>{receptionAddress}</Typography>
        <Button variant="contained" sx={{ bgcolor: '#fff', color: '#000', borderRadius: 8, px: 4, '&:hover': { bgcolor: '#ddd' } }}>
          View Map
        </Button>
      </Box>

      {/* Footer Section */}
      <Box sx={{
        py: 10, px: 3, textAlign: 'center', position: 'relative',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://360invites.com/themes/glanz/images/footer_back.jpg)`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: { xs: 'scroll', md: 'fixed' }
      }}>
        <Box component="img" src="https://360invites.com/themes/glanz/images/animations/thanks_gold.gif" alt="" sx={{ height: 140, mb: 4 }} />
        <Typography variant="h6" sx={{ color: '#fff', fontStyle: 'italic', maxWidth: 600, mx: 'auto' }}>
          "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage."
        </Typography>
      </Box>

    </Box>
  );
}
