import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Download, Trash2, Eye, Calendar, FolderOpen, Search } from 'lucide-react';
import { FileTypeBadge } from './FileTypeBadge';
import { UploadFilters } from './UploadFilters';
import { useUploadFilters } from '@/hooks/useUploadFilters';
import { ProcessingStatusBadge, mapExtractionStatus } from './ProcessingStatusBadge';
import { useDocumentStatusPolling } from '@/hooks/useDocumentStatus';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

interface DocumentItem {
  id: string;
  title?: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | string;
  source: 'UPLOAD' | 'DRIVE' | 'GENERATED' | 'TRANSCRIBED';
  extraction_status?: 'pending' | 'processing' | 'completed' | 'failed' | null;
  extraction_error?: string;
  created_at: string;
}

interface UnifiedFileListProps {
  documents: DocumentItem[] | undefined;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onDownload?: (id: string) => void;
  deleteLoading?: boolean;
  onRetryProcess?: (id: string) => void;
}

export function UnifiedFileList({
  documents,
  isLoading,
  onDelete,
  onPreview,
  onDownload,
  deleteLoading,
  onRetryProcess,
}: UnifiedFileListProps): JSX.Element {
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  // Use the filter hook to handle filtering and sorting
  const {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    filteredDocuments,
    filterCounts,
    clearFilters,
    hasActiveFilters,
  } = useUploadFilters(documents);

  // Poll for document processing status updates
  const { isPolling, pendingCount } = useDocumentStatusPolling(filteredDocuments);

  const formatFileSize = (bytes: number | string): string => {
    const numBytes = Number(bytes);
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'PP', { locale: sv });
    } catch {
      return dateString;
    }
  };

  const getSourceBadge = (source: string): JSX.Element => {
    const config: Record<string, { label: string; variant: 'secondary' | 'outline' }> = {
      UPLOAD: { label: 'Uppladdad', variant: 'secondary' },
      DRIVE: { label: 'Drive', variant: 'outline' },
      TRANSCRIBED: { label: 'Transkriberad', variant: 'secondary' },
    };
    const sourceConfig = config[source] || config.UPLOAD;
    return (
      <Badge variant={sourceConfig.variant} className="text-xs">
        {sourceConfig.label}
      </Badge>
    );
  };

  const getFileCategoryFromMime = (mimeType: string): 'document' | 'audio' | 'email' => {
    if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) return 'audio';
    if (mimeType.includes('rfc822') || mimeType.includes('mbox') || mimeType.includes('outlook'))
      return 'email';
    return 'document';
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      onDelete(documentToDelete);
      setDocumentToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Uppladdade filer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Uppladdade filer ({filterCounts.all || 0})
            {isPolling && (
              <span className="ml-2 text-xs text-muted-foreground animate-pulse">
                ({pendingCount} bearbetar...)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls - only show if there are files */}
          {filterCounts.all > 0 && (
            <UploadFilters
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterCounts={filterCounts}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          {/* File list */}
          {filteredDocuments.length === 0 ? (
            hasActiveFilters ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Inga filer matchar din sökning</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Rensa filter
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Inga filer uppladdade ännu</p>
                <p className="text-sm mt-1">Dra och släpp filer i området ovan</p>
              </div>
            )
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* File Type Badge */}
                  <FileTypeBadge mimeType={document.mime_type} />

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {document.title || document.file_name}
                      </p>
                      {getSourceBadge(document.source)}
                      {/* Processing Status Badge */}
                      <ProcessingStatusBadge
                        status={mapExtractionStatus(
                          document.extraction_status,
                          getFileCategoryFromMime(document.mime_type)
                        )}
                        fileCategory={getFileCategoryFromMime(document.mime_type)}
                        onRetry={onRetryProcess ? () => onRetryProcess(document.id) : undefined}
                        showProgress={true}
                        createdAt={document.created_at}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="truncate max-w-[150px]">{document.file_name}</span>
                      <span>{formatFileSize(document.size_bytes)}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(document.created_at)}
                      </span>
                    </div>
                    {/* Error Message for Failed Processing */}
                    {document.extraction_status === 'failed' && document.extraction_error && (
                      <p className="text-xs text-red-500 mt-1 truncate max-w-[300px]">
                        {document.extraction_error}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPreview(document.id)}
                      title="Visa"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onDownload && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDownload(document.id)}
                        title="Ladda ner"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDocumentToDelete(document.id)}
                      title="Ta bort"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Är du säker?</AlertDialogTitle>
            <AlertDialogDescription>
              Filen kommer att tas bort permanent. Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Tar bort...' : 'Ta bort'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
