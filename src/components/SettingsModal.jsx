import React, { useState } from 'react';
import {
  Modal,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * SettingsModal displays application settings in a centered modal dialog with backdrop blur.
 *
 * Props:
 * - open     : boolean        – whether the modal is visible
 * - onClose  : () => void     – called when the modal should be closed (X button / backdrop)
 */
const SettingsModal = ({ open, onClose }) => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_, newIndex) => setTabIndex(newIndex);

  const renderTabPanel = () => {
    const containerStyles = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' };
    switch (tabIndex) {
      case 0:
        return (
          <Box sx={containerStyles}>
            <Typography variant="h6" color="text.secondary">General settings coming soon…</Typography>
          </Box>
        );
      case 1:
        return (
          <Box sx={containerStyles}>
            <Typography variant="h6" color="text.secondary">Integrations settings coming soon…</Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              {/* Play/Pause */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography>Play/Pause</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toggle play/pause playback
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace'
                  }}>
                    Ctrl + Shift + Space
                  </Box>

                </Box>
              </Box>


              {/* Next */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography>Next</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Play next track
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace'
                  }}>
                    Ctrl + Shift + PageUp
                  </Box>

                </Box>
              </Box>


              {/* Previous */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography>Previous</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Play previous track
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'monospace'
                  }}>
                    Ctrl + Shift + PageDown
                  </Box>

                </Box>
              </Box>


              {/* Volume Up */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography>Increase volume</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Raise the volume level
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace'
                }}>
                  Ctrl + Shift + Up
                </Box>
              </Box>


              {/* Volume Down */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography>Decrease volume</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lower the volume level
                  </Typography>
                </Box>
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  px: 1.5, 
                  py: 0.5, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace'
                }}>
                  Ctrl + Shift + Down
                </Box>
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="settings-modal-title"
      aria-describedby="settings-modal-description"
      closeAfterTransition
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(6px)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 900,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          pt: 6,
          outline: 'none',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
          aria-label="Close settings"
        >
          <CloseIcon />
        </IconButton>

        {/* Content Layout */}
        <Box sx={{ display: 'flex', mt: 1, minHeight: 400 }}>
          <Tabs
            orientation="vertical"
            value={tabIndex}
            onChange={handleChange}
            sx={{ borderRight: 1, borderColor: 'divider', minWidth: 180 }}
          >
            <Tab label="General" />
            <Tab label="Integrations" />
            <Tab label="Keybinds" />
          </Tabs>
          <Box sx={{ flex: 1, pl: 3 }}>
            {renderTabPanel()}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
