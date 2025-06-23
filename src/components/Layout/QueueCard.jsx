import React from 'react';
import Box from '@mui/material/Box';
import QueuePanel from '../Queue/QueuePanel';

/**
 * QueueCard – right column container that displays the playback queue.
 */
const QueueCard = ({ queue, currentTrack }) => {
  return (
    <Box
      className="queue-card"
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        minHeight: 0,
        backgroundColor: 'var(--background-elevated-base)',
        borderRadius: '12px',
        p: 2,
        m: 1,
      }}
    >
      <QueuePanel
        queue={queue}
        currentTrack={currentTrack}
        onTrackClick={() => {}}
        onTrackPlay={() => {}}
        onTrackRemove={() => {}}
      />
    </Box>
  );
};

export default QueueCard;
