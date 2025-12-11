import React from 'react';
import { Brush } from 'lucide-react';

export function Whiteboard() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Brush className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Whiteboard</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Coming soon! A collaborative canvas for sketching ideas and diagrams.
        </p>
        {/* TODO: wire up backend here for real-time collaboration */}
      </div>
    </div>
  );
}
