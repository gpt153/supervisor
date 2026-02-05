import { Badge } from '@/components/ui/badge';
import { FileText, Music, Mail, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileType = 'pdf' | 'word' | 'image' | 'audio' | 'email' | 'other';

interface FileTypeBadgeProps {
  mimeType: string;
  className?: string;
}

const typeConfig: Record<FileType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'bg-red-100 text-red-700 border-red-200' },
  word: { label: 'DOC', icon: FileText, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  image: { label: 'Bild', icon: Image, color: 'bg-green-100 text-green-700 border-green-200' },
  audio: { label: 'Ljud', icon: Music, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  email: { label: 'E-post', icon: Mail, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  other: { label: 'Fil', icon: File, color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

function getFileType(mimeType: string): FileType {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) return 'audio';
  if (mimeType.includes('rfc822') || mimeType.includes('mbox') || mimeType.includes('outlook')) return 'email';
  return 'other';
}

export function FileTypeBadge({ mimeType, className }: FileTypeBadgeProps): JSX.Element {
  const fileType = getFileType(mimeType);
  const config = typeConfig[fileType];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 font-medium', config.color, className)}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
