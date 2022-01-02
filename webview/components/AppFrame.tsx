import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { MachinatProfile } from '@machinat/core';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Divider from '@mui/material/Divider';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import getVtuber from '../utils/getVtuber';

type AppFrameProp = {
  children: ReactNode;
  title: string;
  oshi: undefined | null | string;
  userProfile?: null | MachinatProfile;
  isProcessing?: boolean;
};

const AppFrame = ({
  children,
  title,
  oshi,
  userProfile,
  isProcessing,
}: AppFrameProp) => {
  let vtuber = getVtuber(oshi);

  const [theme, setTheme] = React.useState(() => createTheme());
  React.useEffect(() => {
    setTheme(
      createTheme(
        vtuber
          ? {
              palette: {
                primary: {
                  main: vtuber.color.primary,
                },
                secondary: {
                  main: vtuber.color.secondary,
                },
              },
            }
          : undefined
      )
    );
  }, [oshi]);
  const appBarColor = oshi ? 'primary' : 'default';

  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const handleMenuClose = () => setMenuOpen(false);

  const router = useRouter();

  const drawerWidth = 250;
  const drawerContainer =
    typeof window !== 'undefined' ? () => window.document.body : undefined;
  const drawerContent = (
    <div>
      <AppBar color={appBarColor} position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleMenuClose}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            HoloPomodoro
          </Typography>
        </Toolbar>
      </AppBar>
      <Divider />
      <List>
        <ListItem
          button
          key="Oshi"
          onClick={() => router.push('/oshi')}
          selected={router.pathname === '/oshi'}
        >
          {vtuber ? (
            <ListItemAvatar>
              <Avatar alt={vtuber.englishName} src={vtuber.photo} />
            </ListItemAvatar>
          ) : (
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
          )}
          <ListItemText
            primary="Favorite VTuber"
            secondary={vtuber ? vtuber.englishName : 'Not Selected'}
          />
        </ListItem>
        <Divider />

        <ListItem
          button
          key="Statistics"
          onClick={() => router.push('/statistics')}
          selected={router.pathname === '/statistics'}
        >
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Statistics" />
        </ListItem>

        <ListItem
          button
          key="Subscriptions"
          onClick={() => router.push('/subscriptions')}
          selected={router.pathname === '/subscriptions'}
        >
          <ListItemIcon>
            <SubscriptionsIcon />
          </ListItemIcon>
          <ListItemText primary="Subscriptions" />
        </ListItem>

        <Divider />
        <ListItem
          button
          key="Settings"
          onClick={() => router.push('/settings')}
          selected={router.pathname === '/settings'}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <>
      <style global jsx>{`
        body {
          margin: 0;
          background-color: #eee;
        }
      `}</style>

      <Head>
        <title>HoloPomodoro</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar
            color={appBarColor}
            position="fixed"
            sx={{
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
            }}
          >
            <Toolbar>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { sm: 'none' } }}
                onClick={() => setMenuOpen(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                {title}
              </Typography>
              {userProfile ? (
                <Avatar alt={userProfile.name} src={userProfile.avatarUrl} />
              ) : (
                <Avatar>
                  <PersonIcon />
                </Avatar>
              )}
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
          >
            <Drawer
              container={drawerContainer}
              variant="temporary"
              open={isMenuOpen}
              onClose={handleMenuClose}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
            >
              {drawerContent}
            </Drawer>
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: drawerWidth,
                },
              }}
              open
            >
              {drawerContent}
            </Drawer>
          </Box>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={!!isProcessing}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
          <Box style={{ width: '100%' }}>
            <Toolbar />
            {children}
          </Box>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default AppFrame;
