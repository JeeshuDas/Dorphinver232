import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Moon, Sun, ChevronRight } from 'lucide-react';
import { Switch } from './ui/switch';

interface SettingsScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function SettingsScreen({ onBack, isDarkMode, onThemeToggle }: SettingsScreenProps) {
  const [autoplay, setAutoplay] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [videoQuality, setVideoQuality] = useState('Auto (720p)');
  const [accountPrivacy, setAccountPrivacy] = useState('Public');
  return (
    <div className="h-full overflow-y-auto scrollbar-hide pb-6 bg-background">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Settings</h2>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="mb-4">Appearance</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Theme Toggle */}
              <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      {isDarkMode ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={onThemeToggle}
                />
              </div>
            </div>
          </div>

          {/* Playback */}
          <div>
            <h3 className="mb-4">Playback</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <motion.div 
                className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Autoplay</p>
                  <p className="text-sm text-muted-foreground">
                    {autoplay ? 'Automatically play next video' : 'Manual play required'}
                  </p>
                </div>
                <Switch 
                  checked={autoplay} 
                  onCheckedChange={setAutoplay}
                />
              </motion.div>
              
              <div className="border-t border-border" />
              
              <motion.div 
                className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => {
                  const qualities = ['Auto (720p)', '1080p', '720p', '480p', '360p'];
                  const currentIndex = qualities.indexOf(videoQuality);
                  const nextIndex = (currentIndex + 1) % qualities.length;
                  setVideoQuality(qualities[nextIndex]);
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Quality</p>
                  <p className="text-sm text-muted-foreground">{videoQuality}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="mb-4">Notifications</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <motion.div 
                className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {pushNotifications ? 'Get notified about new content' : 'Notifications disabled'}
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications} 
                  onCheckedChange={setPushNotifications}
                />
              </motion.div>
              
              <div className="border-t border-border" />
              
              <motion.div 
                className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Email Updates</p>
                  <p className="text-sm text-muted-foreground">
                    {emailUpdates ? 'Receiving weekly highlights' : 'No email updates'}
                  </p>
                </div>
                <Switch 
                  checked={emailUpdates}
                  onCheckedChange={setEmailUpdates}
                />
              </motion.div>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="mb-4">Privacy</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <motion.div 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => {
                  setAccountPrivacy(accountPrivacy === 'Public' ? 'Private' : 'Public');
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Account Privacy</p>
                  <p className="text-sm text-muted-foreground">{accountPrivacy}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              
              <div className="border-t border-border" />
              
              <motion.div 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <div>
                  <p className="text-foreground">Blocked Accounts</p>
                  <p className="text-sm text-muted-foreground">Manage blocked users</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="mb-4">About</h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <motion.div 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                whileTap={{ scale: 0.98 }}
              >
                <p className="text-foreground">Version</p>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </motion.div>
              
              <div className="border-t border-border" />
              
              <motion.div 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <p className="text-foreground">Terms of Service</p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              
              <div className="border-t border-border" />
              
              <motion.div 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer flex items-center justify-between"
                whileTap={{ scale: 0.98 }}
              >
                <p className="text-foreground">Privacy Policy</p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
