import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import Home from './pages/Home';
import BlogPost from './pages/BlogPost';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blogpost/:slug" element={<BlogPost />} />
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
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
