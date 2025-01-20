import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Paper, Button, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, IconButton, Alert, Snackbar,
  Box, Divider, Chip, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ScaleIcon from '@mui/icons-material/Scale';
import HeightIcon from '@mui/icons-material/Height';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimelineIcon from '@mui/icons-material/Timeline';
import PrintIcon from '@mui/icons-material/Print';
import { getHealthData, addHealthData, deleteHealthData, getUserDetails } from '../services/api';
import { calculateAge } from '../utils/dateUtils';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const [healthData, setHealthData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newHealthData, setNewHealthData] = useState({
    height: '',
    weight: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_sugar: '',
    heart_rate: '',
    cholesterol: ''
  });

  useEffect(() => {
    fetchHealthData();
    fetchUserDetails();
  }, []);

  const fetchHealthData = async () => {
    try {
      const data = await getHealthData();
      setHealthData(data);
    } catch (error) {
      console.error('Error fetching health data:', error);
      showSnackbar('Error fetching health data', 'error');
    }
  };

  const fetchUserDetails = async () => {
    try {
      const data = await getUserDetails();
      setUserDetails(data);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showSnackbar('Error fetching user details', 'error');
    }
  };

  const handleAddHealthData = async () => {
    try {
      await addHealthData(newHealthData);
      setOpenDialog(false);
      fetchHealthData(); // Refresh the list
      setNewHealthData({
        height: '',
        weight: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        blood_sugar: '',
        heart_rate: '',
        cholesterol: ''
      });
      showSnackbar('Health record added successfully', 'success');
    } catch (error) {
      console.error('Error adding health data:', error);
      showSnackbar('Error adding health record', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      await deleteHealthData(id);
      fetchHealthData(); // Refresh the list
      showSnackbar('Health record deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting health data:', error);
      showSnackbar('Error deleting health record', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateBMI = (height, weight) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
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

  const getAnalytics = () => {
    if (healthData.length < 2) return null;

    const latest = healthData[0];
    const previous = healthData[1];
    
    const calculateChange = (current, previous) => {
      const change = ((current - previous) / previous) * 100;
      return change.toFixed(1);
    };

    const MetricCard = ({ title, value, unit, previousValue, inverse, isBloodPressure }) => {
      let change, isIncrease;

      if (isBloodPressure) {
        // For blood pressure, compare systolic values
        const [currentSystolic] = value.split('/').map(Number);
        const [previousSystolic] = previousValue.split('/').map(Number);
        change = ((currentSystolic - previousSystolic) / previousSystolic * 100).toFixed(1);
        isIncrease = currentSystolic > previousSystolic;
      } else {
        change = calculateChange(value, previousValue);
        isIncrease = value > previousValue;
      }

      // For some metrics like blood pressure, an increase is bad (inverse logic)
      const showRedForIncrease = inverse ? isIncrease : !isIncrease;

      // Define darker colors for better visibility
      const colors = {
        good: {
          text: '#2E7D32', // darker green
          bg: 'rgba(46, 125, 50, 0.15)' // semi-transparent dark green
        },
        bad: {
          text: '#D32F2F', // darker red
          bg: 'rgba(211, 47, 47, 0.15)' // semi-transparent dark red
        }
      };

      return (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          height: '100%'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
              {value} {unit}
            </Typography>
            {value !== previousValue && (
              <Tooltip title={`${Math.abs(change)}% ${isIncrease ? 'increase' : 'decrease'} from previous record. ${
                showRedForIncrease ? 'This change may need attention.' : 'This is a positive change.'
              }`}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: showRedForIncrease ? colors.bad.text : colors.good.text,
                  bgcolor: showRedForIncrease ? colors.bad.bg : colors.good.bg,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  cursor: 'help'
                }}>
                  {isIncrease ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      ml: 0.5,
                      fontWeight: 'bold'
                    }}
                  >
                    {Math.abs(change)}%
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      );
    };

    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'primary.main', 
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 3
        }}>
          <TimelineIcon /> Health Trends Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="BMI"
              value={latest.bmi}
              previousValue={previous.bmi}
              inverse={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Blood Pressure"
              value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`}
              previousValue={`${previous.blood_pressure_systolic}/${previous.blood_pressure_diastolic}`}
              inverse={true}
              isBloodPressure={true}
              unit="mmHg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Weight"
              value={latest.weight}
              unit="kg"
              previousValue={previous.weight}
              inverse={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Blood Sugar"
              value={latest.blood_sugar}
              unit="mg/dL"
              previousValue={previous.blood_sugar}
              inverse={true}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const handlePrintRecord = async (record) => {
    try {
      // Fetch fresh user data from the database
      const userData = await getUserDetails();
      
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
      
      const dob = userData.date_of_birth ? 
        new Date(userData.date_of_birth).toLocaleDateString() : 
        'Not provided';
      
      const age = userData.date_of_birth ? calculateAge(userData.date_of_birth) : 'N/A';
      
      doc.text([
        `Name: ${userData.first_name} ${userData.middle_name ? userData.middle_name + ' ' : ''}${userData.last_name}`,
        `Date of Birth: ${dob}`,
        `Age: ${age} years`,
        `Gender: ${userData.gender || 'Not provided'}`,
        `Email: ${userData.email}`,
        `Address: ${userData.address || 'Not provided'}`
      ], 20, 60);

      // Vital Signs
      doc.setFontSize(14);
      doc.text("Vital Signs", 20, 100);
      
      const vitalSigns = [
        ['Measurement', 'Value', 'Status'],
        ['BMI', calculateBMI(record.height, record.weight), 
          getBMICategory(calculateBMI(record.height, record.weight), userData.date_of_birth).label],
        ['Blood Pressure', `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg`,
          getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic, userData.date_of_birth).label],
        ['Heart Rate', `${record.heart_rate} bpm`,
          getHeartRateCategory(record.heart_rate, userData.date_of_birth).label],
        ['Blood Sugar', `${record.blood_sugar} mg/dL`,
          getBloodSugarCategory(record.blood_sugar, userData.date_of_birth).label],
        ['Cholesterol', `${record.cholesterol} mg/dL`,
          getCholesterolCategory(record.cholesterol, userData.date_of_birth).label],
        ['Height', `${record.height} cm`, ''],
        ['Weight', `${record.weight} kg`, '']
      ];

      doc.autoTable({
        startY: 110,
        head: [vitalSigns[0]],
        body: vitalSigns.slice(1),
        theme: 'grid',
        styles: {
          fontSize: 12,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [66, 66, 66]
        }
      });

      // Notes section
      doc.setFontSize(14);
      doc.text("Notes", 20, doc.autoTable.previous.finalY + 20);
      doc.setFontSize(12);
      doc.text([
        "This record was generated automatically from the MedTracker system.",
        "Please consult with a healthcare professional for interpretation of these results."
      ], 20, doc.autoTable.previous.finalY + 30);

      // Footer
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
      doc.text("MedTracker Health Records System", pageWidth/2, 280, { align: 'center' });
      doc.text("Page 1 of 1", pageWidth - 20, 280, { align: 'right' });

      // Save the PDF
      doc.save(`medical_record_${new Date(record.recorded_at).toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      showSnackbar('Error generating PDF', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Health Records
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Add New Record
        </Button>
      </Box>

      {/* Add Analytics Section */}
      {healthData.length >= 2 && getAnalytics()}

      {/* Add this condition to show message when no records exist */}
      {healthData.length === 0 ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'background.default'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Health Records Found
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Start tracking your health by adding your first record.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenDialog(true)}
            startIcon={<AddIcon />}
          >
            Add First Record
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {healthData.map((record, index) => (
            <Grid item xs={12} md={6} key={record.id || index}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  position: 'relative',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
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
                        onClick={() => handlePrintRecord(record)}
                        sx={{ mr: 1 }}
                        color="primary"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton 
                      onClick={() => handleDeleteRecord(record.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />

                {/* Main Stats */}
                <Grid container spacing={2}>
                  {/* BMI Section */}
                  <Grid item xs={12}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                          <Typography variant="body2" color="textSecondary">BMI</Typography>
                          <Typography variant="h6">{calculateBMI(record.height, record.weight)}</Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={getBMICategory(calculateBMI(record.height, record.weight), record.date_of_birth).label}
                        size="small"
                        sx={{ 
                          bgcolor: getBMICategory(calculateBMI(record.height, record.weight), record.date_of_birth).color,
                          color: 'white'
                        }}
                      />
                    </Paper>
                  </Grid>

                  {/* Measurements */}
                  <Grid item xs={6}>
                    <Tooltip title="Height">
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HeightIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="textSecondary">Height</Typography>
                            <Typography variant="h6">{record.height} cm</Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Tooltip>
                  </Grid>

                  <Grid item xs={6}>
                    <Tooltip title="Weight">
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScaleIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="textSecondary">Weight</Typography>
                            <Typography variant="h6">{record.weight} kg</Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Tooltip>
                  </Grid>

                  {/* Blood Pressure */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FavoriteIcon color="error" />
                          <Box>
                            <Typography variant="body2" color="textSecondary">Blood Pressure</Typography>
                            <Typography variant="h6">
                              {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={getBloodPressureCategory(
                            record.blood_pressure_systolic, 
                            record.blood_pressure_diastolic,
                            record.date_of_birth
                          ).label}
                          sx={{ 
                            bgcolor: getBloodPressureCategory(
                              record.blood_pressure_systolic, 
                              record.blood_pressure_diastolic,
                              record.date_of_birth
                            ).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Heart Rate */}
                  <Grid item xs={6}>
                    <Tooltip title="Heart Rate">
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonitorHeartIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">Heart Rate</Typography>
                              <Typography variant="h6">{record.heart_rate} bpm</Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={getHeartRateCategory(record.heart_rate, record.date_of_birth).label}
                            size="small"
                            sx={{ 
                              bgcolor: getHeartRateCategory(record.heart_rate, record.date_of_birth).color,
                              color: 'white'
                            }}
                          />
                        </Box>
                      </Paper>
                    </Tooltip>
                  </Grid>

                  {/* Blood Sugar */}
                  <Grid item xs={6}>
                    <Tooltip title="Blood Sugar">
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BloodtypeIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="textSecondary">Blood Sugar</Typography>
                              <Typography variant="h6">{record.blood_sugar} mg/dL</Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={getBloodSugarCategory(record.blood_sugar, record.date_of_birth).label}
                            size="small"
                            sx={{ 
                              bgcolor: getBloodSugarCategory(record.blood_sugar, record.date_of_birth).color,
                              color: 'white'
                            }}
                          />
                        </Box>
                      </Paper>
                    </Tooltip>
                  </Grid>

                  {/* Cholesterol */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Cholesterol</Typography>
                            <Typography variant="h6">{record.cholesterol} mg/dL</Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={getCholesterolCategory(record.cholesterol, record.date_of_birth).label}
                          size="small"
                          sx={{ 
                            bgcolor: getCholesterolCategory(record.cholesterol, record.date_of_birth).color,
                            color: 'white'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Health Record</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={newHealthData.height}
                onChange={(e) => setNewHealthData({...newHealthData, height: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={newHealthData.weight}
                onChange={(e) => setNewHealthData({...newHealthData, weight: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Systolic BP"
                type="number"
                value={newHealthData.blood_pressure_systolic}
                onChange={(e) => setNewHealthData({...newHealthData, blood_pressure_systolic: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Diastolic BP"
                type="number"
                value={newHealthData.blood_pressure_diastolic}
                onChange={(e) => setNewHealthData({...newHealthData, blood_pressure_diastolic: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Blood Sugar (mg/dL)"
                type="number"
                value={newHealthData.blood_sugar}
                onChange={(e) => setNewHealthData({...newHealthData, blood_sugar: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Heart Rate (bpm)"
                type="number"
                value={newHealthData.heart_rate}
                onChange={(e) => setNewHealthData({...newHealthData, heart_rate: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cholesterol (mg/dL)"
                type="number"
                value={newHealthData.cholesterol}
                onChange={(e) => setNewHealthData({...newHealthData, cholesterol: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddHealthData} variant="contained" color="primary">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 