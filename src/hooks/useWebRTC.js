// /client/src/hooks/useWebRTC.js

import { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useWebRTC = (roomId) => {
  const { user } = useAuth();
  const [userStream, setUserStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [socket, setSocket] = useState(null); // Use state for the socket
  const myPeerRef = useRef();
  const callRefs = useRef({});

  useEffect(() => {
    const socketInstance = io.connect('https://riverside-clone-server.onrender.com');
    setSocket(socketInstance); // Set the socket in state

    const myPeer = new Peer(undefined, {
     // host: 'https://riverside-clone-server.onrender.com',
     // port: 9000,
     // path: '/myapp',
    });
    myPeerRef.current = myPeer;

    myPeer.on('open', (peerId) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setUserStream(stream);
          socketInstance.emit('join-room', roomId, peerId, user._id);

          myPeer.on('call', (call) => {
            call.answer(stream);
            call.on('stream', (userVideoStream) => addVideoStream(call.peer, userVideoStream));
            callRefs.current[call.peer] = call;
          });

          socketInstance.on('user-connected', (newPeerId) => {
            const call = myPeer.call(newPeerId, stream);
            call.on('stream', (userVideoStream) => addVideoStream(newPeerId, userVideoStream));
            callRefs.current[newPeerId] = call;
          });
        });
    });

    myPeer.on('error', (err) => console.error('PeerJS Error:', err));

    socketInstance.on('user-disconnected', (peerId) => {
      if (callRefs.current[peerId]) {
        callRefs.current[peerId].close();
        delete callRefs.current[peerId];
      }
      setPeers((prevPeers) => {
        const newPeers = { ...prevPeers };
        delete newPeers[peerId];
        return newPeers;
      });
    });

    return () => {
      socketInstance.disconnect();
      myPeer.destroy();
    };
  }, [roomId, user]);

  function addVideoStream(peerId, stream) {
    setPeers((prevPeers) => ({
      ...prevPeers,
      [peerId]: stream,
    }));
  }
  
  // Return the socket instance from state
  return { userStream, peers, socket };
};