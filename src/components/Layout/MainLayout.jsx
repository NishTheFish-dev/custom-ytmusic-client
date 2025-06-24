import React from 'react';
import Box from '@mui/material/Box';

/**
 * MainLayout – three-column flex layout that fills the available height.
 * Columns are left (1/5), center (3/5), right (1/5) of the horizontal space.
 * Each column receives its content via props so parent can decide what to render.
 * The component itself is purely presentational.
 */
const MainLayout = ({ left, center, right, isQueueOpen = true }) => {
  // Determine if the right-hand column (queue) should be shown
  const hasRight = Boolean(right) && isQueueOpen;

  // Flex ratios roughly mirror the previous 1.2 / 2.2 / 1.2 split (total 4.6)
  const flexLeft = 1.2;
  const flexRight = 1.2;
  const flexCenter = hasRight ? 2.2 : 2.2 + flexRight; // 3.4 when queue is hidden

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
          flex: flexCenter,
          
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {center}
      </Box>

      {/* Right – queue column (kept mounted to avoid re-mount lag) */}
      <Box
        sx={{
          flex: hasRight ? flexRight : 0,
          minWidth: 0,
          display: hasRight ? 'flex' : 'none',
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
