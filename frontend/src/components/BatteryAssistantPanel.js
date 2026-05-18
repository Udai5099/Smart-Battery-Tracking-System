import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
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

const providerOptions = [
  { value: 'auto', label: 'Auto' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'local', label: 'Local fallback' }
];

const getProviderLabel = (value) => (
  providerOptions.find((option) => option.value === value)?.label || value || 'Auto'
);

function ResultMetric({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: '1px solid rgba(23, 105, 170, 0.16)',
        backgroundColor: 'rgba(23, 105, 170, 0.04)',
        minHeight: 72
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}

function BatteryAssistantPanel() {
  const [query, setQuery] = useState(sampleQuestions[0]);
  const [provider, setProvider] = useState('auto');
  const [topK, setTopK] = useState(3);
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
        top_k: topK,
        provider
      });
      setResponse({
        ...result.data,
        selected_provider: provider
      });
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

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Battery question"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="rag-provider-label">Answer provider</InputLabel>
              <Select
                labelId="rag-provider-label"
                label="Answer provider"
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
              >
                {providerOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="rag-topk-label">Retrieved docs</InputLabel>
              <Select
                labelId="rag-topk-label"
                label="Retrieved docs"
                value={topK}
                onChange={(event) => setTopK(Number(event.target.value))}
              >
                {[2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>
                    Top {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Grid>
      </Grid>

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
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <ResultMetric label="Answer provider" value={getProviderLabel(response.selected_provider)} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ResultMetric
                label="Knowledge docs"
                value={response.knowledge_base?.document_count ?? response.retrieved_documents?.length ?? 0}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ResultMetric label="Embedding model" value={response.knowledge_base?.embedding_model ?? 'hashing-v1'} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ResultMetric label="Retrieved docs shown" value={(response.retrieved_documents || []).length} />
            </Grid>
          </Grid>
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
