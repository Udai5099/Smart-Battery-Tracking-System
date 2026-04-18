import React from 'react';
import {
  Typography,
  Box
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart as BarChartIcon } from '@mui/icons-material';

const FeatureImportanceChart = ({ prediction }) => {
  if (!prediction) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChartIcon color="primary" />
          Feature Importance
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Feature importance chart will appear after prediction.
        </Typography>
      </Box>
    );
  }

  const { explanation } = prediction;
  const featureData = explanation.top_contributors.slice(0, 8).map(([feature, importance]) => ({
    name: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    importance: Math.abs(importance) * 100,
    originalImportance: importance
  }));

  const getBarColor = (importance) => {
    return importance > 0 ? '#4caf50' : '#f44336';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1,
          border: '1px solid #ccc',
          borderRadius: 1,
          boxShadow: 1
        }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          <Typography variant="body2" color={data.originalImportance > 0 ? 'success.main' : 'error.main'}>
            Impact: {data.originalImportance > 0 ? '+' : ''}{(data.originalImportance * 100).toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BarChartIcon color="primary" />
        Feature Contribution Analysis
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        How much each feature influences the battery health prediction:
      </Typography>

      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={featureData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis
              label={{ value: 'Impact (%)', angle: -90, position: 'insideLeft' }}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="importance" radius={[4, 4, 0, 0]}>
              {featureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.originalImportance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: 1 }} />
          <Typography variant="caption">Increases lifespan</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: 1 }} />
          <Typography variant="caption">Decreases lifespan</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FeatureImportanceChart;