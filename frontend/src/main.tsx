import React, { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import './styles.css';

type Status = 'todo' | 'in_progress' | 'done';

type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  created_date: string;
};

const API = 'http://localhost:8000/api';

const statusOptions: Array<{ value: Status; label: string }> = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/tasks`);
      if (!r.ok) throw new Error();
      setTasks(await r.json());
      setError('');
    } catch {
      setError('Could not connect to the API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const r = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, status }),
    });

    if (!r.ok) {
      setError('Could not create task.');
      return;
    }

    setTitle('');
    setDescription('');
    setStatus('todo');
    setError('');
    loadTasks();
  };

  const changeStatus = async (id: string, next: Status) => {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    loadTasks();
  };

  const removeTask = async (id: string) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  };

  const editTask = async (task: Task) => {
    const nextTitle = window.prompt('Task title:', task.title);
    if (nextTitle === null || !nextTitle.trim()) return;

    const nextDescription = window.prompt('Description:', task.description);
    if (nextDescription === null) return;

    await fetch(`${API}/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: nextTitle, description: nextDescription }),
    });

    loadTasks();
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="overline" color="text.secondary">PRODUCTIVITY</Typography>
            <Typography variant="h3" component="h1" fontWeight={700}>Task Manager</Typography>
          </Box>
          <Chip label={`${tasks.length} tasks`} color="primary" size="medium" />
        </Box>

        <Paper sx={{ p: 3 }} elevation={0} variant="outlined">
          <Typography variant="h5" gutterBottom>Create a task</Typography>
          <Box component="form" onSubmit={addTask} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a task title"
                fullWidth
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                multiline
                minRows={3}
                fullWidth
              />
              <Box display="flex" gap={2} alignItems="center">
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    {statusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" size="large" sx={{ ml: 'auto' }}>
                  Add task
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>Your tasks</Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : tasks.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No tasks yet. Create your first one above.
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid item xs={12} key={task.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="h6">{task.title}</Typography>
                            <Chip
                              label={task.status.replace('_', ' ')}
                              color={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'default'}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {task.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created {new Date(task.created_date).toLocaleString()}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                              value={task.status}
                              onChange={(e) => changeStatus(task.id, e.target.value as Status)}
                            >
                              {statusOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button variant="outlined" onClick={() => editTask(task)}>Edit</Button>
                          <Button color="error" variant="outlined" onClick={() => removeTask(task.id)}>
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Container>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
