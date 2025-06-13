interface TypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
}

export function TypingIndicator({ isTyping, userName = "Boss" }: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-white border shadow-sm rounded-lg px-4 py-3 max-w-[200px]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500">{userName} が入力中...</span>
        </div>
      </div>
    </div>
  );
}