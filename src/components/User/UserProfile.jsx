import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const UserProfile = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: 64,
        backgroundColor: 'var(--background-base)',
        borderTop: '1px solid var(--background-highlight)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <Avatar
          src={user?.avatar}
          alt={user?.name}
          sx={{
            width: 28,
            height: 28,
            marginRight: 1,
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            color: 'var(--text-base)',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginRight: 1,
          }}
        >
          {user?.name}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            color: 'var(--text-subdued)',
            fontSize: '1.25rem',
          }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'var(--background-elevated-base)',
            color: 'var(--text-base)',
            minWidth: 200,
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              padding: '8px 16px',
            },
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <SettingsIcon
              sx={{
                color: 'var(--text-subdued)',
                fontSize: '1.25rem',
              }}
            />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ borderColor: 'var(--background-highlight)' }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon
              sx={{
                color: 'var(--text-subdued)',
                fontSize: '1.25rem',
              }}
            />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile; 