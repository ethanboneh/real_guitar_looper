import YoutubeEmbed from "@/components/YoutubeEmbed";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          YouTube Video Embedder
        </h1>
        <YoutubeEmbed />
      </div>
    </main>
  );
}
