import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DataProvider } from './contexts/FakeDataContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { Whiteboard } from './pages/Whiteboard';
import { RecipeCards } from './pages/RecipeCards';
import { Files } from './pages/Files';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/whiteboard" element={<Whiteboard />} />
              <Route path="/recipe-cards" element={<RecipeCards />} />
              <Route path="/files" element={<Files />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
