import React from 'react';
import Box from '@mui/material/Box';

/**
 * ContentCard – central column container that hosts the main dynamic content.
 */
const ContentCard = ({ children }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'var(--background-elevated-base)',
        borderRadius: '12px',
        height: '100%',
        minHeight: 0,
        p: 2,
        m: 1,
      }}
    >
      {children}
    </Box>
  );
};

export default ContentCard;
