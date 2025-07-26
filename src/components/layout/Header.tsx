import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import { signOutUser } from '../../store/slices/auth/authThunk';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import type { AppDispatch, RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { UserRole } from '../../types/user';
import { connectWebSocket, disconnectWebSocket } from '../../services/notificationService';
import {
  fetchNotifications,
  markAsRead,
} from '../../store/slices/notifications/notificationsSlice';
import type { Notification } from '../../types/notification';

export default function PrimarySearchAppBar() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.signIn);
  const { notifications } = useSelector((state: RootState) => state.notification);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationMenuAnchorEl, setNotificationMenuAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isNotificationMenuOpen = Boolean(notificationMenuAnchorEl);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Efeito para conectar/desconectar o WebSocket e buscar notificações
  useEffect(() => {
    console.log({ token: userInfo?.token });
    if (userInfo && userInfo.token) {
      dispatch(fetchNotifications());
      connectWebSocket(userInfo.id, userInfo.token, dispatch);
    }
    // Função de limpeza para desconectar ao sair do componente
    return () => {
      disconnectWebSocket();
    };
  }, [userInfo, userInfo?.token, dispatch]);

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchorEl(event.currentTarget);
  };
  const handleNotificationMenuClose = () => setNotificationMenuAnchorEl(null);

  const handleNotificationClick = (notification: Notification) => {
    // Marca como lida e navega para a página relacionada
    dispatch(markAsRead(notification.id));
    if (notification.relatedEntityId) {
      // Ex: navegar para a página de detalhes da consulta
      navigate(`/agendamentos/${notification.relatedEntityId}`);
    }
    handleNotificationMenuClose();
  };

  const handleNavigateToProfile = () => {
    handleMenuClose();
    const profile = userInfo?.role === UserRole.ROLE_NUTRITIONIST ? 'nutricionista' : 'paciente';
    navigate(`/perfil/${profile}`);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleSignOut = () => {
    handleMenuClose();
    dispatch(signOutUser());
  };

  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationMenuAnchorEl}
      open={isNotificationMenuOpen}
      onClose={handleNotificationMenuClose}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
          >
            {notification.message}
          </MenuItem>
        ))
      ) : (
        <MenuItem disabled>Nenhuma notificação</MenuItem>
      )}
    </Menu>
  );

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleNavigateToProfile}>Perfil</MenuItem>
      <MenuItem onClick={handleSignOut}>Sair</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton size="large" aria-label="show new mails" color="inherit">
          <Badge badgeContent={0} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Mensagens</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" aria-label="show new notifications" color="inherit">
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notificações</p>
      </MenuItem>
      <MenuItem onClick={handleNavigateToProfile}>
        <IconButton size="large" aria-label="show profile" color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Perfil</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Ícone de Menu (Hambúrguer) */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            {/* No seu código final, adicione a lógica para abrir um menu lateral aqui */}
          </IconButton>

          {/* Logo/Título */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to={
              userInfo?.role === UserRole.ROLE_NUTRITIONIST
                ? '/dashboard/nutricionista'
                : '/dashboard/paciente'
            }
            sx={{
              display: { xs: 'none', sm: 'block' },
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Nutri App
          </Typography>

          {/* Barra de Pesquisa (se precisar dela) */}
          {/* <Search> ... </Search> */}

          {/* Espaçador para empurrar os ícones para a direita */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Ícones da Direita (Desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" aria-label="show new mails" color="inherit">
              <Badge badgeContent={0} color="error">
                <MailIcon />
              </Badge>
            </IconButton>

            {/* ÍCONE DE NOTIFICAÇÃO CORRIGIDO E DINÂMICO */}
            <IconButton
              size="large"
              aria-label={`show ${unreadNotificationsCount} new notifications`}
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={unreadNotificationsCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>

          {/* Ícone "Mais" (Mobile) */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {renderNotificationsMenu}
    </Box>
  );
}
