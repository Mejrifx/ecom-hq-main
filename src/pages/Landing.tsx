import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, FileText, CheckSquare, UtensilsCrossed } from 'lucide-react';
import { useData } from '../contexts/FakeDataContext';

export function Landing() {
  const navigate = useNavigate();
  const { dispatch } = useData();

  const handleEnter = () => {
    dispatch({ type: 'LOGIN' });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-8">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Startup HQ
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Your all-in-one workspace for notes, tasks, and recipes. 
            Simple, clean, and focused on what matters.
          </p>

          {/* Enter Button */}
          <button
            onClick={handleEnter}
            className="btn-primary text-lg px-8 py-4 group"
          >
            Enter Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-20 w-full px-4">
          <FeatureCard
            icon={FileText}
            title="Notes"
            description="Write and organize your thoughts with markdown support"
          />
          <FeatureCard
            icon={CheckSquare}
            title="Tasks"
            description="Kanban board to track your projects and todos"
          />
          <FeatureCard
            icon={UtensilsCrossed}
            title="Recipes"
            description="Build your personal meal deck collection"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Built with React + TypeScript + Tailwind</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="card-elevated p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
