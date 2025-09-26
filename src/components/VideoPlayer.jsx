// // /client/src/components/VideoPlayer.jsx

// import { useEffect, useRef } from 'react';

// const VideoPlayer = ({ stream, isMuted = false }) => {
//   const videoRef = useRef();

//   useEffect(() => {
//     if (stream && videoRef.current) {
//       videoRef.current.srcObject = stream;
//     }
//   }, [stream]);

//   return (
//     <video
//       ref={videoRef}
//       autoPlay
//       playsInline
//       muted={isMuted}
//       style={{ width: '300px', margin: '5px', border: '1px solid black' }}
//     />
//   );
// };

// export default VideoPlayer;

// /client/src/components/VideoPlayer.jsx

import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, isMuted = false, name }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden w-full h-full shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 p-2 bg-gradient-to-t from-black/50 to-transparent w-full">
        <span className="text-white text-sm font-medium drop-shadow-md">{name}</span>
      </div>
    </div>
  );
};

export default VideoPlayer;