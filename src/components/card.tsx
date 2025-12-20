import { useEffect, useState } from 'react';

interface DiscordData {
  username: string;
  status: string;
  activity: string;
  avatar: string | null;
}

interface CardProps {
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ id, className = '', children }: CardProps) {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate Discord API call (replace with actual implementation)
    const fetchDiscordData = async () => {
      try {
        // Here you would normally fetch from Discord API
        // For now, we'll simulate the data
        setTimeout(() => {
          setDiscordData({
            username: 'Usuario Discord',
            status: 'En línea',
            activity: 'Viendo el sitio web',
            avatar: null
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching Discord data:', error);
        setLoading(false);
      }
    };

    fetchDiscordData();
  }, [id]);

  if (children) {
    return <div className={`card-content ${className}`}>{children}</div>;
  }

  return (
    <div className={`card-content p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {discordData?.username?.[0] || 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
        </div>
        <div className="flex-1 min-w-0">
          {loading ? (
            <>
              <div className="h-4 bg-white/20 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-white/10 rounded animate-pulse w-2/3"></div>
            </>
          ) : (
            <>
              <p className="text-white font-semibold truncate">
                {discordData?.username || 'Usuario'}
              </p>
              <p className="text-white/70 text-sm truncate">
                {discordData?.status || 'Desconectado'}
              </p>
            </>
          )}
        </div>
      </div>
      {discordData?.activity && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-white/60 text-xs">
            🎮 {discordData.activity}
          </p>
        </div>
      )}
    </div>
  );
}