import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import POSPage from './pages/POSPage';
import { apiService } from './services/api';

const theme = extendTheme({
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
        <Routes>
          <Route path="/" element={<Navigate to="/pos" replace />} />
          <Route path="/home" element={<Home count={count} setCount={setCount} />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
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

function AdminPage() {
  const [jsonData, setJsonData] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const handleTestApi = async () => {
    try {
      setIsLoading(true);
      setMessage('Testing API connection...');
      const response = await fetch('https://api-2ya6yhttpq-uc.a.run.app/test');
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
      setMessage('API test successful');
    } catch (error) {
      setMessage(`API test error: ${error instanceof Error ? error.message : String(error)}`);
      setTestResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPost = async () => {
    try {
      setIsLoading(true);
      setMessage('Testing POST request...');
      
      const testData = {
        name: 'Test Item',
        price: 9.99,
        description: 'A test item'
      };
      
      const response = await fetch('https://api-2ya6yhttpq-uc.a.run.app/test-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
      setMessage('POST test successful');
    } catch (error) {
      setMessage(`POST test error: ${error instanceof Error ? error.message : String(error)}`);
      setTestResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectUploadTest = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Testing direct file upload...');
      
      // Create FormData and append the file with the key 'file'
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      // Log the FormData entries
      for (const pair of formData.entries()) {
        console.log(`FormData entry: ${pair[0]}, ${pair[1] instanceof File ? 'File object' : pair[1]}`);
      }
      
      // Send the request to the simpler endpoint
      const response = await fetch('https://api-2ya6yhttpq-uc.a.run.app/simple-upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
      setMessage('Direct upload test completed successfully');
    } catch (error) {
      setMessage(`Upload test error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jsonData) {
      setMessage('Please provide JSON data for the item');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      console.log("jsonData", jsonData);
      
      // Step 1: Create the item with JSON data
      const itemResult = await apiService.createItem(jsonData);
      
      if (!itemResult.success) {
        throw new Error(itemResult.error || 'Failed to create item');
      }
      
      // Get the item ID from the response
      const itemId = itemResult.data?.id;
      
      if (!itemId) {
        throw new Error('No item ID returned from the server');
      }
      
      // Step 2: Upload the image if one was provided
      if (file) {
        console.log("file", file);
        console.log("Uploading image for item ID:", itemId);
        
        // Use the base64 upload method instead of the multipart form upload
        const imageResult = await apiService.uploadItemImageBase64(itemId.toString(), file);
        
        if (!imageResult.success) {
          throw new Error(imageResult.error || 'Item created but failed to upload image');
        }
        
        setMessage('Item created successfully with image!');
      } else {
        setMessage('Item created successfully without image!');
      }
      
      setJsonData('');
      setFile(null);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Admin Page</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleTestApi}
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Test API Connection
        </button>
        
        <button 
          onClick={handleTestPost}
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          Test POST Request
        </button>
        
        <button 
          onClick={handleDirectUploadTest}
          disabled={isLoading || !file}
          style={{
            padding: '10px 15px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || !file) ? 'not-allowed' : 'pointer'
          }}
        >
          Test Direct File Upload
        </button>
      </div>
      
      {testResponse && (
        <div style={{ 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          {testResponse}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="jsonData" style={{ display: 'block', marginBottom: '5px' }}>
            Item JSON Data:
          </label>
          <textarea 
            id="jsonData"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            style={{ 
              width: '100%', 
              height: '150px', 
              padding: '8px',
              fontFamily: 'monospace'
            }}
            placeholder='{"name": "Item Name", "price": 9.99, "category": "Category"}'
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="imageUpload" style={{ display: 'block', marginBottom: '5px' }}>
            Item Image:
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            style={{ display: 'block' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
      
      {message && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App