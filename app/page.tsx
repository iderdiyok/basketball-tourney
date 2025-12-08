'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Calendar, Users, Eye, TrendingUp, Shield, Timer, PlayCircle, 
  Gift, Star, Sparkles, Heart, Clock, MapPin
} from 'lucide-react';
import { ClientTournament } from '@/types/client';
import logo from '../assets/images/logo.png';
import christmasTree from '../assets/images/blinkenderWeihnachtsbaum.gif';


export default function HomePage() {
  const [tournaments, setTournaments] = useState<ClientTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    fetchTournaments();
    generateSnowflakes();
  }, []);

  const generateSnowflakes = () => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }));
    setSnowflakes(flakes);
  };

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments?published=true');
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFinishedGamesCount = (tournament: ClientTournament): number => {
    return tournament.games?.filter(game => game.status === 'finished').length || 0;
  };

  const getTotalGamesCount = (tournament: ClientTournament): number => {
    return tournament.games?.length || 0;
  };

  const hasActiveGames = (tournament: ClientTournament): boolean => {
    return tournament.games?.some(game => game.status === 'pending' || game.status === 'live') || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-800 to-red-800 relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-20 p-4">
        <div className="container mx-auto flex justify-end">
          <Link href="/admin">
            <Button 
              size="sm" 
              className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>
      </nav>

      {/* Animated Snowflakes */}
      <div className="absolute inset-0 pointer-events-none">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute text-white opacity-70 animate-pulse"
            style={{
              left: `${flake.left}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      {/* Hero Section - Christmas Invitation */}
      <div className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-green-900/90"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center text-white">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4">
                  <Image
                    src={logo}
                    alt="Winsen Baskets Logo"
                    width={120}
                    height={120}
                    className="w-20 h-20 md:w-24 md:h-24"
                  />
                </div>
              </div>
            </div>

            {/* Christmas Invitation */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <div className="flex justify-center mb-6">                  
                  <Image 
                    src={christmasTree} 
                    alt="Blinkender Weihnachtsbaum" 
                    width={80} 
                    height={100}
                  />
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  Winsen Baskets Weihnachtsturnier 
                </h1>
                
                <div className="space-y-6 text-lg md:text-xl text-green-100">
                  <p className="text-xl md:text-2xl mb-6">
                    Wollen wir mit euch als Jahresabschluss ein kleines Mix Turnier veranstalten.
                  </p>

                  <div className="text-center mt-8">
                    <p className="text-2xl text-yellow-300 mb-2">🎅 Wir freuen uns auf euch! 🎅</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Active Tournaments Section */}
        {loading ? (
          <div className="text-center mb-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎄</span>
              </div>
            </div>
            <p className="text-xl text-white">Weihnachtsturniere werden geladen...</p>
          </div>
        ) : tournaments.length > 0 ? (
          <div className="space-y-16 mb-16">
            <div className="flex justify-center mb-6">  
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-yellow-300 animate-pulse" />
                <Star className="w-6 h-6 text-yellow-300 animate-bounce" />
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Aktuelle Weihnachtsturniere
              </h2>
              <p className="text-lg text-green-100 max-w-2xl mx-auto">
                Verfolgen Sie live die spannendsten Basketball-Turniere mit Echtzeit-Updates
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {tournaments.map((tournament, index) => {
                const finishedGames = getFinishedGamesCount(tournament);
                const totalGames = getTotalGamesCount(tournament);
                const isComplete = finishedGames === totalGames && totalGames > 0;
                const hasActive = hasActiveGames(tournament);
                
                return (
                  <Card key={tournament._id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-2 border-white/30 hover:border-yellow-300 overflow-hidden bg-white/10 backdrop-blur-sm">
                    <CardHeader className={`text-white py-8 relative ${
                      index % 2 === 0 ? 'bg-gradient-to-r from-red-600/90 to-red-700/90' : 'bg-gradient-to-r from-green-600/90 to-green-700/90'
                    }`}>
                      <div className="absolute top-4 left-4">
                        <div className="text-xl animate-pulse">🎄</div>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl font-bold">{tournament.name}</CardTitle>
                      <CardDescription className="text-lg text-green-100">
                        Kategorie: {tournament.category} 🏀
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 bg-gradient-to-b from-white/15 to-white/10">
                      <div className="space-y-6">
                        {/* Statistics */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-yellow-300">{tournament.teams?.length || 0}</div>
                            <div className="text-sm text-white">Teams</div>
                            <div className="text-lg">🏀</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-red-300">{finishedGames}/{totalGames}</div>
                            <div className="text-sm text-white">Spiele</div>
                            <div className="text-lg">⚡</div>
                          </div>
                          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                            <div className="text-2xl font-bold text-green-300">
                              {tournament.teams?.reduce((total, team) => total + (team.players?.length || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-white">Spieler</div>
                            <div className="text-lg">👨‍🎄</div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <Badge 
                              variant={isComplete ? 'outline' : hasActive ? 'default' : 'secondary'} 
                              className={`text-base px-4 py-2 ${
                                isComplete ? 'bg-yellow-500/80 text-white border-yellow-300' : 
                                hasActive ? 'bg-red-500/80 text-white' : 
                                'bg-gray-500/80 text-white'
                              }`}
                            >
                              {isComplete ? '🏆 Abgeschlossen' : hasActive ? '🔴 Live' : '⏳ Ausstehend'}
                            </Badge>
                          </div>
                          
                          <Link href={`/tournaments/${tournament._id}`} className="block">
                            <Button size="lg" className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white shadow-lg transform hover:scale-105 transition-all">
                              <Eye className="w-5 h-5 mr-3" />
                              🎄 Turnier live verfolgen
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center mb-16 py-16">
            <div className="text-6xl mb-6 animate-bounce">🎄</div>
            <h2 className="text-3xl font-bold text-white mb-4">Noch keine Weihnachtsturniere verfügbar</h2>
            <p className="text-lg text-green-100 mb-8 max-w-2xl mx-auto">
              Erstellen Sie Ihr erstes Weihnachtsturnier im Admin-Bereich und starten Sie mit der Basketball-Action! 🏀
            </p>
            <Link href="/admin">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 shadow-2xl transform hover:scale-105 transition-all">
                <Shield className="w-6 h-6 mr-3" />
                🎄 Erstes Turnier erstellen
              </Button>
            </Link>
          </div>
        )}


        {/* Christmas Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🏀 Basketball Features für Weihnachten 🏀
            </h2>
            <p className="text-lg text-green-100 max-w-3xl mx-auto">
              Professionelle Tools für erfolgreiche Basketball-Weihnachtsturniere
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-all text-center p-6 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/15">
              <div className="text-3xl mb-4">🗓️</div>
              <Calendar className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3 text-white">Live Spielplan</CardTitle>
              <CardDescription className="text-base text-green-100">
                Automatische Spielpläne mit Live-Updates und Echtzeit-Status für das Weihnachtsturnier
              </CardDescription>
            </Card>

            <Card className="hover:shadow-lg transition-all text-center p-6 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/15">
              <div className="text-3xl mb-4">🏆</div>
              <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3 text-white">Smart Rankings</CardTitle>
              <CardDescription className="text-base text-green-100">
                Automatische Tabellen mit Punkten, Siegen und Korbdifferenz - Wer wird Weihnachtsmeister?
              </CardDescription>
            </Card>

            <Card className="hover:shadow-lg transition-all text-center p-6 bg-white/10 backdrop-blur-sm border border-white/30 hover:bg-white/15">
              <div className="text-3xl mb-4">👨‍🎄</div>
              <Users className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3 text-white">Player Analytics</CardTitle>
              <CardDescription className="text-base text-green-100">
                Detaillierte Spielerstatistiken mit Top-Scorer und Spezialkönigen des Weihnachtsturniers
              </CardDescription>
            </Card>
          </div>
        </div>

        {/* Christmas Footer Message */}
        <div className="text-center py-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 max-w-2xl mx-auto">
            <div className="text-4xl mb-4">🎄🏀🎄</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Frohe Weihnachten und erfolgreiche Turniere!
            </h3>
            <p className="text-green-100 text-lg">
              Wir wünschen allen Teams, Spielern und Familien eine wunderbare Weihnachtszeit 
              und spannende Basketball-Spiele beim Winsen Baskets Weihnachtsturnier 2025!
            </p>
            <div className="text-3xl mt-4">🎅🏀❄️</div>
          </div>
        </div>
      </div>
    </div>
  );
}
