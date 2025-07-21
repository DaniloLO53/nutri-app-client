import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Avatar,
} from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface DashboardCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  path: string;
}

const DashboardCard = ({
  icon,
  title,
  description,
  path,
}: DashboardCardProps) => {
  return (
    <CardActionArea
      component={RouterLink}
      to={path}
      sx={{
        width: 320,
        display: 'block',
      }}
    >
      <Card sx={{ height: 250, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              margin: '0 auto 16px',
              width: 56,
              height: 56,
            }}
          >
            {React.cloneElement(icon)}
          </Avatar>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </CardActionArea>
  );
};

export default DashboardCard;
