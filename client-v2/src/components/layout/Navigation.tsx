import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import { useAuthContext } from '@/features/auth/AuthContext';
import { useLogout } from '@/hooks/useAuth';

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = () => {
  const { user, isAuthenticated } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      handleMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.fullname || user.email?.split('@')[0] || 'User';
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#2e7d32' }}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 600,
          }}
        >
          🌱 EcoFashion
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* User Menu */}
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircle />}
                onClick={handleMenuOpen}
                sx={{ textTransform: 'none' }}
              >
                {getUserDisplayName()}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { minWidth: 200 },
                }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2">{user?.email}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <Logout sx={{ mr: 1, fontSize: 20 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/signup')}
                sx={{ ml: 1 }}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
