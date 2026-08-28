import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  ThumbUp as ThumbUpIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../api/axios';

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
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
    return <Alert severity="error">Error loading dashboard</Alert>;
  }

  const stats = [
    {
      title: 'Total Leads',
      value: data?.totalLeads || 0,
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      color: '#1976d2',
    },
    {
      title: 'Qualified Leads',
      value: data?.qualifiedLeads || 0,
      icon: <ThumbUpIcon sx={{ fontSize: 40, color: '#2e7d32' }} />,
      color: '#2e7d32',
    },
    {
      title: 'Tasks Due Today',
      value: data?.tasksDueToday || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#ed6c02' }} />,
      color: '#ed6c02',
    },
    {
      title: 'Completed Tasks',
      value: data?.completedTasks || 0,
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={600}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color + '20',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;