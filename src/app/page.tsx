import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { LeaderboardSection } from '@/components/home/LeaderboardSection';
import { CTASection } from '@/components/home/CTASection';

export const metadata = {
  title: 'ft_transcendence - Competitive Pong Gaming',
  description: 'Challenge players worldwide in real-time multiplayer Pong matches, compete in tournaments, and dominate the global leaderboard.',
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <LeaderboardSection />
      <CTASection />
    </>
  );
}
