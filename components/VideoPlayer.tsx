"use client";

import React, { useEffect, useRef, useState } from "react";

// Define the YouTube Player API interface
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [loopActive, setLoopActive] = useState(false);
  const loopCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube API
  useEffect(() => {
    // Create script tag to load YouTube IFrame API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer;

    // If the API is already loaded, initialize immediately
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    return () => {
      // Clean up player and interval on unmount
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current);
      }
    };
  }, [videoId]); // Re-initialize when videoId changes

  // Function to initialize the YouTube player
  const initializePlayer = () => {
    if (!containerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        fs: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  // Handle player ready event
  const onPlayerReady = () => {
    setPlayerReady(true);
    setDuration(playerRef.current.getDuration());

    // Start tracking current time
    const timeUpdateInterval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 100);

    // Clean up interval on component unmount
    return () => {
      clearInterval(timeUpdateInterval);
    };
  };

  // Handle player state changes
  const onPlayerStateChange = (event: any) => {
    // If video ends and loop is not active, reset
    if (event.data === window.YT.PlayerState.ENDED && !loopActive) {
      setCurrentTime(0);
    }
  };

  // Update loop checking when loop status changes
  useEffect(() => {
    if (loopActive && loopStart !== null && loopEnd !== null && playerReady) {
      // Clear any existing interval
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current);
      }

      // Set a new interval to check if we need to loop
      loopCheckIntervalRef.current = setInterval(() => {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime >= loopEnd) {
          playerRef.current.seekTo(loopStart, true);
        }
      }, 100);
    } else if (!loopActive && loopCheckIntervalRef.current) {
      // Clear the interval if looping is disabled
      clearInterval(loopCheckIntervalRef.current);
      loopCheckIntervalRef.current = null;
    }

    return () => {
      if (loopCheckIntervalRef.current) {
        clearInterval(loopCheckIntervalRef.current);
      }
    };
  }, [loopActive, loopStart, loopEnd, playerReady]);

  // Handle playback rate change
  const changePlaybackRate = (delta: number) => {
    if (!playerReady) return;

    // Calculate new rate, keeping within YouTube's allowed range (0.25 to 2.0)
    // but allowing precise 1% increments within that range
    const newRate = Math.max(0.25, Math.min(2.0, playbackRate + delta));
    setPlaybackRate(newRate);
    playerRef.current.setPlaybackRate(newRate);
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Set loop start to current time
  const setLoopStartToCurrent = () => {
    setLoopStart(currentTime);
  };

  // Set loop end to current time
  const setLoopEndToCurrent = () => {
    setLoopEnd(currentTime);
  };

  // Toggle loop active status
  const toggleLoop = () => {
    // Only allow toggling if both start and end are set
    if (loopStart !== null && loopEnd !== null) {
      setLoopActive(!loopActive);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black rounded-lg">
        <div
          ref={containerRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      {/* Playback Speed Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-medium">
          Speed ({(playbackRate * 100).toFixed(0)}%):
        </span>
        <button
          onClick={() => changePlaybackRate(-0.1)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={!playerReady}
        >
          -10%
        </button>
        <button
          onClick={() => changePlaybackRate(-0.01)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={!playerReady}
        >
          -1%
        </button>
        <button
          onClick={() => {
            setPlaybackRate(1.0);
            playerRef.current?.setPlaybackRate(1.0);
          }}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!playerReady}
        >
          Reset (100%)
        </button>
        <button
          onClick={() => changePlaybackRate(0.01)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={!playerReady}
        >
          +1%
        </button>
        <button
          onClick={() => changePlaybackRate(0.1)}
          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          disabled={!playerReady}
        >
          +10%
        </button>
      </div>

      {/* Loop Controls */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Loop Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>
                Start: {loopStart !== null ? formatTime(loopStart) : "--:--"}
              </span>
              <button
                onClick={setLoopStartToCurrent}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={!playerReady}
              >
                Set to Current
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span>
                End: {loopEnd !== null ? formatTime(loopEnd) : "--:--"}
              </span>
              <button
                onClick={setLoopEndToCurrent}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={!playerReady}
              >
                Set to Current
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={toggleLoop}
              className={`px-4 py-2 rounded font-medium ${
                loopActive
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              disabled={!playerReady || loopStart === null || loopEnd === null}
            >
              {loopActive ? "Disable Loop" : "Enable Loop"}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Current Time: {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
