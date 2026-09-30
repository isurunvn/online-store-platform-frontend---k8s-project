import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid } from '@mui/material';
import { userService } from '../api/services/userService';
import { User, Address } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: '', city: '', state: '', postalCode: '', country: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = await userService.getMe();
      const addressData = await userService.getAddresses();
      setUser(userData);
      setFormData(userData);
      setAddresses(addressData);
    } catch (err) {
      setError('Failed to fetch profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await userService.updateMe(formData);
      setUser(updated);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.addAddress(newAddress as Address);
      setNewAddress({ street: '', city: '', state: '', postalCode: '', country: '' });
      const addressData = await userService.getAddresses();
      setAddresses(addressData);
    } catch (err) {
      setError('Failed to add address');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return <ErrorAlert message="User data not found" />;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      {error && <ErrorAlert message={error} />}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Personal Information</Typography>
              <Button onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Box>
            
            <form onSubmit={handleUserUpdate}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="First Name" 
                    value={formData.firstName || ''} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Last Name" 
                    value={formData.lastName || ''} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    value={formData.email || ''} 
                    disabled 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Phone" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    disabled={!editMode}
                  />
                </Grid>
                {editMode && (
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                      Save Changes
                    </Button>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Saved Addresses</Typography>
            {addresses.length === 0 ? (
              <Typography color="text.secondary">No addresses saved.</Typography>
            ) : (
              addresses.map((address, idx) => (
                <Box key={address.id || idx} mb={2} p={2} border="1px solid #e0e0e0" borderRadius={1}>
                  <Typography>{address.street}</Typography>
                  <Typography>{address.city}, {address.state} {address.postalCode}</Typography>
                  <Typography>{address.country}</Typography>
                </Box>
              ))
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Add New Address</Typography>
            <form onSubmit={handleAddAddress}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth required size="small" label="Street" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth required size="small" label="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth required size="small" label="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth required size="small" label="Postal Code" value={newAddress.postalCode} onChange={e => setNewAddress({...newAddress, postalCode: e.target.value})} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth required size="small" label="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained">Add Address</Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
