'use client';

import { useState } from 'react';
import { ChevronDown, MoreVertical, Pencil, Palette, Trash2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  accentColor: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  hidden?: boolean;
  onToggleVisibility?: () => void;
  showMenu?: boolean;
  onRename?: () => void;
  onChangeColor?: () => void;
  onDelete?: () => void;
}

const accentColors: Record<string, string> = {
  purple: 'border-l-violet-400',
  green: 'border-l-emerald-400',
  pink: 'border-l-pink-400',
  rose: 'border-l-rose-400',
  amber: 'border-l-amber-400',
  blue: 'border-l-blue-400',
  teal: 'border-l-teal-400',
  orange: 'border-l-orange-400',
};

export function SectionCard({
  title,
  icon,
  accentColor,
  children,
  defaultExpanded = true,
  hidden = false,
  onToggleVisibility,
  showMenu = false,
  onRename,
  onChangeColor,
  onDelete,
}: SectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        'h-full bg-white/5 backdrop-blur-md rounded-2xl border-l-4 shadow-sm overflow-hidden transition-all duration-300',
        accentColors[accentColor] || 'border-l-gray-400',
        hidden && 'opacity-50'
      )}
    >
      <div className="w-full flex items-center justify-between px-4 py-3">
        <button
          onClick={() => !hidden && setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          {icon && <span className="flex items-center text-violet-400">{icon}</span>}
          <h3 className={cn('font-serif font-semibold text-violet-100', hidden && 'text-violet-300')}>{title}</h3>
        </button>
        <div className="flex items-center gap-1">
          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              title={hidden ? 'Show section' : 'Hide section'}
            >
              {hidden ? (
                <EyeOff className="w-4 h-4 text-violet-400/50" />
              ) : (
                <Eye className="w-4 h-4 text-violet-400/50 hover:text-violet-300" />
              )}
            </button>
          )}
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRename}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onChangeColor}>
                  <Palette className="w-4 h-4 mr-2" />
                  Change Color
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!hidden && (
            <ChevronDown
              className={cn(
                'w-5 h-5 text-muted-foreground transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          )}
        </div>
      </div>
      {!hidden && (
        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
