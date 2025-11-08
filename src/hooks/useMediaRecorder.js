
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { openDB } from 'idb';

const DB_NAME = 'RiversideCloneDB';
const STORE_NAME = 'recording_chunks';
const UPLOAD_PART_SIZE = 5 * 1024 * 1024; // 5MB
const MULTIPART_STATE_KEY = 'multipart_upload_sessions'; // Key for localStorage

// Helper to initialize the database with a session ID index
const initDB = async () => {
  const db = await openDB(DB_NAME, 2, { // Use version 2 for the schema update
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains(STORE_NAME)) {
          db.deleteObjectStore(STORE_NAME);
        }
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('sessionId', 'sessionId');
      }
    },
  });
  return db;
};

export const useMediaRecorder = (roomId, socket) => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const activeSessionId = useRef(null);
  const isRecordingRef = useRef(isRecording);

  // --- NEW: Refs for the upload queue ---
  const uploadQueue = useRef([]);
  const isUploading = useRef(false);

  const recordingSession = useRef();

  const dbRecordingId = useRef(null); 
  
  
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    if (!socket) return;
    const handleDbId = (data) => {
      dbRecordingId.current = data.recordingId;
      let allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
      let sessionState = allSessions[activeSessionId.current];
      sessionState.recordingSessionId = recordingSession.current;
      sessionState.dbRecordingId = dbRecordingId.current;
      localStorage.setItem(MULTIPART_STATE_KEY, JSON.stringify(allSessions));
    };
    socket.on('db-recording-created', handleDbId);
    return () => {
      socket.off('db-recording-created', handleDbId);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    // Listen for the server to provide the true session ID
    const handleSessionStarted = (data) => {
      console.log('Session started with ID:', data.sessionId);
      recordingSession.current = data.sessionId;
    };
    
    socket.on('session-started', handleSessionStarted);

    return () => {
      socket.off('session-started', handleSessionStarted);
    };
  }, [socket]);


  const uploadPart = async (blob, sessionState, partNumber) => {
    console.log(partNumber);
    console.log(blob);
    try {
      const { data } = await axios.post('https://riverside-clone-server.onrender.com/api/upload/multipart-url', {
        key: sessionState.key,
        uploadId: sessionState.uploadId,
        partNumber: partNumber,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      const response = await axios.put(data.uploadUrl, blob, {
        headers: { 'Content-Type': 'video/webm' },
      });
      
      const etag = response.headers.etag.replace(/"/g, '');
      console.log(`Successfully uploaded part #${partNumber} for session ${sessionState.key}`);
      return etag;
    } catch (error) {
      console.error(`Failed to upload part #${partNumber} for session ${sessionState.key}:`, error);
      return null;
    }
  };

  const completeUpload = async (sessionState, sessionId, pendSessionId, pendRecordingId) => {
    if (!sessionState || !sessionState.key) return;
    try {
      await axios.post('https://riverside-clone-server.onrender.com/api/upload/complete-multipart', {
        key: sessionState.key,
        uploadId: sessionState.uploadId,
        parts: sessionState.parts,
        recordingId: pendRecordingId || dbRecordingId.current,
        sessionId:  pendSessionId || recordingSession.current
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      console.log(`Upload complete for session ${sessionId}`);

      // After the upload is done, tell the server it's ready for processing.
       if (socket && dbRecordingId.current && sessionId) {
        socket.emit('upload-complete', { 
            recordingId: dbRecordingId.current,
            sessionId: recordingSession.current
        });
      }

       // --- THIS IS THE FIX ---
      // Now, save the metadata to our own database
      // await axios.post(
      //   'http://localhost:5000/api/recordings',
      //   { 
      //     fileName: sessionState.key, 
      //     studioId: roomId 
      //   },
      //   { headers: { Authorization: `Bearer ${user.token}` } }
      // );
      console.log('Recording metadata saved to database.');
      
      // Clean up the completed session from localStorage
      const allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
      delete allSessions[sessionId];
      localStorage.setItem(MULTIPART_STATE_KEY, JSON.stringify(allSessions));
    } catch (error) {
      console.error(`Failed to complete multipart upload for session ${sessionId}:`, error);
    }
  };

  // const processUploadQueue = async (sessionId, isFinal = false) => {
  //   const db = await initDB();
  //   let allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
  //   let sessionState = allSessions[sessionId];
    
  //    console.log('5 second chunk')

  //   if (!sessionState){ 
  //     return;
  //   };

  //   if(isFinal){
  //     console.log("ae madar ji")
  //   }

  //   const chunks = await db.getAllFromIndex(STORE_NAME, 'sessionId', sessionId);
  //   if (chunks.length === 0) {
  //     if (isFinal) await completeUpload(sessionState, sessionId);
  //     return;
  //   }

  //   const totalSize = chunks.reduce((acc, chunk) => acc + chunk.data.size, 0);
  //   if (totalSize >= UPLOAD_PART_SIZE || (isFinal && totalSize > 0)) {
  //     const chunkData = chunks.map(chunk => chunk.data);
  //     const partBlob = new Blob(chunkData, { type: 'video/webm' });

  //      const tx = db.transaction(STORE_NAME, 'readwrite');
  //       for (const chunk of chunks) {
  //         await tx.store.delete(chunk.id);
  //       }
  //       await tx.done;
      
  //     const etag = await uploadPart(partBlob, sessionState, sessionState.partNumber);
      
  //     if (etag) {
  //       allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
  //       sessionState = allSessions[sessionId];
    
  //       sessionState.parts.push({ ETag: etag, PartNumber: sessionState.partNumber });
  //       sessionState.partNumber += 1;
  //       localStorage.setItem(MULTIPART_STATE_KEY, JSON.stringify(allSessions));

  //       // const tx = db.transaction(STORE_NAME, 'readwrite');
  //       // for (const chunk of chunks) {
  //       //   await tx.store.delete(chunk.id);
  //       // }
  //       // await tx.done;
  //     }
      
  //     if (isFinal) {
  //       await processUploadQueue(sessionId, true);
  //     }
  //   }
  // };

  const processUploadQueue = async () => {
    if (isUploading.current || uploadQueue.current.length === 0) {
      return; // Either busy or the queue is empty
    }

    isUploading.current = true;
    const { sessionId, isFinal, pendRecordingId, pendSessionId } = uploadQueue.current.shift(); // Get the next task

    const db = await initDB();
    let allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
    let sessionState = allSessions[sessionId];
    
    if (sessionState) {
      const chunks = await db.getAllFromIndex(STORE_NAME, 'sessionId', sessionId);
      if (chunks.length > 0) {
        const totalSize = chunks.reduce((acc, chunk) => acc + chunk.data.size, 0);

        if (totalSize >= UPLOAD_PART_SIZE || (isFinal && totalSize > 0)) {
          const chunkData = chunks.map(chunk => chunk.data);
          const partBlob = new Blob(chunkData, { type: 'video/webm' });
          
          const etag = await uploadPart(partBlob, sessionState, sessionState.partNumber);
          
          if (etag) {
            allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
            sessionState = allSessions[sessionId];
    

            sessionState.parts.push({ ETag: etag, PartNumber: sessionState.partNumber });
            sessionState.partNumber += 1;
            
            // sessionState.recordingSessionId = recordingSession.current;
            // sessionState.dbRecordingId = dbRecordingId.current;

            localStorage.setItem(MULTIPART_STATE_KEY, JSON.stringify(allSessions));

            const tx = db.transaction(STORE_NAME, 'readwrite');
            for (const chunk of chunks) { await tx.store.delete(chunk.id); }
            await tx.done;
          }
        }
      }

      if (isFinal) {
        await completeUpload(sessionState, sessionId, pendSessionId, pendRecordingId);
      }
    }

    isUploading.current = false;
    processUploadQueue(); // Check for the next task
  };


  const startRecording = async (stream) => {
    if (stream && !isRecordingRef.current) {
      try {
        const s3FileKey = `${roomId}-${user._id}-${new Date().toISOString()}.webm`;
        activeSessionId.current = s3FileKey;

        const { data } = await axios.post('https://riverside-clone-server.onrender.com/api/upload/start-multipart', {
          fileName: s3FileKey,
          contentType: 'video/webm'
        }, { headers: { Authorization: `Bearer ${user.token}` } });
        
        const newSessionState = {
          key: data.key,
          uploadId: data.uploadId,
          parts: [],
          partNumber: 1,
        };
        
        const allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
        allSessions[s3FileKey] = newSessionState;
        console.log( `setting session id ${s3FileKey}`);
        localStorage.setItem(MULTIPART_STATE_KEY, JSON.stringify(allSessions));

       const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const db = await initDB();
            await db.add(STORE_NAME, { sessionId: activeSessionId.current, data: event.data });
            
            // Add a task to the queue instead of calling the processor directly
            uploadQueue.current.push({ sessionId: activeSessionId.current, isFinal: false });
            console.log("5 second chunk");
            processUploadQueue();
          }
        };

        mediaRecorder.start(1000);
        setIsRecording(true);
        if (socket) {
          socket.emit('recording-started', { userId: user._id, roomId, s3FileKey });
        }
        console.log('Resilient recording started.');
      } catch (error) {
        console.error('Failed to start recording process:', error);
      }
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        // Add the final task to the queue
        uploadQueue.current.push({ sessionId: activeSessionId.current, isFinal: true });
        processUploadQueue();
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  useEffect(() => {
    
    if(!user){
      return;
    }

     const recoverAllUploads = async () => {
      const allSessions = JSON.parse(localStorage.getItem(MULTIPART_STATE_KEY) || '{}');
      if (Object.keys(allSessions).length > 0) {
        console.log(`Found ${Object.keys(allSessions).length} unfinished sessions. Adding to recovery queue...`);
        for (const sessionId in allSessions) {
          uploadQueue.current.push({ sessionId: sessionId, isFinal: true, pendSessionId : allSessions[sessionId].recordingSessionId, pendRecordingId: allSessions[sessionId].dbRecordingId});
        }
        processUploadQueue();
      }
    };
    recoverAllUploads();
  }, [user]);

  return { isRecording, startRecording, stopRecording };
};