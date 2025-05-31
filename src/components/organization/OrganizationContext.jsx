import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useOrganization } from '../../contexts/OrganizationContext';

function TabPanel({ children, value, index }) {
  return (
    <Box hidden={value !== index} sx={{ p: 3 }}>
      {value === index && children}
    </Box>
  );
}

export default function OrganizationSettings() {
  const { 
    organization,
    members,
    ROLES,
    updateOrganization,
    inviteMember,
    updateMemberRole
  } = useOrganization();

  const [activeTab, setActiveTab] = useState(0);
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      await updateOrganization({ name: orgName });
      setSuccess('Organization updated successfully');
    } catch (error) {
      setError('Failed to update organization');
    }
  };

  const handleInvite = async () => {
    try {
      await inviteMember(inviteEmail, inviteRole);
      setSuccess('Invitation sent successfully');
      setInviteEmail('');
      setOpenInviteDialog(false);
    } catch (error) {
      setError('Failed to send invitation');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Organization Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
        >
          <Tab label="General" />
          <Tab label="Members" />
          <Tab label="Security" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Box component="form" onSubmit={handleUpdateOrg}>
            <TextField
              label="Organization Name"
              fullWidth
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenInviteDialog(true)}
            >
              Invite Member
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.uid}>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.uid, e.target.value)}
                      >
                        {Object.keys(ROLES).map((role) => (
                          <MenuItem key={role} value={role}>
                            {ROLES[role].name}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(member.joinedAt.seconds * 1000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Security settings will go here */}
          <Typography>Security settings coming soon...</Typography>
        </TabPanel>
      </Paper>

      {/* Invite Member Dialog */}
      <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)}>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Select
            fullWidth
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            sx={{ mt: 2 }}
          >
            {Object.keys(ROLES).map((role) => (
              <MenuItem key={role} value={role}>
                {ROLES[role].name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInviteDialog(false)}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained">
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
