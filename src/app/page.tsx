'use client';

import dynamic from 'next/dynamic';

const ChessBoard = dynamic(() => import('@/components/ChessBoard'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to ChessCoach
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Your personal AI-powered chess coach to help improve your game
        </p>
      </section>

      {/* Chess Board Section */}
      <section className="py-8">
        <ChessBoard />
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
        <FeatureCard
          title="Profile Integration"
          description="Connect with your chess.com and lichess accounts to analyze your games"
        />
        <FeatureCard
          title="AI Analysis"
          description="Get personalized insights and improvement suggestions from AI"
        />
        <FeatureCard
          title="Interactive Learning"
          description="Practice specific positions and scenarios with immediate feedback"
        />
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
} 