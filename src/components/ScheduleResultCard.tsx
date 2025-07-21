import { Card, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Schedule } from '../types/schedule';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';

interface ScheduleResultCardProps {
  schedule: Schedule;
}

const ScheduleResultCard = ({ schedule }: ScheduleResultCardProps) => {
  console.log(schedule.id);
  return (
    <Card
      sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2, p: 3 }}
    >
      <Box sx={{ p: 1 }}>
        <Avatar sx={{ width: 60, height: 60 }}>
          {schedule.nutritionistName.charAt(0)}
        </Avatar>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          pr: 2,
          pl: 2,
        }}
      >
        <Box sx={{ flexGrow: 1, mr: 2 }}>
          <Typography component="div" variant="h6" p={1}>
            {schedule.nutritionistName}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip
              icon={<LocationOnIcon />}
              label={`${schedule.ibgeApiCity}, ${schedule.ibgeApiState}`}
              variant="outlined"
              size="small"
              sx={{
                p: 1.5,
              }}
            />
            {schedule.acceptsRemote && (
              <Chip
                icon={<LaptopChromebookIcon />}
                label="Aceita Teleconsulta"
                color="success"
                variant="outlined"
                size="small"
                sx={{
                  p: 1.5,
                }}
              />
            )}
          </Box>
        </Box>

        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to={`/agendamentos/confirmar/${schedule.id}`}
          >
            Agendar
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default ScheduleResultCard;
