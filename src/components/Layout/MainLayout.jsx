import React from 'react';
import Box from '@mui/material/Box';

/**
 * MainLayout – three-column flex layout that fills the available height.
 * Columns are left (1/5), center (3/5), right (1/5) of the horizontal space.
 * Each column receives its content via props so parent can decide what to render.
 * The component itself is purely presentational.
 */
const MainLayout = ({ left, center, right }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        width: '100%',
        columnGap: '4px',
      }}
    >
      {/* Left – 1.5/5 */}
      <Box
        sx={{
          flex: 1.2,
          
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {left}
      </Box>

      {/* Center – 2/5 (40%) */}
      <Box
        sx={{
          flex: 2.2,
          
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {center}
      </Box>

      {/* Right – 1.5/5 */}
      <Box
        sx={{
          flex: 1.2,
          
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {right}
      </Box>
    </Box>
  );
};

export default MainLayout;
