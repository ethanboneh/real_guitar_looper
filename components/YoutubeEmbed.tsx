"use client";

import { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import { extractVideoId } from "@/utils/youtubeUtils";

const YoutubeEmbed = () => {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const id = extractVideoId(url);
      if (id) {
        setVideoId(id);
        setError(null);
      } else {
        setError(
          "Invalid YouTube URL. Please enter a valid YouTube video URL."
        );
        setVideoId(null);
      }
    } catch (err) {
      setError("Failed to process URL. Please try again.");
      setVideoId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
            className="flex-grow px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Embed Video
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {videoId ? (
        <VideoPlayer videoId={videoId} />
      ) : (
        <div className="aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
          <p className="text-gray-500">
            Enter a YouTube URL to display the video here
          </p>
        </div>
      )}

      <div className="mt-6 border-t pt-6">
        <h2 className="text-lg font-semibold mb-2">How to use:</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-1">
          <li>
            Paste a full YouTube URL (e.g.,
            https://www.youtube.com/watch?v=dQw4w9WgXcQ)
          </li>
          <li>
            YouTube Shorts are also supported (e.g.,
            https://www.youtube.com/shorts/TH8caWdVnvw)
          </li>
          <li>
            You can even use shortened youtu.be links (e.g.,
            https://youtu.be/dQw4w9WgXcQ)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default YoutubeEmbed;
