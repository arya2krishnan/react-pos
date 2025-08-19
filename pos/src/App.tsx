import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { Box, Typography } from '@mui/joy';
import POSPage from './pages/POSPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const theme = extendTheme({
  fontFamily: {
    display: '"Varela Round", sans-serif',
    body: '"Varela Round", sans-serif',
  },
  colorSchemes: {
    dark: {
      palette: {
        // dark theme settings
      },
    },
  },
});

function App() {
  const [count, setCount] = useState(0)

  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/pos" replace />} />
              <Route path="/home" element={<Home count={count} setCount={setCount} />} />
              <Route path="/pos" element={<POSPage />} />
              <Route path="/orders" element={<ProtectedRoute element={<OrdersPage />} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} />} />
            </Routes>
          </Box>
          
          {/* Copyright Footer */}
          <Box 
            sx={{ 
              mt: 'auto',
              pt: 2, 
              pb: 2,
              textAlign: 'left',
              backgroundColor: 'background.surface'
            }}
          >
            <Typography level="body-sm" color="neutral">
              © Arya Krishnan
            </Typography>
          </Box>
        </Box>
      </Router>
    </CssVarsProvider>
  )
}

interface HomeProps {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
}

function Home({ count, setCount }: HomeProps) {
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

function Dashboard() {
  return <h2>Dashboard</h2>
}

export default App