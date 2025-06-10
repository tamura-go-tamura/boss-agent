import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, Clock } from 'lucide-react';

interface ResponseSuggestion {
  text: string;
  type: 'safe' | 'confident' | 'diplomatic';
  explanation: string;
}

interface ResponseSuggestionsProps {
  bossMessage: string;
  bossType: string;
  userStressLevel: number;
  onSuggestionSelect: (text: string) => void;
  isVisible: boolean;
}

export function ResponseSuggestions({ 
  bossMessage, 
  bossType, 
  userStressLevel, 
  onSuggestionSelect,
  isVisible 
}: ResponseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);

  useEffect(() => {
    if (isVisible && bossMessage) {
      generateSuggestions();
    }
  }, [bossMessage, bossType, userStressLevel, isVisible]);

  const generateSuggestions = () => {
    const messageType = analyzeBossMessage(bossMessage);
    const baseSuggestions = getSuggestionsForType(messageType, bossType);
    
    // Adjust suggestions based on user stress level
    const adjustedSuggestions = baseSuggestions.map(suggestion => ({
      ...suggestion,
      text: adjustForStressLevel(suggestion.text, userStressLevel)
    }));

    setSuggestions(adjustedSuggestions);
  };

  const analyzeBossMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('締切') || lowerMessage.includes('急ぎ') || lowerMessage.includes('緊急')) return 'deadline';
    if (lowerMessage.includes('問題') || lowerMessage.includes('課題') || lowerMessage.includes('トラブル')) return 'problem';
    if (lowerMessage.includes('良い') || lowerMessage.includes('素晴らしい') || lowerMessage.includes('よくやった')) return 'praise';
    if (lowerMessage.includes('期待していた') || lowerMessage.includes('がっかり') || lowerMessage.includes('不十分')) return 'criticism';
    if (lowerMessage.includes('会議') || lowerMessage.includes('話し合い') || lowerMessage.includes('相談')) return 'meeting';
    
    return 'general';
  };

  const getSuggestionsForType = (messageType: string, bossType: string): ResponseSuggestion[] => {
    const suggestions: Record<string, ResponseSuggestion[]> = {
      deadline: [
        {
          text: "緊急性を理解しました。これを優先して、〇時までに進捗をご報告いたします。",
          type: 'safe',
          explanation: '責任感を示しながら明確な期待値を設定'
        },
        {
          text: "この締切は達成できます。他の優先事項を調整する必要がありますが、進めてよろしいでしょうか？",
          type: 'confident',
          explanation: '能力を示しながらトレードオフを明確化'
        },
        {
          text: "品質の高い成果物をお渡ししたいと思います。最も重要な点について話し合えますでしょうか？",
          type: 'diplomatic',
          explanation: '品質へのコミットメントを示しながら対話を促進'
        }
      ],
      problem: [
        {
          text: "問題を認識しました。調査して〇時までに解決策をご提示いたします。",
          type: 'safe',
          explanation: '問題を認識し、解決へのコミットメントを示す'
        },
        {
          text: "いくつかの原因を特定しました。こちらが私の推奨する解決アプローチです。",
          type: 'confident',
          explanation: '問題解決への主体性を示す'
        },
        {
          text: "ご懸念を理解しています。詳細を調査して選択肢をご提示いたします。",
          type: 'diplomatic',
          explanation: '懸念を受け入れながら体系的なアプローチを示す'
        }
      ],
      praise: [
        {
          text: "フィードバックをありがとうございます。このアプローチがうまくいって良かったです。",
          type: 'safe',
          explanation: '称賛を謙虚に受け入れる'
        },
        {
          text: "評価していただき、ありがとうございます。この成功を今後のプロジェクトにも活かしたいと思います。",
          type: 'confident',
          explanation: '称賛を将来の機会に活用'
        },
        {
          text: "ありがとうございます。うまくいった点をチームと共有できれば嬉しいです。",
          type: 'diplomatic',
          explanation: 'チーム思考を示す'
        }
      ],
      criticism: [
        {
          text: "ご懸念を理解しています。具体的にどの分野を改善すべきでしょうか？",
          type: 'safe',
          explanation: 'フィードバックを受け入れ、具体的なガイダンスを求める'
        },
        {
          text: "おっしゃる通りです。この経験から学び、次回はこのようにアプローチします。",
          type: 'confident',
          explanation: '学習と前向きな思考を示す'
        },
        {
          text: "率直なフィードバックをありがとうございます。今後のプロジェクトでの成功の定義について話し合えますでしょうか？",
          type: 'diplomatic',
          explanation: '批判を明確化の機会として再構成'
        }
      ],
      general: [
        {
          text: "承知いたしました。何が必要か詳しく教えていただけますでしょうか？",
          type: 'safe',
          explanation: '安全な応答で明確化を求める'
        },
        {
          text: "このアプローチについていくつかアイデアがあります。共有させていただいてもよろしいでしょうか？",
          type: 'confident',
          explanation: '主体性と積極的な思考を示す'
        },
        {
          text: "良い指摘ですね。最適な対処法について考えさせてください。",
          type: 'diplomatic',
          explanation: 'インプットを認めながら考える時間を確保'
        }
      ]
    };

    return suggestions[messageType] || suggestions.general;
  };

  const adjustForStressLevel = (text: string, stressLevel: number): string => {
    // If stress is high (>70), make responses more cautious
    if (stressLevel > 70) {
      return text.replace(/できます/g, 'できると思います')
                 .replace(/いたします/g, 'いたしたいと思います')
                 .replace(/こちらが/g, 'こちらが私の考える');
    }
    
    // If stress is very low (<30), responses can be more direct
    if (stressLevel < 30) {
      return text.replace(/できますでしょうか/g, 'しましょう')
                 .replace(/と思います/g, '')
                 .replace(/いかがでしょうか/g, 'ことをお勧めします');
    }
    
    return text;
  };

  const getTypeColor = (type: ResponseSuggestion['type']) => {
    switch (type) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'confident': return 'bg-blue-100 text-blue-800';
      case 'diplomatic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: ResponseSuggestion['type']) => {
    switch (type) {
      case 'safe': return '🛡️';
      case 'confident': return '💪';
      case 'diplomatic': return '🤝';
      default: return '💭';
    }
  };

  const getTypeLabel = (type: ResponseSuggestion['type']) => {
    switch (type) {
      case 'safe': return '安全';
      case 'confident': return '自信';
      case 'diplomatic': return '外交的';
      default: return 'その他';
    }
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <div className="flex items-center space-x-2 mb-3">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <h4 className="text-sm font-medium text-blue-900">応答提案</h4>
        <Badge variant="secondary" className="text-xs">
          ストレスレベル: {userStressLevel}%
        </Badge>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                <Badge className={`text-xs ${getTypeColor(suggestion.type)}`}>
                  {getTypeLabel(suggestion.type)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionSelect(suggestion.text)}
                className="text-xs"
              >
                使用する
              </Button>
            </div>
            
            <p className="text-sm text-gray-800 mb-2 leading-relaxed">
              "{suggestion.text}"
            </p>
            
            <p className="text-xs text-gray-600 italic">
              💡 {suggestion.explanation}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-blue-200">
        <p className="text-xs text-blue-700">
          💡 Tip: Choose responses that match your communication style and the situation context.
        </p>
      </div>
    </div>
  );
}
