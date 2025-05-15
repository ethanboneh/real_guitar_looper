export function extractVideoId(url: string): string | null {
  // Regular expressions to match various YouTube URL formats
  const regexes = [
    // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/,
    // Shortened YouTube URL: https://youtu.be/VIDEO_ID
    /youtu\.be\/([^?&]+)/,
    // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([^?&]+)/,
    // Embedded YouTube URL: https://www.youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const regex of regexes) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
