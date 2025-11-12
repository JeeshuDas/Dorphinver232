import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

export function BackendStartupGuide() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showWindows, setShowWindows] = useState(true);

  const commands = [
    { id: 1, cmd: 'cd local-backend', desc: 'Navigate to backend folder' },
    { id: 2, cmd: 'npm install', desc: 'Install dependencies (first time only)' },
    { id: 3, cmd: 'npm start', desc: 'Start the backend server' },
  ];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Platform Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setShowWindows(true)}
          className={`flex-1 px-3 py-2 rounded-md transition-all ${
            showWindows
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <span className="text-sm font-medium">Windows</span>
        </button>
        <button
          onClick={() => setShowWindows(false)}
          className={`flex-1 px-3 py-2 rounded-md transition-all ${
            !showWindows
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          }`}
        >
          <span className="text-sm font-medium">Mac/Linux</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={showWindows ? 'windows' : 'unix'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {showWindows ? (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  One-Click Method (Easiest)
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Find <code className="px-2 py-0.5 bg-muted rounded">start-backend.bat</code> in your project folder</li>
                  <li>2. Double-click it</li>
                  <li>3. Wait for "✅ Server running on: http://localhost:5000"</li>
                  <li>4. Done! ✨</li>
                </ol>
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              <div>
                <h4 className="text-sm font-medium mb-2">Command Prompt Method</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Win + R</kbd>, type <code>cmd</code>, press Enter, then run:
                </p>
                {commands.map((item, index) => (
                  <div key={item.id} className="mb-2">
                    <div className="flex items-center gap-2 bg-slate-950 text-green-400 px-3 py-2 rounded-md font-mono text-sm group">
                      <span className="text-slate-500 select-none">❯</span>
                      <span className="flex-1">{item.cmd}</span>
                      <button
                        onClick={() => copyToClipboard(item.cmd, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  One-Click Method (Easiest)
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li>1. Open Terminal (<kbd className="px-2 py-0.5 bg-muted rounded text-xs">Cmd + Space</kbd> → "Terminal")</li>
                  <li>2. Drag <code className="px-2 py-0.5 bg-muted rounded">start-backend.sh</code> into Terminal</li>
                  <li>3. Press Enter</li>
                  <li>4. Done! ✨</li>
                </ol>
              </div>

              <div className="text-center text-sm text-muted-foreground">OR</div>

              <div>
                <h4 className="text-sm font-medium mb-2">Terminal Method</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Open Terminal and run these commands:
                </p>
                {commands.map((item, index) => (
                  <div key={item.id} className="mb-2">
                    <div className="flex items-center gap-2 bg-slate-950 text-green-400 px-3 py-2 rounded-md font-mono text-sm group">
                      <span className="text-slate-500 select-none">$</span>
                      <span className="flex-1">{item.cmd}</span>
                      <button
                        onClick={() => copyToClipboard(item.cmd, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Success Indicator */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
        <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
          ✅ You'll know it's working when:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1 ml-4">
          <li>• Terminal shows "✅ Server running on: http://localhost:5000"</li>
          <li>• This yellow banner disappears automatically</li>
          <li>• Upload button becomes functional</li>
        </ul>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <a
          href="http://localhost:5000/health"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full text-xs">
            <ExternalLink className="w-3 h-3 mr-1" />
            Test Connection
          </Button>
        </a>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}
