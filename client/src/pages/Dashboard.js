import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Paper, Button, Dialog, DialogTitle, 
  DialogContent, TextField, DialogActions, IconButton, Alert, Snackbar,
  Box, Divider, Chip, Tooltip, List, ListItem, ListItemText, Collapse, ListItemIcon, ListItemButton
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
import { 
  getHemoglobinCategory, getRBCCategory, 
  getWBCCategory, getPlateletCategory 
} from '../utils/healthUtils';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

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
    cholesterol: '',
    hemoglobin: '',
    rbc: '',
    wbc: '',
    platelet_count: ''
  });
  const [expandedRecord, setExpandedRecord] = useState(null);

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
        cholesterol: '',
        hemoglobin: '',
        rbc: '',
        wbc: '',
        platelet_count: ''
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

    const isValueAbnormal = (value, type, gender) => {
      switch (type) {
        case 'BMI':
          return value < 18.5 || value > 24.9;
        case 'Blood Pressure':
          const [systolic] = value.split('/').map(Number);
          return systolic > 120;
        case 'Blood Sugar':
          return value < 70 || value > 100;
        case 'Cholesterol':
          return value > 200;
        case 'Hemoglobin':
          return gender === 'Male' 
            ? (value < 13.5 || value > 17.5)
            : (value < 12.0 || value > 15.5);
        case 'RBC Count':
          return gender === 'Male'
            ? (value < 4.5 || value > 5.9)
            : (value < 4.0 || value > 5.2);
        case 'WBC Count':
          return value < 4000 || value > 11000;
        case 'Platelet Count':
          return value < 150000 || value > 450000;
        default:
          return false;
      }
    };

    const MetricCard = ({ title, value, unit, previousValue, isBloodPressure }) => {
      let change, isIncrease;

      if (isBloodPressure) {
        const [currentSystolic] = value.split('/').map(Number);
        const [previousSystolic] = previousValue.split('/').map(Number);
        change = ((currentSystolic - previousSystolic) / previousSystolic * 100).toFixed(1);
        isIncrease = currentSystolic > previousSystolic;
      } else {
        change = calculateChange(value, previousValue);
        isIncrease = value > previousValue;
      }

      // Only show red if the current value is outside normal range
      const isCurrentAbnormal = isValueAbnormal(
        isBloodPressure ? value.split('/')[0] : value,
        title,
        userDetails?.gender
      );

      // Define darker colors for better visibility
      const colors = {
        good: {
          text: '#2E7D32', // darker green
          bg: 'rgba(46, 125, 50, 0.15)' // semi-transparent dark green
        },
        bad: {
          text: '#D32F2F', // darker red
          bg: 'rgba(211, 47, 47, 0.15)' // semi-transparent dark red
        },
        neutral: {
          text: '#1976D2', // blue
          bg: 'rgba(25, 118, 210, 0.15)' // semi-transparent blue
        }
      };

      // Determine color based on both change direction and abnormality
      const getChangeColors = () => {
        if (isCurrentAbnormal) {
          return colors.bad;
        }
        return colors.good;
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
                isCurrentAbnormal ? 'Current value is outside normal range.' : 'Value is within normal range.'
              }`}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: getChangeColors().text,
                  bgcolor: getChangeColors().bg,
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
        <Grid container spacing={3}>
          {/* Main metrics - always show these in the first row */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="BMI"
              value={latest.bmi}
              previousValue={previous.bmi}
              isBloodPressure={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Blood Pressure"
              value={`${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}`}
              previousValue={`${previous.blood_pressure_systolic}/${previous.blood_pressure_diastolic}`}
              isBloodPressure={true}
              unit="mmHg"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Blood Sugar"
              value={latest.blood_sugar}
              unit="mg/dL"
              previousValue={previous.blood_sugar}
              isBloodPressure={false}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Cholesterol"
              value={latest.cholesterol}
              unit="mg/dL"
              previousValue={previous.cholesterol}
              isBloodPressure={false}
            />
          </Grid>

          {/* Blood test parameters - show in second row if they exist */}
          {(latest.hemoglobin || latest.rbc || latest.wbc || latest.platelet_count) && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)', my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Blood Test Results
                </Typography>
              </Grid>

              {latest.hemoglobin && previous.hemoglobin && (
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Hemoglobin"
                    value={latest.hemoglobin}
                    unit="g/dL"
                    previousValue={previous.hemoglobin}
                    isBloodPressure={false}
                  />
                </Grid>
              )}
              {latest.rbc && previous.rbc && (
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="RBC Count"
                    value={latest.rbc}
                    unit="million/μL"
                    previousValue={previous.rbc}
                    isBloodPressure={false}
                  />
                </Grid>
              )}
              {latest.wbc && previous.wbc && (
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="WBC Count"
                    value={latest.wbc}
                    unit="per μL"
                    previousValue={previous.wbc}
                    isBloodPressure={false}
                  />
                </Grid>
              )}
              {latest.platelet_count && previous.platelet_count && (
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Platelet Count"
                    value={latest.platelet_count}
                    unit="per μL"
                    previousValue={previous.platelet_count}
                    isBloodPressure={false}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Paper>
    );
  };

  const handlePrintRecord = async (record) => {
    try {
      const userData = await getUserDetails();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Add header with logo and clinic info
      doc.setFillColor(33, 150, 243); // Primary blue color
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("MedTracker", pageWidth/2, 20, { align: 'center' });

      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      
      // Add lab info
      doc.setFontSize(10);
      doc.text([
        "123 Medical Center Drive",
        "Healthcare City, HC 12345",
        "Tel: (555) 123-4567",
        "Email: lab@medtracker.com"
      ], 15, 40);

      // Add report info box
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(245, 245, 245);
      doc.rect(pageWidth - 80, 35, 65, 30, 'FD');
      doc.text([
        "Report ID: " + record.id,
        "Date: " + new Date(record.created_at).toLocaleDateString(),
        "Time: " + new Date(record.created_at).toLocaleTimeString()
      ], pageWidth - 75, 42);

      // Patient Information section
      doc.setFillColor(240, 240, 240);
      doc.rect(15, 75, pageWidth - 30, 35, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Patient Information", 20, 85);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      
      const patientInfo = [
        `Name: ${userData.first_name} ${userData.middle_name || ''} ${userData.last_name}`,
        `Gender: ${userData.gender || 'Not specified'}`,
        `Date of Birth: ${new Date(userData.date_of_birth).toLocaleDateString()}`,
        `Age: ${calculateAge(userData.date_of_birth)} years`
      ];
      doc.text(patientInfo, 20, 95);

      // Test Results
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Test Results", 20, 125);
      doc.setFont(undefined, 'normal');

      // Create test results table
      const testResults = [
        ['Test', 'Result', 'Status', 'Reference Range'],
        ['Basic Measurements', '', '', ''],
        ['Height', `${record.height} cm`, '-', '-'],
        ['Weight', `${record.weight} kg`, '-', '-'],
        ['BMI', calculateBMI(record.height, record.weight), 
          getBMICategory(calculateBMI(record.height, record.weight), userData.date_of_birth).label,
          '18.5 - 24.9'],
        ['Vital Signs', '', '', ''],
        ['Blood Pressure', `${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg`,
          getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic, userData.date_of_birth).label,
          '< 120/80 mmHg'],
        ['Heart Rate', `${record.heart_rate} bpm`,
          getHeartRateCategory(record.heart_rate, userData.date_of_birth).label,
          '60 - 100 bpm'],
        ['Blood Chemistry', '', '', ''],
        ['Blood Sugar', `${record.blood_sugar} mg/dL`,
          getBloodSugarCategory(record.blood_sugar, userData.date_of_birth).label,
          '70 - 100 mg/dL (Fasting)'],
        ['Cholesterol', `${record.cholesterol} mg/dL`,
          getCholesterolCategory(record.cholesterol, userData.date_of_birth).label,
          '< 200 mg/dL'],
        ['Complete Blood Count', '', '', ''],
        record.hemoglobin ? ['Hemoglobin', `${record.hemoglobin} g/dL`,
          getHemoglobinCategory(record.hemoglobin, userData.gender).label,
          userData.gender === 'Male' ? '13.5 - 17.5 g/dL' : '12.0 - 15.5 g/dL'] : null,
        record.rbc ? ['RBC Count', `${record.rbc} million/μL`,
          getRBCCategory(record.rbc, userData.gender).label,
          userData.gender === 'Male' ? '4.5 - 5.9 million/μL' : '4.0 - 5.2 million/μL'] : null,
        record.wbc ? ['WBC Count', `${record.wbc.toLocaleString()} per μL`,
          getWBCCategory(record.wbc).label,
          '4,000 - 11,000 per μL'] : null,
        record.platelet_count ? ['Platelet Count', `${record.platelet_count.toLocaleString()} per μL`,
          getPlateletCategory(record.platelet_count).label,
          '150,000 - 450,000 per μL'] : null
      ].filter(Boolean);

      doc.autoTable({
        startY: 130,
        head: [testResults[0]],
        body: testResults.slice(1),
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 45 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' }
        },
        // Style for section headers
        rowStyles: row => {
          if (['Basic Measurements', 'Vital Signs', 'Blood Chemistry', 'Complete Blood Count'].includes(testResults[row + 1]?.[0])) {
            return {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: 'bold'
            };
          }
        }
      });

      // Add notes and disclaimer
      const finalY = doc.autoTable.previous.finalY + 20;
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.text("Notes and Interpretation:", 20, finalY);
      doc.setFont(undefined, 'normal');
      doc.text([
        "• Results should be interpreted in conjunction with clinical findings and other laboratory data.",
        "• Reference ranges may vary by laboratory and patient characteristics.",
        "• Values marked as abnormal should be reviewed by a healthcare provider."
      ], 25, finalY + 10);

      // Add footer
      doc.setFontSize(8);
      doc.text("Generated by MedTracker Laboratory System", 20, pageHeight - 20);
      doc.text(`Report generated on: ${new Date().toLocaleString()}`, pageWidth - 20, pageHeight - 20, { align: 'right' });
      doc.text("Page 1 of 1", pageWidth/2, pageHeight - 20, { align: 'center' });

      // Save the PDF
      doc.save(`lab_report_${new Date(record.created_at).toISOString().split('T')[0]}.pdf`);
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
                        handlePrintRecord(record);
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecord(record.id);
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
                            bgcolor: getBMICategory(record.bmi, userDetails?.date_of_birth).color + '20',
                            color: getBMICategory(record.bmi, userDetails?.date_of_birth).color,
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
                    {/* Basic Measurements */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'medium' }}>
                        Basic Measurements
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <HeightIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">Height</Typography>
                            </Box>
                            <Typography variant="h6">{record.height} cm</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Reference: Age-specific
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <ScaleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">Weight</Typography>
                            </Box>
                            <Typography variant="h6">{record.weight} kg</Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Reference: BMI dependent
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <MonitorHeartIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">BMI</Typography>
                            </Box>
                            <Typography variant="h6">{record.bmi}</Typography>
                            <Chip 
                              size="small"
                              label={getBMICategory(record.bmi, userDetails?.date_of_birth).label}
                              sx={{ 
                                mt: 1,
                                bgcolor: getBMICategory(record.bmi, userDetails?.date_of_birth).color + '20',
                                color: getBMICategory(record.bmi, userDetails?.date_of_birth).color
                              }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Vital Signs */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'medium' }}>
                        Vital Signs
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <FavoriteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">Blood Pressure</Typography>
                            </Box>
                            <Typography variant="h6">
                              {record.blood_pressure_systolic}/{record.blood_pressure_diastolic} mmHg
                            </Typography>
                            <Chip 
                              size="small"
                              label={getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).label}
                              sx={{ 
                                mt: 1,
                                bgcolor: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color + '20',
                                color: getBloodPressureCategory(record.blood_pressure_systolic, record.blood_pressure_diastolic).color
                              }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <MonitorHeartIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">Heart Rate</Typography>
                            </Box>
                            <Typography variant="h6">{record.heart_rate} bpm</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Blood Tests */}
                    {(record.hemoglobin || record.rbc || record.wbc || record.platelet_count) && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'medium' }}>
                          Blood Tests
                        </Typography>
                        <Grid container spacing={2}>
                          {record.hemoglobin && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BloodtypeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">Hemoglobin</Typography>
                                </Box>
                                <Typography variant="h6">{record.hemoglobin} g/dL</Typography>
                                <Chip 
                                  size="small"
                                  label={getHemoglobinCategory(record.hemoglobin, userDetails?.gender).label}
                                  sx={{ 
                                    mt: 1,
                                    bgcolor: getHemoglobinCategory(record.hemoglobin, userDetails?.gender).color + '20',
                                    color: getHemoglobinCategory(record.hemoglobin, userDetails?.gender).color
                                  }}
                                />
                              </Paper>
                            </Grid>
                          )}
                          {record.rbc && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BloodtypeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">RBC Count</Typography>
                                </Box>
                                <Typography variant="h6">{record.rbc} million/μL</Typography>
                                <Chip 
                                  size="small"
                                  label={getRBCCategory(record.rbc, userDetails?.gender).label}
                                  sx={{ 
                                    mt: 1,
                                    bgcolor: getRBCCategory(record.rbc, userDetails?.gender).color + '20',
                                    color: getRBCCategory(record.rbc, userDetails?.gender).color
                                  }}
                                />
                              </Paper>
                            </Grid>
                          )}
                          {record.wbc && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BloodtypeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">WBC Count</Typography>
                                </Box>
                                <Typography variant="h6">{record.wbc.toLocaleString()} per μL</Typography>
                                <Chip 
                                  size="small"
                                  label={getWBCCategory(record.wbc).label}
                                  sx={{ 
                                    mt: 1,
                                    bgcolor: getWBCCategory(record.wbc).color + '20',
                                    color: getWBCCategory(record.wbc).color
                                  }}
                                />
                              </Paper>
                            </Grid>
                          )}
                          {record.platelet_count && (
                            <Grid item xs={12} sm={6} md={3}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <BloodtypeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">Platelet Count</Typography>
                                </Box>
                                <Typography variant="h6">{record.platelet_count.toLocaleString()} per μL</Typography>
                                <Chip 
                                  size="small"
                                  label={getPlateletCategory(record.platelet_count).label}
                                  sx={{ 
                                    mt: 1,
                                    bgcolor: getPlateletCategory(record.platelet_count).color + '20',
                                    color: getPlateletCategory(record.platelet_count).color
                                  }}
                                />
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
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
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Hemoglobin (g/dL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={newHealthData.hemoglobin}
                onChange={(e) => setNewHealthData({...newHealthData, hemoglobin: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="RBC Count (million/μL)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={newHealthData.rbc}
                onChange={(e) => setNewHealthData({...newHealthData, rbc: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="WBC Count (per μL)"
                type="number"
                value={newHealthData.wbc}
                onChange={(e) => setNewHealthData({...newHealthData, wbc: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Platelet Count (per μL)"
                type="number"
                value={newHealthData.platelet_count}
                onChange={(e) => setNewHealthData({...newHealthData, platelet_count: e.target.value})}
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