// // /client/src/App.jsx

// import { Routes, Route, Link } from 'react-router-dom';
// import RegisterPage from './pages/RegisterPage';
// import LoginPage from './pages/LoginPage';
// import DashboardPage from './pages/DashboardPage';
// import StudioRoomPage from './pages/StudioRoomPage';
// import { useAuth } from './context/AuthContext';

// function App() {
//   const { user, logout } = useAuth();

//   return (
//     <div>
//       <nav>
//         {user ? (
//           <>
//             <span>Hello, {user.name}</span>
//             <button onClick={logout}>Logout</button>
//           </>
//         ) : (
//           <>
//             <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
//           </>
//         )}
//       </nav>
//       <hr />
//       <Routes>
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/dashboard" element={<DashboardPage />} />
//         {/* You can add a home route later */}
//         <Route path="/studio/:roomId" element={<StudioRoomPage />} /> 
//         <Route path="/" element={user ? <DashboardPage /> : <LoginPage />} />
//       </Routes>
//     </div>
//   );
// }

// export default App;

import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudioRoomPage from './pages/StudioRoomPage';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <nav className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="shrink-0 flex items-center text-xl font-bold text-white">
                Riverside Clone
              </Link>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300">Hello, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link to="/login" className="text-gray-300 hover:text-white">Sign In</Link>
                  <Link to="/register" className="px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/studio/:roomId" element={<StudioRoomPage />} />
            <Route path="/" element={user ? <DashboardPage /> : <LandingPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
