import { Card, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { AvailableNutritionist } from '../types/schedule';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';

interface AvailableNutritionistResultCardProps {
  nutritionist: AvailableNutritionist;
}

const AvailableNutritionistResultCard = ({
  nutritionist,
}: AvailableNutritionistResultCardProps) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 2, p: 3 }}>
      <Box sx={{ p: 1 }}>
        <Avatar sx={{ width: 60, height: 60 }}>{nutritionist.nutritionistName.charAt(0)}</Avatar>
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
          <Typography component="div" variant="h5" p={1}>
            {nutritionist.nutritionistName}
          </Typography>

          <Typography component="div" variant="subtitle2" p={1}>
            {nutritionist.address}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip
              icon={<LocationOnIcon />}
              label={`${nutritionist.ibgeApiCity}, ${nutritionist.ibgeApiState}`}
              variant="outlined"
              size="small"
              sx={{
                p: 1.5,
              }}
            />
            {nutritionist.acceptsRemote && (
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
            to={`/agendamentos/confirmar/${nutritionist.id}`}
          >
            Agendar
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

export default AvailableNutritionistResultCard;
