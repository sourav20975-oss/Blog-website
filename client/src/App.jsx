import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import CommandPalette from './components/CommandPalette';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import PdfLibrary from './pages/PdfLibrary';
import SavedLibrary from './pages/SavedLibrary';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HandbookReader from './pages/HandbookReader';

export default function App() {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setCommandOpen(true);
    window.addEventListener('bv:open-command-palette', handleOpen);
    return () => window.removeEventListener('bv:open-command-palette', handleOpen);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-surface text-zinc-900 antialiased dark:text-zinc-100">
        <Navbar onOpenCommand={() => setCommandOpen(true)} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogpost/:slug" element={<BlogPost />} />
            <Route path="/pdfs" element={<PdfLibrary />} />
            <Route path="/handbook/:id" element={<HandbookReader />} />
            <Route path="/saved" element={<SavedLibrary />} />
            <Route
              path="/create"
              element={
                <RequireAdmin>
                  <CreatePost />
                </RequireAdmin>
              }
            />
            <Route
              path="/edit/:slug"
              element={
                <RequireAdmin>
                  <EditPost />
                </RequireAdmin>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
        <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      </div>
    </BrowserRouter>
  );
}
