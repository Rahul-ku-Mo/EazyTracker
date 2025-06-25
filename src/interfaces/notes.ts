import { ArrowRight, Plus, FileText, Calendar, Users, RotateCcw, Star } from "lucide-react";

export interface Cover {
  type: "image" | "color";
  value: string; // URL for image, hex code for color
}

export interface Note {
    id: string;
    title: string;
    content: string;
    icon: string;
    iconColor: string;
    isCompleted: boolean;
    isPublic: boolean;
    priority?: number;
    emoji?: string;
    cover?: Cover;
    createdAt: string;
    updatedAt: string;
    category?: {
      id: string;
      name: string;
      slug: string;
    };
  }

  
export interface Category {
    id: string;
    name: string;
    slug: string;
    hoverColor: string;
    isDefault: boolean;
    notes: Note[];
    createdAt: string;
    updatedAt: string;
}

export const iconMap = {
    RotateCcw: RotateCcw,
    Star: Star,
    Calendar: Calendar,
    Users: Users,
    FileText: FileText,
    Plus: Plus,
    ArrowRight: ArrowRight,
};

export type IconName = keyof typeof iconMap;

