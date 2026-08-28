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
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../api/axios';

const Leads = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLeadId, setDeleteLeadId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', page, rowsPerPage, search, statusFilter],
    queryFn: async () => {
      const response = await api.get('/leads', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('Deleting lead with ID:', id);
      return api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      enqueueSnackbar('Lead deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      setDeleteLeadId(null);
      setSelectedLead(null);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to delete lead';
      enqueueSnackbar(errorMsg, { variant: 'error' });
      setDeleteDialogOpen(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/leads/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      enqueueSnackbar('Lead status updated', { variant: 'success' });
      handleMenuClose();
    },
    onError: () => {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
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

  const handleMenuClick = (event, lead) => {
    setAnchorEl(event.currentTarget);
    setSelectedLead(lead);
    setDeleteLeadId(lead._id);
    console.log('Menu opened for lead:', lead.name, 'ID:', lead._id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    console.log('Delete clicked - selectedLead:', selectedLead);
    setAnchorEl(null);
    
    if (selectedLead && selectedLead._id) {
      console.log('Opening delete dialog for:', selectedLead.name);
      setDeleteDialogOpen(true);
    } else {
      console.error('No lead selected for deletion');
      enqueueSnackbar('No lead selected for deletion', { variant: 'error' });
    }
  };

  const handleDeleteConfirm = () => {
    const leadId = deleteLeadId || selectedLead?._id;
    console.log('Confirming delete for lead ID:', leadId);
    
    if (leadId) {
      deleteMutation.mutate(leadId);
    } else {
      console.error('No lead ID found for deletion');
      enqueueSnackbar('No lead ID found for deletion', { variant: 'error' });
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleStatusChange = (status) => {
    if (selectedLead) {
      updateStatusMutation.mutate({ id: selectedLead._id, status });
    }
  };

 
  const handleViewLead = (lead) => {
    console.log('Viewing lead:', lead.name);
    setViewLead(lead);
    setViewDialogOpen(true);
  };

 
  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setViewLead(null);
  };


  const handleEditLead = (leadId) => {
    console.log('Editing lead:', leadId);
    navigate(`/leads/${leadId}/edit`);
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'info',
      contacted: 'warning',
      qualified: 'success',
      lost: 'error',
      converted: 'success',
    };
    return colors[status] || 'default';
  };

  const handleDialogClose = () => {
    setDeleteDialogOpen(false);
    if (!deleteMutation.isPending) {
      setSelectedLead(null);
      setDeleteLeadId(null);
    }
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
          Leads
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/leads/new')}
        >
          Add Lead
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search leads..."
              value={search}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="contacted">Contacted</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
                <MenuItem value="converted">Converted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              {/* <TableCell>Phone</TableCell> */}
              {/* <TableCell>Company</TableCell> */}
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.leads?.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                {/* <TableCell>{lead.phone}</TableCell> */}
                {/* <TableCell>{lead.company?.name || '-'}</TableCell> */}
                <TableCell>
                  <Chip
                    label={lead.status}
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{lead.assignedTo?.name || 'Unassigned'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleViewLead(lead)}
                    title="View Lead Details"
                    color="primary"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  
                  
                  <IconButton
                    size="small"
                    onClick={() => handleEditLead(lead._id)}
                    title="Edit Lead"
                    color="secondary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, lead)}
                    title="More Actions"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('contacted')}>
          Mark as Contacted
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('qualified')}>
          Mark as Qualified
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('converted')}>
          Mark as Converted
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('lost')}>
          Mark as Lost
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedLead?.name}</strong>?
          </Typography>
          <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
            This action cannot be undone.
          </Typography>
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

      {/*  View Lead Details Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleViewDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Lead Details</Typography>
            <Button 
              onClick={handleViewDialogClose}
              color="primary"
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {viewLead && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.name}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.email}
                  </Typography>
                </Grid>
                
                {/* <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.phone}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Company
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.company?.name || 'N/A'}
                  </Typography>
                </Grid> */}
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={viewLead.status}
                    color={getStatusColor(viewLead.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Source
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.source || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Assigned To
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.assignedTo?.name || 'Unassigned'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.notes || 'No notes available'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.createdAt ? new Date(viewLead.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {viewLead.updatedAt ? new Date(viewLead.updatedAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleViewDialogClose();
                    handleEditLead(viewLead._id);
                  }}
                >
                  Edit Lead
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleViewDialogClose}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Leads;