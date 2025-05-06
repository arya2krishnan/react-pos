import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Input from '@mui/joy/Input';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [open, setOpen] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear authentication status when component mounts
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setOpen(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ilovecafegough') {
      sessionStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      setOpen(false);
      setError('');
    } else {
      setError('Incorrect password');
      setTimeout(() => {
        setOpen(false);
        navigate('/pos');
      }, 1500); // Show error message for 1.5 seconds before redirecting
    }
  };

  if (isAuthenticated) {
    return <>{element}</>;
  }

  return (
    <>
      <Modal open={open} onClose={() => {}}>
        <ModalDialog>
          <Typography level="h4">Protected Page</Typography>
          <Typography level="body-md" mb={2}>
            Please enter the password to access this page
          </Typography>
          {error && (
            <Typography color="danger" mb={2}>
              {error}
            </Typography>
          )}
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" fullWidth>
                  Unlock
                </Button>
                <Button
                  variant="outlined"
                  color="neutral"
                  fullWidth
                  onClick={() => {
                    setOpen(false);
                    navigate('/pos');
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </form>
        </ModalDialog>
      </Modal>
      {!open && <Navigate to="/pos" />}
    </>
  );
};

export default ProtectedRoute; 