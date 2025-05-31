import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Mock data - Replace with Firestore fetch
  useEffect(() => {
    setCustomers([
      {
        id: 1,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        status: 'Active',
        type: 'Enterprise',
        lastContact: '2025-05-30',
        deals: 3,
        value: 50000
      },
      // Add more mock data...
    ]);
  }, []);

  const handleActionClick = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/dashboard">
          Dashboard
        </Link>
        <Typography color="text.primary">Customers</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Customers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your customer relationships and track interactions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ height: 'fit-content' }}
        >
          Add Customer
        </Button>
      </Box>

      {/* Filters and Search */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ mb: 4 }}
        alignItems="center"
      >
        <TextField
          placeholder="Search customers..."
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          startIcon={<FilterListIcon />}
          variant="outlined"
          size="medium"
        >
          Filters
        </Button>
      </Stack>

      {/* Active Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1}>
          <Chip label="Status: Active" onDelete={() => {}} />
          <Chip label="Type: Enterprise" onDelete={() => {}} />
        </Stack>
      </Box>

      {/* Customer Table */}
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Last Contact</TableCell>
              <TableCell>Deals</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={customer.status} 
                    color={customer.status === 'Active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{customer.type}</TableCell>
                <TableCell>{customer.lastContact}</TableCell>
                <TableCell>{customer.deals}</TableCell>
                <TableCell align="right">
                  ${customer.value.toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionClick(e, customer)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleActionClose}>View Details</MenuItem>
        <MenuItem onClick={handleActionClose}>Edit</MenuItem>
        <MenuItem onClick={handleActionClose}>Delete</MenuItem>
      </Menu>
    </Box>
  );
}
