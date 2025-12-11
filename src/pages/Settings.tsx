import React, { useState } from 'react';
import { Moon, Sun, User, Mail, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Toast, useToastState } from '../components/Toast';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane@startup-hq.com');
  const { toast, showToast, hideToast } = useToastState();

  const handleSave = () => {
    // TODO: wire up backend here for real persistence
    showToast('Saved (not really)');
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>

      {/* Theme Toggle */}
      <section className="card-elevated p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">
                {theme === 'dark' ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
              theme === 'dark' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-card transition-transform duration-200 ${
                theme === 'dark' ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Account Settings */}
      <section className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Account</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-base"
            />
          </div>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </section>

      {/* Toast */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
