import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Box, Card, CardContent, Grid, Chip,
  Tooltip, TextField, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import { getAllUsers, getUserHealthData, deleteUser, deleteHealthRecord } from '../services/api';
import { calculateAge } from '../utils/dateUtils';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!users) return;
    
    const filtered = users.filter(user => 
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      showSnackbar('Error fetching users', 'error');
    }
  };

  const handleViewHealthData = async (user) => {
    try {
      setSelectedUser(user);
      const response = await getUserHealthData(user.id);
      setHealthData(response.healthData || []);
      setOpenDialog(true);
    } catch (error) {
      showSnackbar('Error fetching health data', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      showSnackbar('You cannot delete your own account', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        showSnackbar('User deleted successfully');
        fetchUsers();
      } catch (error) {
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const handleDeleteHealthRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await deleteHealthRecord(selectedUser.id, recordId);
        showSnackbar('Health record deleted successfully');
        const updatedData = await getUserHealthData(selectedUser.id);
        setHealthData(updatedData);
      } catch (error) {
        showSnackbar('Error deleting health record', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getBMICategory = (bmi, dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    
    if (age < 20) {
      // BMI categories for children and teens (2-19 years)
      if (bmi < 5) return { label: 'Underweight', color: '#FFC107' };
      if (bmi < 85) return { label: 'Normal', color: '#4CAF50' };
      if (bmi < 95) return { label: 'Overweight', color: '#FF9800' };
      return { label: 'Obese', color: '#F44336' };
    } else {
      // BMI categories for adults
      if (bmi < 18.5) return { label: 'Underweight', color: '#FFC107' };
      if (bmi < 25) return { label: 'Normal', color: '#4CAF50' };
      if (bmi < 30) return { label: 'Overweight', color: '#FF9800' };
      return { label: 'Obese', color: '#F44336' };
    }
  };

  const getBloodPressureCategory = (systolic, diastolic, dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    
    // Children and teens (up to 19 years)
    if (age < 20) {
      // Percentile-based categories for children
      if (systolic < 90 || diastolic < 50) return { label: 'Low', color: '#FFC107' };
      if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: '#4CAF50' };
      if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Adults (20-59 years)
    if (age < 60) {
      if (systolic < 90 || diastolic < 60) return { label: 'Low', color: '#FFC107' };
      if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: '#4CAF50' };
      if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: '#FF9800' };
      if (systolic < 140 || diastolic < 90) return { label: 'Stage 1', color: '#FF5722' };
      return { label: 'Stage 2', color: '#F44336' };
    }
    
    // Elderly (60+ years)
    if (systolic < 110 || diastolic < 70) return { label: 'Low', color: '#FFC107' };
    if (systolic < 130 && diastolic < 80) return { label: 'Normal', color: '#4CAF50' };
    if (systolic < 140 && diastolic < 90) return { label: 'Elevated', color: '#FF9800' };
    if (systolic < 150 || diastolic < 90) return { label: 'Stage 1', color: '#FF5722' };
    return { label: 'Stage 2', color: '#F44336' };
  };

  const getBloodSugarCategory = (bloodSugar, dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    
    // Children and teens (up to 19 years)
    if (age < 20) {
      if (bloodSugar < 70) return { label: 'Low', color: '#FFC107' };
      if (bloodSugar < 100) return { label: 'Normal', color: '#4CAF50' };
      if (bloodSugar < 120) return { label: 'Pre-Diabetes', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Adults (20-59 years)
    if (age < 60) {
      if (bloodSugar < 70) return { label: 'Low', color: '#FFC107' };
      if (bloodSugar < 100) return { label: 'Normal', color: '#4CAF50' };
      if (bloodSugar < 126) return { label: 'Pre-Diabetes', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Elderly (60+ years)
    if (bloodSugar < 80) return { label: 'Low', color: '#FFC107' };
    if (bloodSugar < 110) return { label: 'Normal', color: '#4CAF50' };
    if (bloodSugar < 130) return { label: 'Pre-Diabetes', color: '#FF9800' };
    return { label: 'High', color: '#F44336' };
  };

  const getHeartRateCategory = (heartRate, dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    
    // Children (0-12 years)
    if (age < 13) {
      if (heartRate < 70) return { label: 'Low', color: '#FFC107' };
      if (heartRate <= 120) return { label: 'Normal', color: '#4CAF50' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Teens (13-19 years)
    if (age < 20) {
      if (heartRate < 60) return { label: 'Low', color: '#FFC107' };
      if (heartRate <= 100) return { label: 'Normal', color: '#4CAF50' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Adults (20-59 years)
    if (age < 60) {
      if (heartRate < 60) return { label: 'Low', color: '#FFC107' };
      if (heartRate <= 90) return { label: 'Normal', color: '#4CAF50' };
      if (heartRate <= 100) return { label: 'Elevated', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Elderly (60+ years)
    if (heartRate < 50) return { label: 'Low', color: '#FFC107' };
    if (heartRate <= 80) return { label: 'Normal', color: '#4CAF50' };
    if (heartRate <= 90) return { label: 'Elevated', color: '#FF9800' };
    return { label: 'High', color: '#F44336' };
  };

  const getCholesterolCategory = (cholesterol, dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    
    // Children and teens (up to 19 years)
    if (age < 20) {
      if (cholesterol < 120) return { label: 'Low', color: '#FFC107' };
      if (cholesterol < 170) return { label: 'Normal', color: '#4CAF50' };
      if (cholesterol < 200) return { label: 'Borderline', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Adults (20-59 years)
    if (age < 60) {
      if (cholesterol < 150) return { label: 'Low', color: '#FFC107' };
      if (cholesterol < 200) return { label: 'Normal', color: '#4CAF50' };
      if (cholesterol < 240) return { label: 'Borderline', color: '#FF9800' };
      return { label: 'High', color: '#F44336' };
    }
    
    // Elderly (60+ years)
    if (cholesterol < 160) return { label: 'Low', color: '#FFC107' };
    if (cholesterol < 210) return { label: 'Normal', color: '#4CAF50' };
    if (cholesterol < 250) return { label: 'Borderline', color: '#FF9800' };
    return { label: 'High', color: '#F44336' };
  };

  const getAnalytics = (healthData, userDetails) => {
    if (healthData.length < 2) return null;

    const latest = healthData[0];
    const previous = healthData[1];
    
    const calculateChange = (current, previous) => {
      const change = ((current - previous) / previous) * 100;
      return change.toFixed(1);
    };

    const MetricCard = ({ title, value, unit, previousValue, inverse, isBloodPressure }) => {
      // ... MetricCard implementation from Dashboard.js ...
    };

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        {/* ... Analytics JSX from Dashboard.js ... */}
      </Paper>
    );
  };

  const handlePrintRecord = async (record, userDetails) => {
    try {
      // Fetch fresh user data from the database
      const userData = await getUserHealthData(userDetails.id);
      const user = userData.user; // Assuming the API returns user details with health data
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.text("Medical Record", pageWidth/2, 20, { align: 'center' });
      
      // Date
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(record.recorded_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 20, 35);

      // Patient Information
      doc.setFontSize(14);
      doc.text("Patient Information", 20, 50);
      doc.setFontSize(12);
      
      const dob = user.date_of_birth ? 
        new Date(user.date_of_birth).toLocaleDateString() : 
        'Not provided';
      
      const age = user.date_of_birth ? calculateAge(user.date_of_birth) : 'N/A';
      
      doc.text([
        `Name: ${user.first_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}`,
        `Date of Birth: ${dob}`,
        `Age: ${age} years`,
        `Gender: ${user.gender || 'Not provided'}`,
        `Email: ${user.email}`,
        `Address: ${user.address || 'Not provided'}`
      ], 20, 60);

      // Vital Signs
      doc.setFontSize(14);
      doc.text("Vital Signs", 20, 100);
      
      const vitalSigns = [
        ['Measurement', 'Value', 'Status'],
        ['BMI', record.bmi, 
          getBMICategory(record.bmi, userDetails.date_of_birth).label],
        ['Blood Pressure', `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg`,
          getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic, userDetails.date_of_birth).label],
        ['Heart Rate', `${record.heart_rate} bpm`,
          getHeartRateCategory(record.heart_rate, userDetails.date_of_birth).label],
        ['Blood Sugar', `${record.blood_sugar} mg/dL`,
          getBloodSugarCategory(record.blood_sugar, userDetails.date_of_birth).label],
        ['Cholesterol', `${record.cholesterol} mg/dL`,
          getCholesterolCategory(record.cholesterol, userDetails.date_of_birth).label],
        ['Height', `${record.height} cm`, ''],
        ['Weight', `${record.weight} kg`, '']
      ];

      doc.autoTable({
        startY: 110,
        head: [vitalSigns[0]],
        body: vitalSigns.slice(1),
        theme: 'grid',
        styles: { fontSize: 12, cellPadding: 5 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      // Footer
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
      doc.text("MedTracker Health Records System", pageWidth/2, 280, { align: 'center' });
      doc.text("Page 1 of 1", pageWidth - 20, 280, { align: 'right' });

      // Save the PDF
      doc.save(`medical_record_${userDetails.last_name}_${new Date(record.recorded_at).toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      showSnackbar('Error generating PDF', 'error');
    }
  };

  const renderHealthRecordsDialog = () => {
    return (
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center">
            <MonitorHeartIcon sx={{ mr: 1 }} />
            Health Records - {selectedUser?.first_name} {selectedUser?.last_name}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {healthData && healthData.length > 0 ? (
            healthData.map((record) => (
              <Paper 
                key={record.id}
                elevation={3} 
                sx={{ p: 3, mb: 2, borderRadius: 2 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2 
                }}>
                  <Typography variant="h6" color="primary">
                    {new Date(record.recorded_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                  <Box>
                    <Tooltip title="Save as PDF">
                      <IconButton 
                        onClick={() => handlePrintRecord(record, selectedUser)}
                        sx={{ mr: 1 }}
                        color="primary"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      onClick={() => handleDeleteHealthRecord(selectedUser.id, record.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {/* BMI */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">BMI</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6">{record.bmi}</Typography>
                        <Chip 
                          label={getBMICategory(record.bmi, selectedUser.date_of_birth).label}
                          size="small"
                          sx={{ 
                            bgcolor: getBMICategory(record.bmi, selectedUser.date_of_birth).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Blood Pressure */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Blood Pressure</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6">
                          {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                        </Typography>
                        <Chip 
                          label={getBloodPressureCategory(
                            record.blood_pressure_systolic, 
                            record.blood_pressure_diastolic,
                            selectedUser.date_of_birth
                          ).label}
                          size="small"
                          sx={{ 
                            bgcolor: getBloodPressureCategory(
                              record.blood_pressure_systolic, 
                              record.blood_pressure_diastolic,
                              selectedUser.date_of_birth
                            ).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Heart Rate */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Heart Rate</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6">{record.heart_rate} bpm</Typography>
                        <Chip 
                          label={getHeartRateCategory(record.heart_rate, selectedUser.date_of_birth).label}
                          size="small"
                          sx={{ 
                            bgcolor: getHeartRateCategory(record.heart_rate, selectedUser.date_of_birth).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Blood Sugar */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">Blood Sugar</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6">{record.blood_sugar} mg/dL</Typography>
                        <Chip 
                          label={getBloodSugarCategory(record.blood_sugar, selectedUser.date_of_birth).label}
                          size="small"
                          sx={{ 
                            bgcolor: getBloodSugarCategory(record.blood_sugar, selectedUser.date_of_birth).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : (
            <Alert severity="info">No health records found for this user.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        User Management
      </Typography>

      {/* Search Bar */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white' }}>Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Gender</TableCell>
              <TableCell sx={{ color: 'white' }}>Date of Birth</TableCell>
              <TableCell sx={{ color: 'white' }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow 
                key={user.id}
                hover
                sx={{ 
                  '&:hover': { 
                    cursor: 'pointer',
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>
                  {new Date(user.date_of_birth).toLocaleDateString()}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Health History">
                    <IconButton 
                      onClick={() => handleViewHealthData(user)}
                      color="primary"
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  {user.id !== currentUser.id && (
                    <Tooltip title="Delete User">
                      <IconButton 
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    {users.length === 0 ? 'No users found' : 'No matching users found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {renderHealthRecordsDialog()}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard; 