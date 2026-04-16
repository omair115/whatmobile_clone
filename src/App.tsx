import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from '@/src/components/Navbar';
import { Footer } from '@/src/components/Footer';
import { Home } from '@/src/pages/Home';
import { PhoneDetail } from '@/src/pages/PhoneDetail';
import { Admin } from '@/src/pages/Admin';
import { Search } from '@/src/pages/Search';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans antialiased">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/phone/:slug" element={<PhoneDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/search" element={<Search />} />
              {/* Add more routes as needed */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}
