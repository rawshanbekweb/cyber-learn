import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function translateLevel(level: "Beginner" | "Intermediate" | "Advanced") {
  return {
    Beginner: "Boshlang'ich",
    Intermediate: "O'rta",
    Advanced: "Yuqori",
  }[level]
}
