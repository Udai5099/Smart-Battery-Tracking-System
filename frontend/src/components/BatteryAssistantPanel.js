import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const sampleQuestions = [
  'Why does my battery heat while charging?',
  'What does battery swelling mean?',
  'How can I improve lithium-ion battery lifespan?',
  'What should I check if voltage drops suddenly?'
];

function BatteryAssistantPanel() {
  const [query, setQuery] = useState(sampleQuestions[0]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAsk = async () => {
    if (!query.trim()) {
      setError('Enter a battery question to run retrieval.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const result = await axios.post(`${apiUrl}/rag/query`, {
        query: query.trim(),
        top_k: 3,
        provider: 'auto'
      });
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Battery assistant request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
            RAG assistant
          </Typography>
          <Typography variant="h6" gutterBottom>
            Solve Battery Query
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask a symptom, failure, or safety question and get a grounded answer from the battery knowledge base.
          </Typography>
        </Box>
        <Chip label="Vector retrieval + grounded generation" color="primary" variant="outlined" />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {sampleQuestions.map((item) => (
          <Chip key={item} label={item} onClick={() => setQuery(item)} variant="outlined" />
        ))}
      </Stack>

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Battery question"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" startIcon={<SearchIcon />} onClick={handleAsk} disabled={loading}>
          Solve Query
        </Button>
        {loading && <CircularProgress size={22} />}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Grounded answer
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
            {response.answer}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Retrieved documents
            </Typography>
            <Chip label={`Top ${(response.retrieved_documents || []).length}`} size="small" variant="outlined" />
          </Stack>
          <Stack spacing={1}>
            {(response.retrieved_documents || []).map((doc) => (
              <Box
                key={doc.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid rgba(25, 118, 210, 0.16)',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {doc.topic}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Severity: {doc.severity} / Score: {(doc.score || 0).toFixed(3)}
                </Typography>
                <Typography variant="body2">
                  {doc.recommendation}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default BatteryAssistantPanel;
