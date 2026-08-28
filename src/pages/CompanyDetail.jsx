import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Business as BusinessIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import api from '../api/axios';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['company', id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading company details</Alert>;
  }

  if (!data) {
    return <Alert severity="warning">Company not found</Alert>;
  }

  const { company, leads } = data;

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

  // Get full address
  const getFullAddress = () => {
    if (!company.address) return 'N/A';
    const parts = [
      company.address.street,
      company.address.city,
      company.address.state,
      company.address.country,
      company.address.zipCode
    ].filter(Boolean);
    return parts.join(', ') || 'N/A';
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/companies')}
        sx={{ mb: 2 }}
      >
        Back to Companies
      </Button>

      <Typography variant="h4" gutterBottom fontWeight={600}>
        Company Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight={600}>
                {company.name}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Company Name:</strong> {company.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Industry:</strong> {company.industry || 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Location:</strong> 
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                <LocationIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                {getFullAddress()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Associated Leads
              <Chip
                label={leads?.length || 0}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            {leads && leads.length > 0 ? (
              <List>
                {leads.map((lead) => (
                  <React.Fragment key={lead._id}>
                    <ListItem>
                      <ListItemText
                        primary={lead.name}
                        secondary={
                          <>
                            {lead.email} • {lead.phone}
                          </>
                        }
                      />
                      <Chip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                No leads associated with this company
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CompanyDetail;