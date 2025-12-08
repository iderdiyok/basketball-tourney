'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Medal, Trophy } from 'lucide-react';
import { PlayerStatistics } from '@/types/client';

interface TopScorerProps {
  players: PlayerStatistics[];
  limit?: number;
}

export function TopScorer({ players, limit = 10 }: TopScorerProps) {
  const topScorers = players
    .filter(p => p.gamesPlayed > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);

  if (topScorers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-yellow-500" />
            Top Scorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            Noch keine Spielerstatistiken verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          Top Scorer
        </CardTitle>
        <p className="text-sm text-gray-600">Die punktbesten Spieler des Turniers</p>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-xs sm:text-sm">Rang</TableHead>
                <TableHead className="min-w-[120px] text-xs sm:text-sm">Spieler</TableHead>
                <TableHead className="min-w-[100px] text-xs sm:text-sm">Team</TableHead>
                <TableHead className="text-center text-xs sm:text-sm">Sp.</TableHead>
                <TableHead className="text-center text-xs sm:text-sm">Pkt.</TableHead>
                <TableHead className="text-center text-xs sm:text-sm">Ø</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topScorers.map((stat, index) => (
                <TableRow key={stat.player._id} className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}>
                  <TableCell className="text-center font-medium text-xs sm:text-sm py-3">
                    <div className="flex items-center justify-center gap-1">
                      {index + 1}
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                      {index === 1 && <Medal className="w-4 h-4 text-gray-400" />}
                      {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-xs sm:text-sm py-3">
                    {stat.player.name}
                    {stat.player.number && (
                      <span className="text-gray-500 ml-2">#{stat.player.number}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm py-3">{stat.team.name}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm py-3">{stat.gamesPlayed}</TableCell>
                  <TableCell className="text-center font-bold text-xs sm:text-sm py-3 text-green-600">
                    {stat.totalPoints}
                  </TableCell>
                  <TableCell className="text-center text-xs sm:text-sm py-3">
                    {stat.avgPointsPerGame.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}