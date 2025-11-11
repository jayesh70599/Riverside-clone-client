// // /client/src/pages/DashboardPage.jsx

// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import studioService from '../services/studioService';
// import recordingService from '../services/recordingService'; // Import the new service

// // A new component to manage each studio and its recordings
// const StudioItem = ({ studio, token }) => {
//   const [recordings, setRecordings] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//    // New handler for the download button
//   const handleDownload = async (fileName) => {
//     try {
//       const { downloadUrl } = await recordingService.getDownloadUrl(fileName, token);
//       // Triggering the download by opening the URL.
//       // The browser will handle the download because the URL points to a file.
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error("Failed to get download link", error);
//       alert("Could not get download link.");
//     }
//   };

//   const handleToggle = async () => {
//     setIsOpen(!isOpen);
//     if (!isOpen && recordings.length === 0) {
//       setIsLoading(true);
//       try {
//         const data = await recordingService.getRecordings(studio.uniqueRoomId, token);
//         setRecordings(data);
//       } catch (error) {
//         console.error("Failed to fetch recordings", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <li style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
//       <div onClick={handleToggle} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
//         <strong>{studio.title}</strong>
//         <span>{isOpen ? '▲' : '▼'}</span>
//       </div>
//       <Link to={`/studio/${studio.uniqueRoomId}`}>Enter Studio</Link>

      
//       {isOpen && (
//         <div style={{ marginTop: '10px' }}>
//           {isLoading && <p>Loading recordings...</p>}
//           {!isLoading && recordings.length === 0 && <p>No recordings found for this studio.</p>}
//           {!isLoading && recordings.length > 0 && (
//             <ul>
//               {recordings.map(rec => (
//                 <li key={rec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <span>
//                     {rec.filePath} (Recorded by: {rec.user.name})
//                   </span>
//                   {/* --- NEW DOWNLOAD BUTTON --- */}
//                   <button onClick={() => handleDownload(rec.filePath)} style={{ marginLeft: '10px' }}>
//                     Download
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </li>
//   );
// };


// const DashboardPage = () => {
//   const { user } = useAuth();
//   const [studios, setStudios] = useState([]);
//   const [title, setTitle] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // ... (This useEffect to fetch studios is the same as before)
//     if (user) {
//       studioService.getStudios(user.token)
//         .then(data => setStudios(data))
//         .catch(err => console.error(err))
//         .finally(() => setLoading(false));
//     }
//   }, [user]);

//   const handleCreateStudio = async (e) => {
//     // ... (This handler is the same as before)
//     e.preventDefault();
//     if (!title) return;
//     try {
//       const newStudio = await studioService.createStudio({ title }, user.token);
//       setStudios([newStudio, ...studios]);
//       setTitle('');
//     } catch (error) {
//       console.error('Failed to create studio:', error);
//     }
//   };

//   if (loading) {
//     return <p>Loading studios...</p>;
//   }

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Welcome, {user ? user.name : 'Guest'}!</p>

//       <section>
//         <h3>Create a New Studio</h3>
//         <form onSubmit={handleCreateStudio}>
//           <input
//             type="text"
//             placeholder="Studio Title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//           />
//           <button type="submit">Create Studio</button>
//         </form>
//       </section>

//       <section>
//         <h3>Your Studios</h3>
//         {studios.length > 0 ? (
//           <ul style={{ listStyle: 'none', padding: 0 }}>
//             {studios.map((studio) => (
//               <StudioItem key={studio._id} studio={studio} token={user.token} />
//             ))}
//           </ul>
//         ) : (
//           <p>You haven't created any studios yet.</p>
//         )}
//       </section>
//     </div>
//   );
// };

// export default DashboardPage;

// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import studioService from '../services/studioService';
// import recordingService from '../services/recordingService';
// import sessionService from '../services/sessionService';

// // Component to display sessions and their combined video
// const SessionItem = ({ session, token }) => {
//   const handleDownloadCombined = async (filePath) => {
//     if (!filePath) {
//       alert("Combined video is still processing or failed.");
//       return;
//     }
//     try {
//       const { downloadUrl } = await recordingService.getDownloadUrl(filePath, token);
//       console.log(downloadUrl);
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error("Failed to get download link", error);
//     }
//   };

//   return (
//     <div style={{ padding: '5px 0', display: 'flex', justifyContent: 'space-between' }}>
//       <span>Session from: {new Date(session.createdAt).toLocaleString()}</span>
//       <button onClick={() => handleDownloadCombined(session.combinedVideoPath)} disabled={!session.combinedVideoPath}>
//         {session.combinedVideoPath ? 'Download Combined' : 'Processing...'}
//       </button>
//     </div>
//   );
// };

// // Component to manage each studio
// const StudioItem = ({ studio, token }) => {
//   const [recordings, setRecordings] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const handleToggle = async () => {
//     const nextIsOpen = !isOpen;
//     setIsOpen(nextIsOpen);
//     // Fetch data only when opening for the first time
//     if (nextIsOpen && recordings.length === 0) {
//       setIsLoading(true);
//       try {
//         const recs = recordingService.getRecordings(studio.uniqueRoomId, token);
//         const sess = sessionService.getSessionsByStudio(studio._id, token);
//         const [recordingsData, sessionsData] = await Promise.all([recs, sess]);
//         setRecordings(recordingsData);
//         setSessions(sessionsData);
//       } catch (error) {
//         console.error("Failed to fetch studio data", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleDownload = async (filePath) => {
//     if (!filePath) {
//       alert("Video is still processing or the path is missing.");
//       return;
//     }
//     try {
//       const { downloadUrl } = await recordingService.getDownloadUrl(filePath, token);
//       window.open(downloadUrl, '_blank');
//     } catch (error) {
//       console.error("Failed to get download link", error);
//     }
//   };

//   return (
//     <li style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
//       <div onClick={handleToggle} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
//         <strong>{studio.title}</strong>
//         <span>{isOpen ? '▲' : '▼'}</span>
//       </div>
//       <Link to={`/studio/${studio.uniqueRoomId}`}>Enter Studio</Link>
      
//       {isOpen && (
//         <div style={{ marginTop: '10px' }}>
//           {isLoading && <p>Loading details...</p>}
//           {!isLoading && (
//             <>
//               <div style={{ marginBottom: '10px' }}>
//                 <strong>Combined Videos:</strong>
//                 {sessions.length > 0 ? (
//                   sessions.map(session => <SessionItem key={session._id} session={session} token={token} />)
//                 ) : <p>No recording sessions found.</p>}
//               </div>
//               <div>
//                 <strong>Individual Recordings:</strong>
//                 {recordings.length > 0 ? (
//                    <ul style={{ paddingLeft: '20px' }}>
//                      {recordings.map(rec => (
//                        <li key={rec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
//                          <span>{rec.filePath}</span>
//                          <button onClick={() => handleDownload(rec.filePath)}>
//                            Download
//                          </button>
//                        </li>
//                      ))}
//                    </ul>
//                 ) : <p>No individual recordings found.</p>}
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </li>
//   );
// };


// const DashboardPage = () => {
//   const { user } = useAuth();
//   const [studios, setStudios] = useState([]);
//   const [title, setTitle] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (user) {
//       studioService.getStudios(user.token)
//         .then(data => setStudios(data))
//         .catch(err => console.error(err))
//         .finally(() => setLoading(false));
//     }
//   }, [user]);

//   const handleCreateStudio = async (e) => {
//     e.preventDefault();
//     if (!title) return;
//     try {
//       const newStudio = await studioService.createStudio({ title }, user.token);
//       setStudios([newStudio, ...studios]);
//       setTitle('');
//     } catch (error) {
//       console.error('Failed to create studio:', error);
//     }
//   };

//   if (loading) return <p>Loading studios...</p>;

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Welcome, {user ? user.name : 'Guest'}!</p>

//       <section>
//         <h3>Create a New Studio</h3>
//         <form onSubmit={handleCreateStudio}>
//           <input type="text" placeholder="Studio Title" value={title} onChange={(e) => setTitle(e.target.value)} />
//           <button type="submit">Create Studio</button>
//         </form>
//       </section>

//       <section>
//         <h3>Your Studios</h3>
//         {studios.length > 0 ? (
//           <ul style={{ listStyle: 'none', padding: 0 }}>
//             {studios.map((studio) => (
//               <StudioItem key={studio._id} studio={studio} token={user.token} />
//             ))}
//           </ul>
//         ) : (
//           <p>You haven't created any studios yet.</p>
//         )}
//       </section>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import studioService from '../services/studioService';
import recordingService from '../services/recordingService';
import sessionService from '../services/sessionService';
import { useNavigate } from 'react-router-dom';

// This component now has the 'Download Combined' button inside its collapsible area
const SessionItem = ({ session, token }) => {
  const [recordings, setRecordings] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && recordings.length === 0) {
      setIsLoading(true);
      try {
        const data = await recordingService.getRecordingsBySession(session._id, token);
        setRecordings(data);
      } catch (error) {
        console.error("Failed to fetch recordings for session", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async (filePath) => {
    if (!filePath) return;
    try {
      const { downloadUrl } = await recordingService.getDownloadUrl(filePath, token);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error("Failed to get download link", error);
    }
  };

  return (
    <div className="bg-gray-700 p-3 rounded-md">
      <div onClick={handleToggle} className="cursor-pointer flex justify-between items-center">
        <span className="font-semibold text-gray-200">
          Session from: {new Date(session.createdAt).toLocaleString()}
        </span>
        <span className="text-xl text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="mt-2 pt-2 border-t border-gray-600 space-y-3">
          {isLoading ? <p className="text-sm text-gray-400">Loading tracks...</p> : (
            <>
              {/* --- THIS IS THE CHANGE --- */}
              {/* The "Download Combined" button is now here */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-300 text-sm">Combined Video:</span>
                <button
                  onClick={() => handleDownload(session.combinedVideoPath)}
                  disabled={!session.combinedVideoPath}
                  className="px-3 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500"
                >
                  {session.combinedVideoPath ? 'Download Combined' : 'Processing...'}
                </button>
              </div>

              <div>
                <h6 className="font-medium text-gray-300 text-sm mb-1">Individual Tracks:</h6>
                <ul className="space-y-1">
                  {recordings.length > 0 ? (
                    recordings.map(rec => (
                        <li key={rec._id} className="pl-2 flex justify-between items-center">
                        <span className="text-xs text-gray-400 truncate" title={rec.filePath}>{rec.filePath}</span>
                        <button onClick={() => handleDownload(rec.filePath)} className="ml-2 flex-shrink-0 px-2 py-0.5 text-xs rounded-md text-white bg-gray-600 hover:bg-gray-500">
                            Download
                        </button>
                        </li>
                    ))
                  ) : <p className="text-xs text-gray-500 pl-2">No individual tracks found for this session.</p>}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// This component now only fetches and displays sessions for the studio
const StudioItem = ({ studio, token }) => {
  const [sessions, setSessions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);
    if (nextIsOpen && sessions.length === 0) {
      setIsLoading(true);
      try {
        const sessionsData = await sessionService.getSessionsByStudio(studio._id, token);
        setSessions(sessionsData);
      } catch (error) {
        console.error("Failed to fetch studio sessions", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div onClick={handleToggle} className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-700">
        <div>
          <h4 className="font-bold text-lg text-white">{studio.title}</h4>
          <p className="text-sm text-gray-400">Click to view sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to={`/studio/${studio.uniqueRoomId}`} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700" onClick={(e) => e.stopPropagation()}>
            Enter Studio
          </Link>
          <span className="text-2xl text-gray-500">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {isLoading ? <p className="py-4 text-center text-gray-300">Loading sessions...</p> : (
            <div className="space-y-3 pt-4">
              <h5 className="font-semibold text-gray-300">Recording Sessions</h5>
              {sessions.length > 0 ? (
                sessions.map(session => <SessionItem key={session._id} session={session} token={token} />)
              ) : <p className="text-sm text-gray-500">No recording sessions found for this studio.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Dashboard Page
const DashboardPage = () => {
  const { user } = useAuth(); // It correctly gets the user from here
  const [studios, setStudios] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

   const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate(); // 2. Initialize the navigate hook

  useEffect(() => {
    if (user) {
      studioService.getStudios(user.token)
        .then(data => setStudios(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCreateStudio = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      const newStudio = await studioService.createStudio({ title }, user.token);
      setStudios([newStudio, ...studios]);
      setTitle('');
    } catch (error) {
      console.error('Failed to create studio:', error);
    }
  };

   const handleJoinStudio = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/studio/${roomCode.trim()}`);
    }
  };


  if (loading) return <div className="text-center p-8 text-gray-300">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Create a New Studio</h3>
        <form onSubmit={handleCreateStudio} className="flex items-center space-x-4">
          <input 
            type="text" 
            placeholder="My New Podcast Episode" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="flex-grow px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Create</button>
        </form>
      </div>

      <div className="p-6 bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Join a Studio</h3>
        <form onSubmit={handleJoinStudio} className="flex items-center space-x-4">
          <input 
            type="text" 
            placeholder="Enter Studio Code" 
            value={roomCode} 
            onChange={(e) => setRoomCode(e.target.value)}
            className="flex-grow px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">Join</button>
        </form>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Your Studios</h3>
        {studios.length > 0 ? (
          <div className="space-y-4">
            {studios.map((studio) => <StudioItem key={studio._id} studio={studio} token={user.token} />)}
          </div>
        ) : (
          <div className="p-6 bg-gray-800 shadow-lg rounded-lg text-center text-gray-500">
            <p>You haven't created any studios yet. Create one above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

