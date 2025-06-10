import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: 'basic' | 'navigation' | 'advanced';
}

export function KeyboardShortcuts({ onClose }: KeyboardShortcutsProps) {
  const shortcuts: Shortcut[] = [
    // Basic controls
    { keys: ['Enter'], description: 'メッセージを送信', category: 'basic' },
    { keys: ['Esc'], description: '入力をクリア・パネルを閉じる', category: 'basic' },
    { keys: ['Space'], description: 'セッション開始/一時停止', category: 'basic' },
    
    // Navigation
    { keys: ['Shift', '?'], description: 'このヘルプを表示/非表示', category: 'navigation' },
    { keys: ['Ctrl/Cmd', 'S'], description: '応答提案の表示切替', category: 'navigation' },
    { keys: ['Ctrl/Cmd', 'A'], description: 'リアルタイム分析の表示切替', category: 'navigation' },
    
    // Advanced
    { keys: ['Ctrl/Cmd', 'Enter'], description: '強制送信', category: 'advanced' },
    { keys: ['Tab'], description: '提案されたレスポンスの選択', category: 'advanced' },
  ];

  const getCategoryColor = (category: Shortcut['category']) => {
    switch (category) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'navigation': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: Shortcut['category']) => {
    switch (category) {
      case 'basic': return '基本操作';
      case 'navigation': return 'ナビゲーション';
      case 'advanced': return '上級者向け';
      default: return 'その他';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <span>キーボードショートカット</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {['basic', 'navigation', 'advanced'].map((category) => {
          const categoryShortcuts = shortcuts.filter(s => s.category === category);
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(category as Shortcut['category'])}>
                  {getCategoryLabel(category as Shortcut['category'])}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 ヒント: これらのショートカットで効率的にトレーニングを進められます
          </p>
        </div>
      </CardContent>
    </Card>
  );
}