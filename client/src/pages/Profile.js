import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Paper, Grid, TextField, Button, 
  Alert, Snackbar, MenuItem, Box, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { getUserProfile, updateUserProfile, updatePassword, deleteUser } from '../services/api';
import { calculateAge } from '../utils/dateUtils';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    address: '',
    gender: '',
    date_of_birth: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    hasCapital: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
    matches: false
  });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setFormData({
        first_name: userData.first_name || '',
        middle_name: userData.middle_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        address: userData.address || '',
        gender: userData.gender || '',
        date_of_birth: userData.date_of_birth ? userData.date_of_birth.split('T')[0] : ''
      });
    } catch (error) {
      showSnackbar('Error fetching profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      showSnackbar('Profile updated successfully', 'success');
      
      // Update local storage user data
      const user = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...user,
        first_name: formData.first_name,
        last_name: formData.last_name
      }));
      
      // Dispatch auth change event to update navbar
      window.dispatchEvent(new Event('authStateChanged'));
    } catch (error) {
      showSnackbar(error.message || 'Error updating profile', 'error');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Password validation regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least 1 capital letter, 1 number, and 1 special character');
      return;
    }

    try {
      await updatePassword(passwordData);
      showSnackbar('Password updated successfully');
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.message || 'Error updating password');
    }
  };

  const validatePassword = (password, confirmPassword) => {
    setPasswordValidation({
      hasCapital: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
      hasMinLength: password.length >= 8,
      matches: password === confirmPassword
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      showSnackbar('Error deactivating account', 'error');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ my: 4 }}>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middle_name}
                onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                disabled
                value={formData.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                value={calculateAge(formData.date_of_birth) || ''}
                disabled
                helperText="Age is calculated automatically from date of birth"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                value={formData.gender || ''}
                disabled
                helperText="Gender cannot be changed"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Update Profile
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          sx={{ mb: 2 }}
        >
          {showPasswordChange ? 'Cancel Password Change' : 'Change Password'}
        </Button>

        {showPasswordChange && (
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={handlePasswordChange}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      const newPass = e.target.value;
                      setPasswordData(prev => ({
                        ...prev,
                        newPassword: newPass
                      }));
                      validatePassword(newPass, passwordData.confirmPassword);
                    }}
                    error={!!passwordError}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      Password requirements:
                    </Typography>
                    <Box sx={{ ml: 1 }}>
                      <Typography 
                        variant="caption" 
                        color={passwordValidation.hasMinLength ? 'success.main' : 'text.secondary'}
                        sx={{ display: 'block' }}
                      >
                        {passwordValidation.hasMinLength ? '✓' : '○'} At least 8 characters
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={passwordValidation.hasCapital ? 'success.main' : 'text.secondary'}
                        sx={{ display: 'block' }}
                      >
                        {passwordValidation.hasCapital ? '✓' : '○'} One capital letter
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={passwordValidation.hasNumber ? 'success.main' : 'text.secondary'}
                        sx={{ display: 'block' }}
                      >
                        {passwordValidation.hasNumber ? '✓' : '○'} One number
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={passwordValidation.hasSpecial ? 'success.main' : 'text.secondary'}
                        sx={{ display: 'block' }}
                      >
                        {passwordValidation.hasSpecial ? '✓' : '○'} One special character (!@#$%^&*)
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      const confirmPass = e.target.value;
                      setPasswordData(prev => ({
                        ...prev,
                        confirmPassword: confirmPass
                      }));
                      validatePassword(passwordData.newPassword, confirmPass);
                    }}
                    error={!!passwordError || (passwordData.confirmPassword && !passwordValidation.matches)}
                    helperText={passwordError || (passwordData.confirmPassword && !passwordValidation.matches ? 'Passwords do not match' : '')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!Object.values(passwordValidation).every(Boolean)}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Danger Zone
        </Typography>
        <Paper sx={{ p: 3, bgcolor: '#fdeded' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                Delete Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Account
            </Button>
          </Box>
        </Paper>

        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            Delete Account?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete your account? This action cannot be undone and you will lose access to:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <Typography component="li">All your health records</Typography>
              <Typography component="li">Your profile information</Typography>
              <Typography component="li">Access to the MedTracker system</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

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

export default Profile; 