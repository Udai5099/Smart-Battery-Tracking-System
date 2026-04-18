import React from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { BatteryChargingFull, PlayArrow } from '@mui/icons-material';

const PredictionPanel = ({ prediction, batteryData, setBatteryData, onPredict, loading }) => {
  const handleInputChange = (field, value) => {
    setBatteryData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getRulColor = (rul) => {
    if (rul < 20) return 'error';
    if (rul < 50) return 'warning';
    if (rul < 100) return 'info';
    return 'success';
  };

  const getRulStatus = (rul) => {
    if (rul < 20) return 'CRITICAL';
    if (rul < 50) return 'HIGH RISK';
    if (rul < 100) return 'MEDIUM RISK';
    return 'HEALTHY';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BatteryChargingFull color="primary" />
        Battery Health Prediction
      </Typography>

      {/* Prediction Result */}
      {prediction && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h4" component="div" color="primary" gutterBottom>
              {prediction.prediction.toFixed(1)} cycles
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Remaining Useful Life (RUL)
            </Typography>
            <Chip
              label={getRulStatus(prediction.prediction)}
              color={getRulColor(prediction.prediction)}
              size="small"
            />
          </CardContent>
        </Card>
      )}

      {/* Input Form */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
        Battery Parameters
      </Typography>

      <Grid container spacing={2}>
        {Object.entries(batteryData).map(([key, value]) => (
          <Grid item xs={12} sm={6} key={key}>
            <TextField
              fullWidth
              label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              type="number"
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
              size="small"
              disabled={loading}
            />
          </Grid>
        ))}
      </Grid>

      {/* Predict Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onPredict}
          disabled={loading}
          startIcon={<PlayArrow />}
          sx={{ minWidth: 200 }}
        >
          {loading ? 'Analyzing...' : 'Predict Battery Health'}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            AI analyzing battery degradation patterns...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PredictionPanel;