import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const Companies = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteCompanyId, setDeleteCompanyId] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    address: {
      city: '',
      state: '',
      country: ''
    }
  });
  const [editCompany, setEditCompany] = useState({
    name: '',
    industry: '',
    address: {
      city: '',
      state: '',
      country: ''
    }
  });
  const [error, setError] = useState('');
  const [editError, setEditError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['companies', page, rowsPerPage, search],
    queryFn: async () => {
      const response = await api.get('/companies', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
        },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (company) => api.post('/companies', company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      enqueueSnackbar('Company created successfully', { variant: 'success' });
      setDialogOpen(false);
      setNewCompany({
        name: '',
        industry: '',
        address: { city: '', state: '', country: '' }
      });
      setError('');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Failed to create company');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/companies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      enqueueSnackbar('Company updated successfully', { variant: 'success' });
      setEditDialogOpen(false);
      setSelectedCompany(null);
      setEditCompany({
        name: '',
        industry: '',
        address: { city: '', state: '', country: '' }
      });
      setEditError('');
    },
    onError: (error) => {
      setEditError(error.response?.data?.message || 'Failed to update company');
    },
  });

  // Delete Mutation with proper error handling
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('Deleting company with ID:', id);
      return api.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      enqueueSnackbar('Company deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setDeleteCompanyId(null);
      setSelectedCompany(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete company';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setDeleteDialogOpen(false);
    },
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewCompany({
      name: '',
      industry: '',
      address: { city: '', state: '', country: '' }
    });
    setError('');
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newCompany);
  };

  const handleEditOpen = (company) => {
    setSelectedCompany(company);
    setEditCompany({
      name: company.name || '',
      industry: company.industry || '',
      address: {
        city: company.address?.city || '',
        state: company.address?.state || '',
        country: company.address?.country || ''
      }
    });
    setEditDialogOpen(true);
    setEditError('');
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedCompany(null);
    setEditCompany({
      name: '',
      industry: '',
      address: { city: '', state: '', country: '' }
    });
    setEditError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (selectedCompany) {
      updateMutation.mutate({ 
        id: selectedCompany._id, 
        data: editCompany 
      });
    }
  };

  // Delete handlers - Same as Leads page
  const handleDeleteClick = (company) => {
    console.log('Delete clicked for company:', company.name);
    setSelectedCompany(company);
    setDeleteCompanyId(company._id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const companyId = deleteCompanyId || selectedCompany?._id;
    console.log('Confirming delete for company ID:', companyId);
    
    if (companyId) {
      deleteMutation.mutate(companyId);
    } else {
      console.error('No company ID found for deletion');
      enqueueSnackbar('No company ID found for deletion', { variant: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCompany(null);
    setDeleteCompanyId(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Companies
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Company
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search companies by name, industry or location..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.companies?.map((company) => {
              const location = [
                company.address?.city,
                company.address?.state,
                company.address?.country
              ].filter(Boolean).join(', ');
              
              return (
                <TableRow key={company._id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.industry || '-'}</TableCell>
                  <TableCell>{location || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/companies/${company._id}`)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditOpen(company)}
                      title="Edit Company"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(company)}
                      title="Delete Company"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Create Company Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Company</DialogTitle>
        <form onSubmit={handleCreateSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              required
              label="Company Name"
              value={newCompany.name}
              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Industry"
              value={newCompany.industry}
              onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="City"
              value={newCompany.address.city}
              onChange={(e) => setNewCompany({ 
                ...newCompany, 
                address: { ...newCompany.address, city: e.target.value } 
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="State"
              value={newCompany.address.state}
              onChange={(e) => setNewCompany({ 
                ...newCompany, 
                address: { ...newCompany.address, state: e.target.value } 
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Country"
              value={newCompany.address.country}
              onChange={(e) => setNewCompany({ 
                ...newCompany, 
                address: { ...newCompany.address, country: e.target.value } 
              })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            {editError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {editError}
              </Alert>
            )}
            <TextField
              fullWidth
              required
              label="Company Name"
              value={editCompany.name}
              onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Industry"
              value={editCompany.industry}
              onChange={(e) => setEditCompany({ ...editCompany, industry: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="City"
              value={editCompany.address.city}
              onChange={(e) => setEditCompany({ 
                ...editCompany, 
                address: { ...editCompany.address, city: e.target.value } 
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="State"
              value={editCompany.address.state}
              onChange={(e) => setEditCompany({ 
                ...editCompany, 
                address: { ...editCompany.address, state: e.target.value } 
              })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Country"
              value={editCompany.address.country}
              onChange={(e) => setEditCompany({ 
                ...editCompany, 
                address: { ...editCompany.address, country: e.target.value } 
              })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog - Same as Leads page */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedCompany?.name}</strong>?
          </Typography>
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
            This action cannot be undone.
          </Typography>
          {selectedCompany?.leads?.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This company has {selectedCompany.leads.length} associated lead(s). 
              Please reassign or delete the leads first.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
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

export default Companies;