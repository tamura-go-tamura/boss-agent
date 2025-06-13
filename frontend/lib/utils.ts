import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateStressLevel(
  responseTime: number,
  messageLength: number,
  sentiment?: number
): number {
  // Basic stress calculation algorithm
  // Higher response time and shorter messages = higher stress
  // Sentiment: -1 (negative) to 1 (positive)
  
  const timeStress = Math.min(responseTime / 30000, 1); // Normalize to 30 seconds max
  const lengthStress = Math.max(0, (50 - messageLength) / 50); // Shorter = more stress
  const sentimentStress = sentiment ? Math.max(0, (1 - sentiment) / 2) : 0.5;
  
  return Math.round((timeStress * 0.4 + lengthStress * 0.3 + sentimentStress * 0.3) * 100);
}
