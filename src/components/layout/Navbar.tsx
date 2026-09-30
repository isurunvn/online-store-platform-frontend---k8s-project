import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Menu, MenuItem } from '@mui/material';
import { ShoppingCart, Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar: React.FC = () => {
  const { isAuthenticated, login, logout, isAdmin, tokenParsed } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
          Online Store
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Button color="inherit" component={Link} to="/products">Products</Button>
          {isAuthenticated && (
            <Button color="inherit" component={Link} to="/orders">Orders</Button>
          )}
          {isAdmin && (
            <Button color="inherit" component={Link} to="/admin/products">Admin Panel</Button>
          )}
        </Box>

        <IconButton color="inherit" component={Link} to="/cart" sx={{ ml: 2, mr: 2 }}>
          <Badge badgeContent={totalItems} color="secondary">
            <ShoppingCart />
          </Badge>
        </IconButton>

        {isAuthenticated ? (
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>{tokenParsed?.preferred_username}</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); logout(); }}>Logout</MenuItem>
            </Menu>
          </div>
        ) : (
          <Button color="inherit" onClick={() => login()}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
