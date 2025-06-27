import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
  Box,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ApplicationsIcon,
  Book as ResourcesIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

interface NavigationItem {
  text: string;
  path: string;
  icon: React.ReactElement;
}

const navigationItems: NavigationItem[] = [
  {
    text: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
  },
  {
    text: 'Applications',
    path: '/applications',
    icon: <ApplicationsIcon />,
  },
  {
    text: 'Resources',
    path: '/resources',
    icon: <ResourcesIcon />,
  },
  {
    text: 'Settings',
    path: '/settings',
    icon: <SettingsIcon />,
  },
];

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 64;

interface NavigationProps {
  children: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!isMobile && (
        <Toolbar
          sx={{ justifyContent: 'flex-end', minHeight: '64px !important' }}
        >
          <IconButton onClick={handleCollapseToggle} size="small">
            {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
      )}

      <List sx={{ flexGrow: 1, pt: isMobile ? 2 : 0 }}>
        {navigationItems.map((item) => {
          const isActive = isActivePath(item.path);

          return (
            <ListItem key={item.text} disablePadding>
              <Tooltip
                title={item.text}
                placement="right"
                disableHoverListener={!collapsed || isMobile}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent:
                      collapsed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                    backgroundColor: isActive
                      ? theme.palette.action.selected
                      : 'transparent',
                    borderRight: isActive
                      ? `3px solid ${theme.palette.primary.main}`
                      : 'none',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed && !isMobile ? 'auto' : 3,
                      justifyContent: 'center',
                      color: isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        color: isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: isMobile
            ? DRAWER_WIDTH
            : collapsed
            ? COLLAPSED_DRAWER_WIDTH
            : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile
              ? DRAWER_WIDTH
              : collapsed
              ? COLLAPSED_DRAWER_WIDTH
              : DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: collapsed
              ? `calc(100% - ${COLLAPSED_DRAWER_WIDTH}px)`
              : `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          marginTop: isMobile ? '64px' : 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Navigation;
