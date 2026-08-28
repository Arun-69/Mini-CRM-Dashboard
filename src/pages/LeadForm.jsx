import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'new',
    assignedTo: '',
    company: '',  // This should be company ID
  });
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: leadData, isLoading: isLoadingLead } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await api.get(`/leads/${id}`);
        return response.data.lead;
      } catch (error) {
        console.error('Error fetching lead:', error);
        return null;
      }
    },
    enabled: !!id,
  });

  const {
    data: usersData = [],
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/users');
        return response.data.users || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
  });

  const {
    data: companiesData = [],
    isLoading: isLoadingCompanies,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await api.get('/companies', { params: { limit: 100 } });
        console.log('Companies fetched:', response.data.companies);
        return response.data.companies || [];
      } catch (error) {
        console.error('Error fetching companies:', error);
        return [];
      }
    },
  });

  useEffect(() => {
    if (leadData) {
      console.log('Lead data loaded:', leadData);
      setFormData({
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        status: leadData.status || 'new',
        assignedTo: leadData.assignedTo?._id || '',
        company: leadData.company?._id || '',  // Get company ID
      });
    }
  }, [leadData]);

  const mutation = useMutation({
    mutationFn: (data) => {
      console.log('Saving lead data:', data);
      if (id) {
        return api.put(`/leads/${id}`, data);
      }
      return api.post('/leads', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      enqueueSnackbar(id ? 'Lead updated successfully' : 'Lead created successfully', {
        variant: 'success',
      });
      navigate('/leads');
    },
    onError: (error) => {
      console.error('Save error:', error);
      setError(error.response?.data?.message || 'Failed to save lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      console.log('Deleting lead from form:', id);
      return api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      enqueueSnackbar('Lead deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      navigate('/leads');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete lead', { 
        variant: 'error' 
      });
      setDeleteDialogOpen(false);
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    mutation.mutate(formData);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (id) {
      deleteMutation.mutate();
    }
  };

  if (id && isLoadingLead) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/leads')}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={600}>
            {id ? 'Edit Lead' : 'Add New Lead'}
          </Typography>
        </Box>
        {id && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete Lead
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="lost">Lost</MenuItem>
                  <MenuItem value="converted">Converted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  label="Assign To"
                  disabled={isLoadingUsers}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {isLoadingUsers ? (
                    <MenuItem disabled>Loading users...</MenuItem>
                  ) : isUsersError ? (
                    <MenuItem disabled>Failed to load users</MenuItem>
                  ) : (
                    usersData.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Company</InputLabel>
                <Select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  label="Company"
                  disabled={isLoadingCompanies}
                >
                  <MenuItem value="">No Company</MenuItem>
                  {isLoadingCompanies ? (
                    <MenuItem disabled>Loading companies...</MenuItem>
                  ) : (
                    companiesData.map((company) => (
                      <MenuItem key={company._id} value={company._id}>
                        {company.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/leads')}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{formData.name}</strong>?
          </Typography>
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadForm;