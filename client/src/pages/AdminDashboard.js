import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Box, Card, CardContent, Grid, Chip,
  Tooltip, TextField, InputAdornment, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Collapse, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { getAllUsers, getUserHealthData, deleteUser, deleteHealthRecord } from '../services/api';
import { calculateAge } from '../utils/dateUtils';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { 
  getBMICategory,
  getBloodPressureCategory,
  getHeartRateCategory,
  getBloodSugarCategory,
  getCholesterolCategory,
  getHemoglobinCategory,
  getRBCCategory,
  getWBCCategory,
  getPlateletCategory 
} from '../utils/healthUtils';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [healthData, setHealthData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [expandedRecord, setExpandedRecord] = useState(null);

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
      showSnackbar('You cannot deactivate your own account', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to deactivate this account? The user will no longer be able to log in.')) {
      try {
        await deleteUser(userId);
        showSnackbar('User account has been deactivated successfully');
        fetchUsers();
      } catch (error) {
        showSnackbar('Error deactivating user account', 'error');
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
      doc.text(`Date: ${new Date(record.created_at).toLocaleDateString('en-US', {
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
      doc.save(`medical_record_${userDetails.last_name}_${new Date(record.created_at).toISOString().split('T')[0]}.pdf`);
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
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <HistoryIcon />
          Health Records for {selectedUser?.first_name} {selectedUser?.last_name}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {healthData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Health Records Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This user has not added any health records yet.
              </Typography>
            </Box>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {healthData.map((record) => (
                <React.Fragment key={record.id}>
                  <ListItem 
                    disablePadding
                    sx={{ 
                      mb: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: 1
                    }}
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1, mr: 1 }}>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintRecord(record, selectedUser);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHealthRecord(record.id);
                          }}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemButton 
                      onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon>
                        <HealthAndSafetyIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                            {new Date(record.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              label={`BMI: ${record.bmi}`}
                              sx={{ 
                                bgcolor: getBMICategory(record.bmi, selectedUser?.date_of_birth).color + '20',
                                color: getBMICategory(record.bmi, selectedUser?.date_of_birth).color,
                                fontWeight: 'medium'
                              }}
                            />
                            <Chip
                              size="small"
                              label={`BP: ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic}`}
                              sx={{ 
                                bgcolor: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color + '20',
                                color: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color,
                                fontWeight: 'medium'
                              }}
                            />
                            <Chip
                              size="small"
                              label={`Sugar: ${record.blood_sugar} mg/dL`}
                              sx={{ 
                                bgcolor: getBloodSugarCategory(record.blood_sugar).color + '20',
                                color: getBloodSugarCategory(record.blood_sugar).color,
                                fontWeight: 'medium'
                              }}
                            />
                          </Box>
                        }
                      />
                      {expandedRecord === record.id ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expandedRecord === record.id} timeout="auto" unmountOnExit>
                    <Box sx={{ p: 3, bgcolor: 'grey.50', mx: 1, mb: 1, borderRadius: 2 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Basic Measurements
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Height</Typography>
                                  <Typography variant="body1">{record.height} cm</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2" color="text.secondary">Weight</Typography>
                                  <Typography variant="body1">{record.weight} kg</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">BMI</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">{record.bmi}</Typography>
                                    <Chip
                                      size="small"
                                      label={getBMICategory(record.bmi, selectedUser?.date_of_birth).label}
                                      sx={{ 
                                        bgcolor: getBMICategory(record.bmi, selectedUser?.date_of_birth).color + '20',
                                        color: getBMICategory(record.bmi, selectedUser?.date_of_birth).color
                                      }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Vital Signs
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Blood Pressure</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">
                                      {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).label}
                                      sx={{ 
                                        bgcolor: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color + '20',
                                        color: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color
                                      }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Heart Rate</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">{record.heart_rate} bpm</Typography>
                                    <Chip
                                      size="small"
                                      label={getHeartRateCategory(record.heart_rate).label}
                                      sx={{ 
                                        bgcolor: getHeartRateCategory(record.heart_rate).color + '20',
                                        color: getHeartRateCategory(record.heart_rate).color
                                      }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                              Blood Chemistry
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Blood Sugar</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">{record.blood_sugar} mg/dL</Typography>
                                    <Chip
                                      size="small"
                                      label={getBloodSugarCategory(record.blood_sugar).label}
                                      sx={{ 
                                        bgcolor: getBloodSugarCategory(record.blood_sugar).color + '20',
                                        color: getBloodSugarCategory(record.blood_sugar).color
                                      }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary">Cholesterol</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">{record.cholesterol} mg/dL</Typography>
                                    <Chip
                                      size="small"
                                      label={getCholesterolCategory(record.cholesterol, selectedUser?.date_of_birth).label}
                                      sx={{ 
                                        bgcolor: getCholesterolCategory(record.cholesterol, selectedUser?.date_of_birth).color + '20',
                                        color: getCholesterolCategory(record.cholesterol, selectedUser?.date_of_birth).color
                                      }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                            </Paper>
                          </Box>
                        </Grid>

                        {(record.hemoglobin || record.rbc || record.wbc || record.platelet_count) && (
                          <Grid item xs={12} md={6}>
                            <Box>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Complete Blood Count
                              </Typography>
                              <Paper variant="outlined" sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                  {record.hemoglobin && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">Hemoglobin</Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">{record.hemoglobin} g/dL</Typography>
                                        <Chip
                                          size="small"
                                          label={getHemoglobinCategory(record.hemoglobin, selectedUser?.gender).label}
                                          sx={{ 
                                            bgcolor: getHemoglobinCategory(record.hemoglobin, selectedUser?.gender).color + '20',
                                            color: getHemoglobinCategory(record.hemoglobin, selectedUser?.gender).color
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  )}
                                  {record.rbc && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">RBC Count</Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">{record.rbc} million/μL</Typography>
                                        <Chip
                                          size="small"
                                          label={getRBCCategory(record.rbc, selectedUser?.gender).label}
                                          sx={{ 
                                            bgcolor: getRBCCategory(record.rbc, selectedUser?.gender).color + '20',
                                            color: getRBCCategory(record.rbc, selectedUser?.gender).color
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  )}
                                  {record.wbc && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">WBC Count</Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">{record.wbc.toLocaleString()} per μL</Typography>
                                        <Chip
                                          size="small"
                                          label={getWBCCategory(record.wbc).label}
                                          sx={{ 
                                            bgcolor: getWBCCategory(record.wbc).color + '20',
                                            color: getWBCCategory(record.wbc).color
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  )}
                                  {record.platelet_count && (
                                    <Grid item xs={12}>
                                      <Typography variant="body2" color="text.secondary">Platelet Count</Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">{record.platelet_count.toLocaleString()} per μL</Typography>
                                        <Chip
                                          size="small"
                                          label={getPlateletCategory(record.platelet_count).label}
                                          sx={{ 
                                            bgcolor: getPlateletCategory(record.platelet_count).color + '20',
                                            color: getPlateletCategory(record.platelet_count).color
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                  )}
                                </Grid>
                              </Paper>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Collapse>
                  <Divider sx={{ my: 1 }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="contained"
          >
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
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
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
                  },
                  // Add slight opacity to deactivated accounts
                  opacity: user.is_active ? 1 : 0.7
                }}
              >
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.gender}</TableCell>
                <TableCell>
                  {new Date(user.date_of_birth).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.is_active ? "Active" : "Deactivated"}
                    color={user.is_active ? "success" : "error"}
                    size="small"
                    sx={{ 
                      fontWeight: 'medium',
                      minWidth: 85
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Health History">
                    <IconButton 
                      onClick={() => handleViewHealthData(user)}
                      color="primary"
                      disabled={!user.is_active}
                    >
                      <HistoryIcon />
                    </IconButton>
                  </Tooltip>
                  {user.id !== currentUser.id && (
                    <Tooltip title={user.is_active ? "Deactivate Account" : "Account Deactivated"}>
                      <IconButton 
                        onClick={() => handleDeleteUser(user.id)}
                        color="error"
                        disabled={!user.is_active}
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