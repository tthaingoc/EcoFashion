import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Home,
  LocationOn,
  CheckCircle
} from '@mui/icons-material';
import { userAddressService, UserAddress, AddressFormData } from '../../services/api/userAddressService';

interface Props {
  onAddressSelect: (address: UserAddress) => void;
  selectedAddressId?: number;
  showTitle?: boolean;
}

const defaultFormData: AddressFormData = {
  addressLine: '',
  city: '',
  district: '',
  zipCode: '',
  country: 'Vietnam',
  isDefault: false
};

export default function AddressSelector({ onAddressSelect, selectedAddressId, showTitle = true }: Props) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>(selectedAddressId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      setSelectedId(selectedAddressId);
    }
  }, [selectedAddressId, addresses]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userAddressService.getAll();
      setAddresses(data);

      // If no address is selected but there are addresses, select the default one
      if (!selectedId && data.length > 0) {
        const defaultAddr = data.find(addr => addr.isDefault) || data[0];
        setSelectedId(defaultAddr.addressId);
        onAddressSelect(defaultAddr);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (addressId: number) => {
    const address = addresses.find(addr => addr.addressId === addressId);
    if (address) {
      setSelectedId(addressId);
      onAddressSelect(address);
    }
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData(defaultFormData);
    setFormErrors([]);
    setDialogOpen(true);
  };

  const openEditDialog = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      addressLine: address.addressLine || '',
      city: address.city || '',
      district: address.district || '',
      zipCode: address.zipCode || '',
      country: address.country || 'Vietnam',
      isDefault: address.isDefault
    });
    setFormErrors([]);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAddress(null);
    setFormData(defaultFormData);
    setFormErrors([]);
  };

  const handleFormChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const errors = userAddressService.validateAddress(formData);
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      let savedAddress: UserAddress;

      if (editingAddress) {
        savedAddress = await userAddressService.update(editingAddress.addressId, formData);
      } else {
        savedAddress = await userAddressService.create(formData);
      }

      await loadAddresses();
      
      // Select the newly created/updated address
      setSelectedId(savedAddress.addressId);
      onAddressSelect(savedAddress);
      
      closeDialog();
    } catch (err: any) {
      setFormErrors([err?.message || 'Có lỗi xảy ra khi lưu địa chỉ']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (address: UserAddress) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;

    try {
      await userAddressService.delete(address.addressId);
      await loadAddresses();
      
      // If deleted address was selected, select another one
      if (selectedId === address.addressId) {
        const remaining = addresses.filter(a => a.addressId !== address.addressId);
        if (remaining.length > 0) {
          const newSelected = remaining.find(a => a.isDefault) || remaining[0];
          setSelectedId(newSelected.addressId);
          onAddressSelect(newSelected);
        } else {
          setSelectedId(undefined);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefault = async (address: UserAddress) => {
    try {
      await userAddressService.setDefault(address.addressId);
      await loadAddresses();
    } catch (err: any) {
      setError(err?.message || 'Không thể đặt làm địa chỉ mặc định');
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ color: '#16a34a' }} />
          <Typography variant="body2" sx={{ mt: 2, color: '#6b7280' }}>
            Đang tải địa chỉ...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
      <CardContent sx={{ p: 3 }}>
        {showTitle && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: '#16a34a' }} />
              Chọn địa chỉ giao hàng
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={openAddDialog}
              sx={{ color: '#16a34a', borderColor: '#16a34a' }}
            >
              Thêm địa chỉ
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {addresses.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Home sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
              Bạn chưa có địa chỉ giao hàng nào
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddDialog}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
            >
              Thêm địa chỉ đầu tiên
            </Button>
          </Box>
        ) : (
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={selectedId || ''}
              onChange={(e) => handleAddressChange(parseInt(e.target.value))}
            >
              {addresses.map((address) => (
                <Box key={address.addressId} sx={{ mb: 2 }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      border: selectedId === address.addressId ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      bgcolor: selectedId === address.addressId ? '#f0f9ff' : 'white'
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <FormControlLabel
                          value={address.addressId}
                          control={<Radio sx={{ color: '#16a34a', '&.Mui-checked': { color: '#16a34a' } }} />}
                          label=""
                          sx={{ m: 0 }}
                        />
                        
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {userAddressService.formatAddress(address)}
                            </Typography>
                            {address.isDefault && (
                              <Chip
                                label="Mặc định"
                                size="small"
                                icon={<CheckCircle />}
                                sx={{ bgcolor: '#dcfce7', color: '#16a34a' }}
                              />
                            )}
                          </Box>
                          
                          {!address.isDefault && (
                            <Button
                              size="small"
                              onClick={() => handleSetDefault(address)}
                              sx={{ color: '#6b7280', p: 0, minWidth: 'auto', mr: 2 }}
                            >
                              Đặt làm mặc định
                            </Button>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditDialog(address)}
                            sx={{ color: '#2563eb' }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(address)}
                            sx={{ color: '#dc2626' }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </RadioGroup>
          </FormControl>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        </DialogTitle>
        <DialogContent>
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ cụ thể *"
                value={formData.addressLine}
                onChange={(e) => handleFormChange('addressLine', e.target.value)}
                placeholder="Số nhà, tên đường..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quận/Huyện *"
                value={formData.district}
                onChange={(e) => handleFormChange('district', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thành phố *"
                value={formData.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã bưu điện"
                value={formData.zipCode}
                onChange={(e) => handleFormChange('zipCode', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quốc gia"
                value={formData.country}
                onChange={(e) => handleFormChange('country', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Radio
                    checked={formData.isDefault}
                    onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                    sx={{ color: '#16a34a', '&.Mui-checked': { color: '#16a34a' } }}
                  />
                }
                label="Đặt làm địa chỉ mặc định"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={closeDialog} sx={{ color: '#6b7280' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}