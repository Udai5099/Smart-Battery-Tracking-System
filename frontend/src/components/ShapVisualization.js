import React from 'react';
import {
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { TrendingUp, TrendingDown, Info } from '@mui/icons-material';

const ShapVisualization = ({ prediction }) => {
  if (!prediction) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" />
          SHAP Feature Explanations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Run a prediction to see how each feature contributes to the battery health assessment.
        </Typography>
      </Box>
    );
  }

  const { explanation } = prediction;
  const topContributors = explanation.top_contributors.slice(0, 5);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Info color="primary" />
        AI Feature Explanations
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        How each battery parameter influences the prediction:
      </Typography>

      <List>
        {topContributors.map(([feature, importance], index) => {
          const isPositive = importance > 0;
          const featureName = feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const absImportance = Math.abs(importance);

          return (
            <React.Fragment key={feature}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {isPositive ? (
                    <TrendingUp color="success" />
                  ) : (
                    <TrendingDown color="error" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {featureName}
                      </Typography>
                      <Chip
                        label={`${isPositive ? '+' : ''}${(importance * 100).toFixed(1)}%`}
                        size="small"
                        color={isPositive ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {isPositive
                        ? `Increases predicted lifespan by ${(importance * 100).toFixed(1)}%`
                        : `Decreases predicted lifespan by ${(absImportance * 100).toFixed(1)}%`
                      }
                    </Typography>
                  }
                />
              </ListItem>
              {index < topContributors.length - 1 && <Divider variant="inset" />}
            </React.Fragment>
          );
        })}
      </List>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>SHAP Analysis:</strong> These values show how much each feature pushes the prediction
          above (positive) or below (negative) the baseline. This explains the AI's decision-making process.
        </Typography>
      </Box>
    </Box>
  );
};

export default ShapVisualization;