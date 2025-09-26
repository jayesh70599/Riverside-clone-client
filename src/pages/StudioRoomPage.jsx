// /client/src/pages/StudioRoomPage.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import studioService from '../services/studioService';
import { useWebRTC } from '../hooks/useWebRTC';
import { useMediaRecorder } from '../hooks/useMediaRecorder';

// A more advanced helper function for a visually pleasing grid
const getLayoutClasses = (count) => {
  if (count === 1) return 'grid grid-cols-1 grid-rows-1';
  if (count === 2) return 'grid grid-cols-2 grid-rows-1';
  if (count === 3 || count === 4) return 'grid grid-cols-2 grid-rows-2';
  if (count >= 5 && count <= 6) return 'grid grid-cols-3 grid-rows-2';
  if (count >= 7 && count <= 9) return 'grid grid-cols-3 grid-rows-3';
  return 'grid grid-cols-4 grid-rows-3'; // For 10+
};

const StudioRoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [isHost, setIsHost] = useState(false);

  const navigate = useNavigate();

  // Get WebRTC tools. `socket` will be null initially.
  const { userStream, peers, socket } = useWebRTC(roomId);
  
  // Get MediaRecorder tools.
  const { isRecording, startRecording, stopRecording} = useMediaRecorder(roomId, socket);

  // --- NEW: State for Mic and Cam controls ---
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // This useEffect connects the two hooks together once the socket is ready.
  useEffect(() => {
    if (!socket || !userStream) return;

    const startRecordingHandler = () => {      
      startRecording(userStream);
    }
    
    socket.on('start-all-recorders', startRecordingHandler);
    socket.on('stop-all-recorders', stopRecording);

    const handlePopstate =  () => {
      console.log("popstate listener called")
      if(isRecording){
        stopRecording();
      }
    }
    

    window.addEventListener('popstate', handlePopstate)

    return () => {
      socket.off('start-all-recorders', startRecordingHandler);
      socket.off('stop-all-recorders', stopRecording);
      //window.removeEventListener('popstate', handlePopstate);
    };
  }, [socket, userStream , isRecording, startRecording, stopRecording]);

   

  useEffect(() => {
     const checkHostStatus = async () => {
      if (user) {
        try {
          const data = await studioService.getStudioDetails(roomId, user.token);
          setIsHost(data.isHost);
        } catch (error) {
          console.error("Could not verify host status", error);
        }
      }
    };
    checkHostStatus();

  }, [roomId, user]);

  const handleStart = () => {
    //startRecording(userStream);
    if (socket) socket.emit('host-start-recording', roomId, user._id);
  };

  const handleStop = () => {
   // stopRecording();
    if (socket) socket.emit('host-stop-recording', roomId);
  };

  const handleLeaveRoom = () => {
    stopRecording();
    navigate('/');
  }

  // --- NEW: Functions to toggle Mic and Cam ---
  const toggleMic = () => {
    if (userStream) {
      const audioTrack = userStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (userStream) {
      const videoTrack = userStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const participants = Object.entries(peers);
  const participantCount = 1 + participants.length;
  
  // const isTwoParticipants = participantCount === 2;
   const getParticipants = (num) => participants.slice(0, num);
  
  return (
    // <div>
    //   <h2>Studio Room: {roomId}</h2>
      
    //   {isHost && (
    //     <div>
    //       {!isRecording ? (
    //         <button onClick={hostStartRecording} disabled={!userStream}>Start Recording For All</button>
    //       ) : (
    //         <button onClick={hostStopRecording}>Stop Recording For All</button>
    //       )}
    //     </div>
    //   )}
      
    //   <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '1rem' }}>
    //     {userStream && <VideoPlayer stream={userStream} isMuted={true} />}
    //     {Object.entries(peers).map(([peerId, stream]) => (
    //       <VideoPlayer key={peerId} stream={stream} />
    //     ))}
    //   </div>
    //   <button onClick={handleLeaveRoom} >leave room</button>
    // </div>
    
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-2xl font-bold">Studio: {roomId}</h2>
        {isRecording && (
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-semibold">Recording</span>
          </div>
        )}
      </header>

      {/* --- THIS IS THE FIX --- */}
      {/* Main Video Stage with corrected flex properties */}
      <main className="flex-grow flex-shrink min-h-0 p-4">
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        
          {participantCount === 1 && userStream && (
            <div className="w-full h-full max-w-5xl">
              <VideoPlayer stream={userStream} isMuted={true} name={user?.name || 'You'} />
            </div>
          )}
          
          {participantCount === 2 && userStream && (
            <div className="grid grid-cols-2 gap-4 w-full h-full max-w-6xl">
              <VideoPlayer stream={userStream} isMuted={true} name={user?.name || 'You'} />
              {getParticipants(1).map(([peerId, stream]) => (
                <VideoPlayer key={peerId} stream={stream} name={`Peer ${peerId.substring(0, 6)}`} />
              ))}
            </div>
          )}

           {/* --- THIS IS THE FIX --- */}
          {participantCount === 3 && userStream && (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-4">
              {/* Top Row */}
              <div className="col-span-1"><VideoPlayer stream={userStream} isMuted={true} name={user?.name || 'You'} /></div>
              <div className="col-span-1">{getParticipants(1).map(([peerId, stream]) => (<VideoPlayer key={peerId} stream={stream} name={`Peer ${peerId.substring(0, 6)}`} />))}</div>
              {/* Bottom Row - Centered */}
              <div className="col-span-2 justify-self-center w-1/2">
                {getParticipants(2).slice(1).map(([peerId, stream]) => (
                  <VideoPlayer key={peerId} stream={stream} name={`Peer ${peerId.substring(0, 6)}`} />
                ))}
              </div>
            </div>
          )}

          {participantCount >= 4 && (
            <div className={`w-full h-full grid gap-4 grid-cols-2`}>
              {userStream && <VideoPlayer stream={userStream} isMuted={true} name={user?.name || 'You'} />}
              {participants.map(([peerId, stream]) => (
                <VideoPlayer key={peerId} stream={stream} name={`Peer ${peerId.substring(0, 6)}`} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Control Panel */}
      <footer className="p-4 bg-gray-800 border-t border-gray-700 flex justify-center items-center space-x-4">
       {isHost && (
          <div>
            {!isRecording ? (
              <button onClick={handleStart} disabled={!userStream} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:bg-gray-500 transition-colors">
                Start Recording
              </button>
            ) : (
              <button onClick={handleStop} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors">
                Stop Recording
              </button>
            )}
          </div>
        )}
        <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleCam} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isVideoOff ? 'Cam On' : 'Cam Off'}
        </button>
        <button onClick={handleLeaveRoom} className={`p-3 rounded-full transition-colors bg-red-600 cursor-pointer` }>
          Leave Session
        </button>
      </footer>
    </div>
  );
};

export default StudioRoomPage;