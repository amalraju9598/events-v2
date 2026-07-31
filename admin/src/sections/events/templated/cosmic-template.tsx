import { varAlpha } from 'minimal-shared/utils';
import React, { useState, useEffect, useRef } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';

import { Iconify } from 'src/components/iconify';

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

export function CosmicTemplate({ event, fields }: Props) {
  const getFieldValue = (id: string, defaultVal: string) =>
    fields.find((f) => f.field.identifier === id)?.value || defaultVal;

  const bgImage = getFieldValue('background_image', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=2000');
  const bgMusic = getFieldValue('background_music', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  const spouse1 = getFieldValue('spouse_1', 'Alan Mark');
  const spouse2 = getFieldValue('spouse_2', 'Eva John');
  const spouse1Initials = spouse1.charAt(0).toUpperCase();
  const spouse2Initials = spouse2.charAt(0).toUpperCase();
  const spouse1Image = getFieldValue('spouse_1_image', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500');
  const spouse2Image = getFieldValue('spouse_2_image', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500');
  const spouse1Details = getFieldValue('spouse_1_details', 'Son of Mr & Mrs Mark');
  const spouse2Details = getFieldValue('spouse_2_details', 'Daughter of Mr & Mrs John');
  const ceremonyTime = getFieldValue('ceremony_time', '10:00 AM - 12:00 PM');
  const ceremonyAddress = getFieldValue('ceremony_address', 'Santa Cruz Cathedral Basilica, Fort Kochi');
  const receptionTime = getFieldValue('reception_time', '12:00 PM - 4:00 PM');
  const receptionAddress = getFieldValue('reception_address', 'Hotel Fort Queen, Manthra Rd, Fort Kochi');
  const youtubeVideoId = getFieldValue('youtube_video_id', 'Czd5zGd9DlY');
  
  const targetDateStr = getFieldValue('event_date', event.event_date);
  const targetDate = new Date(targetDateStr);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
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

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const sageGreen = '#5e9a8d';
  const pinkAccent = '#e6739f';

  const navItems = [
    { icon: <Iconify icon="solar:home-smile-bold" width={24} />, id: 'home' },
    { icon: <Iconify icon="solar:heart-bold" width={24} />, id: 'couple' },
    { icon: <Iconify icon="solar:map-point-bold" width={24} />, id: 'events' },
    { icon: <Iconify icon="solar:gallery-bold" width={24} />, id: 'gallery' },
    { icon: <Iconify icon="solar:videocamera-bold" width={24} />, id: 'video' },
    { icon: <Iconify icon="solar:chat-square-quote-bold" width={24} />, id: 'greetings' },
  ];

  return (
    <Box sx={{ fontFamily: "'Inter', sans-serif", bgcolor: '#fdfdfd', color: '#333', overflowX: 'hidden' }}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');
          .font-serif { font-family: 'Playfair Display', serif; }
        `}
      </style>

      {/* Audio Element */}
      <audio ref={audioRef} src={bgMusic} loop />

      {/* Fixed Top Right Controls */}
      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1100, display: 'flex', gap: 1 }}>
        <IconButton onClick={toggleMusic} sx={{ bgcolor: sageGreen, color: '#fff', '&:hover': { bgcolor: '#4a7d72' }, borderRadius: 1, width: 40, height: 40 }}>
          {isPlaying ? <Iconify icon="solar:volume-loud-bold" width={20} /> : <Iconify icon="solar:volume-cross-bold" width={20} />}
        </IconButton>
        <IconButton sx={{ bgcolor: sageGreen, color: '#fff', '&:hover': { bgcolor: '#4a7d72' }, borderRadius: 1, width: 40, height: 40 }}>
          <Iconify icon="solar:share-bold" width={20} />
        </IconButton>
      </Box>

      {/* Vertical Navigation (Left) */}
      <Box sx={{
        position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
        bgcolor: sageGreen, color: '#fff', borderRadius: 4, display: 'flex', flexDirection: 'column',
        zIndex: 1100, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
      }}>
        {navItems.map((item, idx) => (
          <IconButton key={idx} sx={{ color: '#fff', py: 1.5, px: 1, borderRadius: 0, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
            {item.icon}
          </IconButton>
        ))}
      </Box>

      {/* Hero Section */}
      <Box id="home" sx={{
        position: 'relative', height: '100vh',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(${bgImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
      }}>
        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#555', mb: 2 }}>
          WE ARE GETTING MARRIED
        </Typography>
        <Typography variant="h1" className="font-serif" sx={{ color: pinkAccent, fontSize: { xs: '5rem', md: '8rem' }, fontWeight: 700, lineHeight: 1 }}>
          {spouse1Initials}&{spouse2Initials}
        </Typography>
        <Typography variant="h6" sx={{ letterSpacing: 3, color: '#333', mt: 1, mb: 3 }}>
          {spouse1.toUpperCase()} & {spouse2.toUpperCase()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
            {targetDate.toLocaleString('default', { month: 'long' })}
          </Typography>
          <Typography variant="h3" sx={{ color: pinkAccent, fontWeight: 700, mx: 1 }}>
            {targetDate.getDate()}
          </Typography>
          <Typography variant="subtitle2" sx={{ letterSpacing: 1 }}>
            {targetDate.getFullYear()}
          </Typography>
        </Box>

        {/* Floating Countdown Box */}
        <Box sx={{
          position: 'absolute', bottom: { xs: 40, md: 80 }, width: '90%', maxWidth: 1000,
          bgcolor: sageGreen, color: '#fff', borderRadius: 2, p: 4,
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
        }}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 3, md: 0 } }}>
            <Typography variant="caption" sx={{ letterSpacing: 1 }}>We are waiting for.....</Typography>
            <Typography variant="h4" className="font-serif" sx={{ mt: 0.5 }}>The Adventure</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[
              { label: 'Days', val: timeLeft.days },
              { label: 'Hours', val: timeLeft.hours },
              { label: 'Minutes', val: timeLeft.minutes },
              { label: 'Seconds', val: timeLeft.seconds }
            ].map(time => (
              <Box key={time.label} sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, p: 2, minWidth: 70 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{time.val}</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{time.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Couple Section */}
      <Box id="couple" sx={{ py: 12, px: 3, textAlign: 'center', bgcolor: '#fff' }}>
        <Typography variant="h3" className="font-serif" sx={{ mb: 6, color: sageGreen }}>Happy Couples</Typography>
        <Grid container spacing={6} justifyContent="center" maxWidth="md" mx="auto">
          <Grid item xs={12} sm={6}>
            <Box component="img" src={spouse1Image} sx={{ width: 250, height: 250, objectFit: 'cover', borderRadius: '50%', mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <Typography variant="h4" className="font-serif" sx={{ mb: 1 }}>{spouse1}</Typography>
            <Typography variant="body2" color="text.secondary">{spouse1Details}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box component="img" src={spouse2Image} sx={{ width: 250, height: 250, objectFit: 'cover', borderRadius: '50%', mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
            <Typography variant="h4" className="font-serif" sx={{ mb: 1 }}>{spouse2}</Typography>
            <Typography variant="body2" color="text.secondary">{spouse2Details}</Typography>
          </Grid>
        </Grid>
      </Box>

      {/* When & Where Section */}
      <Box id="events" sx={{ py: 12, px: 3, bgcolor: '#f7f9f8', textAlign: 'center' }}>
        <Typography variant="h3" className="font-serif" sx={{ mb: 6, color: sageGreen }}>When & Where</Typography>
        <Grid container spacing={4} justifyContent="center" maxWidth="lg" mx="auto">
          {/* Ceremony */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 5, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" className="font-serif" sx={{ mb: 3 }}>Wedding Ceremony</Typography>
              <Typography variant="subtitle2" sx={{ color: pinkAccent, mb: 1, fontWeight: 700 }}>
                {targetDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>{ceremonyTime}</Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: 250 }}>{ceremonyAddress}</Typography>
              <Button variant="contained" sx={{ mt: 'auto', bgcolor: sageGreen, '&:hover': { bgcolor: '#4a7d72' }, borderRadius: 8, px: 4 }}>
                See Location
              </Button>
            </Card>
          </Grid>
          {/* Reception */}
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 5, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h5" className="font-serif" sx={{ mb: 3 }}>Wedding Reception</Typography>
              <Typography variant="subtitle2" sx={{ color: pinkAccent, mb: 1, fontWeight: 700 }}>
                {targetDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>{receptionTime}</Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: 250 }}>{receptionAddress}</Typography>
              <Button variant="contained" sx={{ mt: 'auto', bgcolor: sageGreen, '&:hover': { bgcolor: '#4a7d72' }, borderRadius: 8, px: 4 }}>
                See Location
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Video Section */}
      <Box id="video" sx={{ py: 12, px: 3, bgcolor: '#fff', textAlign: 'center' }}>
        <Typography variant="h3" className="font-serif" sx={{ mb: 2, color: sageGreen }}>Our Video</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
          A small glimpse of our journey together and the moments that led us to this beautiful day.
        </Typography>
        <Box sx={{ maxWidth: 900, mx: 'auto', position: 'relative', pt: '56.25%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      </Box>

      {/* Thank You Footer */}
      <Box sx={{ py: 10, px: 3, bgcolor: sageGreen, color: '#fff', textAlign: 'center' }}>
        <Typography variant="h2" className="font-serif" sx={{ mb: 1 }}>Thank You</Typography>
        <Typography variant="subtitle1" sx={{ fontStyle: 'italic', mb: 5, opacity: 0.9 }}>for being with us</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>Create your own invitation for your big day!</Typography>
        <Button variant="outlined" sx={{ color: '#fff', borderColor: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, borderRadius: 8, px: 4 }}>
          Create Invitation
        </Button>
        <Box sx={{ mt: 8, opacity: 0.6 }}>
          <Typography variant="caption">© 2026 360Invites. All rights reserved.</Typography>
        </Box>
      </Box>
    </Box>
  );
}
