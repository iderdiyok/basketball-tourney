'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Undo, RotateCcw, Home } from 'lucide-react';

interface GameControlsProps {
  gameStatus: 'pending' | 'live' | 'finished';
  onUndo: () => void;
  onSave: () => void;
  onGoHome: () => void;
  canUndo: boolean;
  isSaving: boolean;
  lastAction?: string;
}

export function GameControls({
  gameStatus,
  onUndo,
  onSave,
  onGoHome,
  canUndo,
  isSaving,
  lastAction
}: GameControlsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'live': return 'default';
      case 'finished': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bereit';
      case 'live': return 'Live';
      case 'finished': return 'Beendet';
      default: return 'Unbekannt';
    }
  };

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Badge variant={getStatusColor(gameStatus)} className="w-fit text-sm px-3 py-1">
              {getStatusText(gameStatus)}
            </Badge>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Letzte Aktion:</span> {lastAction || 'Keine'}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onUndo}
              disabled={!canUndo}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12"
            >
              <Undo className="w-4 h-4 mr-2" />
              Rückgängig
            </Button>
            
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-12"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Speichert...' : 'Spiel speichern'}
            </Button>
            
            <Button
              onClick={onGoHome}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12"
            >
              <Home className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}