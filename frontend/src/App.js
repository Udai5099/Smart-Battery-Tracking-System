import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';
import axios from 'axios';
import PredictionPanel from './components/PredictionPanel';
import ShapVisualization from './components/ShapVisualization';
import RecommendationsPanel from './components/RecommendationsPanel';
import FeatureImportanceChart from './components/FeatureImportanceChart';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batteryData, setBatteryData] = useState({
    Voltage_measured: 3.8,
    Current_measured: -1.0,
    Temperature_measured: 25.0,
    Current_load: -0.8,
    Voltage_load: 3.7,
    Time: 100,
    Sense_current: -1.0,
    Battery_current: -1.0,
    Current_ratio: 0.8,
    Battery_impedance: 0.1,
    Rectified_Impedance: 0.12,
    Current_charge: 1.2,
    Voltage_charge: 4.1
  });

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/predict', batteryData);
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (!prediction) return null;

    const rul = prediction.prediction;
    if (rul < 20) return { level: 'critical', color: 'error', icon: <Warning /> };
    if (rul < 50) return { level: 'high', color: 'warning', icon: <Warning /> };
    if (rul < 100) return { level: 'medium', color: 'info', icon: <Info /> };
    return { level: 'good', color: 'success', icon: <CheckCircle /> };
  };

  const healthStatus = getHealthStatus();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            🔋 Smart Battery Health Monitoring Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Human-AI Interaction System with Explainable Predictions
          </Typography>
          {healthStatus && (
            <Chip
              icon={healthStatus.icon}
              label={`Battery Health: ${healthStatus.level.toUpperCase()}`}
              color={healthStatus.color}
              size="large"
              sx={{ mt: 2, fontSize: '1rem', py: 1 }}
            />
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Analyzing battery health with AI...
            </Typography>
          </Box>
        )}

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Prediction Panel */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <PredictionPanel
                prediction={prediction}
                batteryData={batteryData}
                setBatteryData={setBatteryData}
                onPredict={handlePredict}
                loading={loading}
              />
            </Paper>
          </Grid>

          {/* SHAP Visualization */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <ShapVisualization prediction={prediction} />
            </Paper>
          </Grid>

          {/* Feature Importance Chart */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <FeatureImportanceChart prediction={prediction} />
            </Paper>
          </Grid>

          {/* Recommendations Panel */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <RecommendationsPanel prediction={prediction} />
            </Paper>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Research-Grade Human-AI Interaction System | Track 5 Publication
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;