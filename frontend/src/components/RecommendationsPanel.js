import React from 'react';
import {
  Typography,
  Box,
  Alert,
  AlertTitle,
  Chip,
  Paper,
  ListItemIcon
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  Build,
  Assessment
} from '@mui/icons-material';

const RecommendationsPanel = ({ prediction }) => {
  if (!prediction) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" />
          Actionable Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AI-powered recommendations will appear after prediction analysis.
        </Typography>
      </Box>
    );
  }

  const { recommendations } = prediction;

  if (!recommendations || recommendations.length === 0) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle color="success" />
          Actionable Recommendations
        </Typography>
        <Alert severity="success">
          <AlertTitle>Battery Health: Good</AlertTitle>
          No immediate actions required. Continue regular monitoring.
        </Alert>
      </Box>
    );
  }

  // Group recommendations by priority
  const groupedRecs = recommendations.reduce((acc, rec) => {
    if (!acc[rec.priority]) acc[rec.priority] = [];
    acc[rec.priority].push(rec);
    return acc;
  }, {});

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <Error color="error" />;
      case 'HIGH': return <Warning color="warning" />;
      case 'MEDIUM': return <Warning color="info" />;
      case 'OPERATIONAL': return <Build color="primary" />;
      case 'PREVENTIVE': return <CheckCircle color="success" />;
      default: return <Info />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'OPERATIONAL': return 'primary';
      case 'PREVENTIVE': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment color="primary" />
        AI Actionable Recommendations
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Human-AI collaboration insights for battery maintenance:
      </Typography>

      {Object.entries(groupedRecs).map(([priority, recs]) => (
        <Box key={priority} sx={{ mb: 3 }}>
          <Chip
            label={`${priority} PRIORITY`}
            color={getPriorityColor(priority)}
            size="small"
            sx={{ mb: 1 }}
          />

          {recs.map((rec, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                mb: 1,
                borderLeft: 4,
                borderColor: `${getPriorityColor(priority)}.main`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ListItemIcon sx={{ minWidth: 32, mt: 0 }}>
                  {getPriorityIcon(priority)}
                </ListItemIcon>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    {rec.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Reason:</strong> {rec.reason}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <strong>Impact:</strong> {rec.impact}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      ))}

      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>Human-AI Collaboration</AlertTitle>
        These recommendations combine AI analysis with domain expertise to provide
        actionable maintenance insights for battery health management.
      </Alert>
    </Box>
  );
};

export default RecommendationsPanel;