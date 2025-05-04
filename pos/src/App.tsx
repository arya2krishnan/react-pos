import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
              <Home count={count} setCount={setCount} />
          </ThemeProvider>
            } />
        <Route path="/pos" element={
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
              <POS />
          </ThemeProvider>
          } />
        <Route path="/dashboard" element={
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
              <Dashboard />
          </ThemeProvider>
          } />
      </Routes>
    </Router>
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

function POS() {
  return <h2>POS System</h2>
}

function Dashboard() {
  return <h2>Dashboard</h2>
}

export default App