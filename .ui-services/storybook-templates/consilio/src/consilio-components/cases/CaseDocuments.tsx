import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Trash2,
  FolderTree,
  Calendar,
  File,
  FileArchive,
  Image,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { SimpleDocumentViewer } from '@/components/documents/SimpleDocumentViewer';
import { DocumentGenerationButtons } from '@/features/documents/components/DocumentGenerationButtons';
import { useCaseDocuments, useFileUpload } from '@/hooks/useFileUpload';
import { formatDate } from '@/lib/date';
import { documentManagementService } from '@/services/document-management.service';
import type { DocumentManagement } from '@/types/document-management.types';

interface CaseDocumentsProps {
  caseId: string;
}

export function CaseDocuments({ caseId }: CaseDocumentsProps): JSX.Element {
  const navigate = useNavigate();
  const { data: allDocuments, isLoading, refetch } = useCaseDocuments(caseId);
  const { deleteMutation } = useFileUpload();
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  // Show AI-generated documents AND extracted reports (which may have source='UPLOAD' or 'GENERATED')
  // Extracted reports have parent_document_id set
  const documents = allDocuments?.filter((doc) =>
    doc.source === 'GENERATED' ||
    (doc.source === 'UPLOAD' && doc.file_name?.match(/månadsrapport|handledarrapport/i))
  );

  const processMutation = useMutation({
    mutationFn: (documentId: string) => documentManagementService.processDocument(documentId),
    onSuccess: (data) => {
      refetch();
      setProcessingDocId(null);

      // Show toast notification based on extraction status
      if (data.extractionStatus === 'completed') {
        toast.success('Document processed successfully', {
          description: 'Text extracted and ready for analysis',
        });
      } else if (data.extractionStatus === 'failed') {
        toast.error('Failed to process document', {
          description: 'An error occurred during text extraction',
        });
      } else if (data.extractionStatus === 'pending') {
        toast.info('Document processing started', {
          description: 'Text extraction in progress',
        });
      }
    },
    onError: (error) => {
      console.error('Failed to process document:', error);
      setProcessingDocId(null);
      toast.error('Failed to process document', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });

  const handleDelete = (): void => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete, {
        onSuccess: () => {
          setDocumentToDelete(null);
        },
      });
    }
  };

  const handleProcess = (documentId: string): void => {
    setProcessingDocId(documentId);
    processMutation.mutate(documentId);
  };

  const handleBulkProcess = (): void => {
    const unprocessedDocs = documents?.filter(
      (doc) =>
        !doc.extraction_status ||
        doc.extraction_status === 'pending' ||
        doc.extraction_status === 'failed'
    ) || [];

    if (unprocessedDocs.length === 0) {
      toast.info('No documents to process', {
        description: 'All documents have already been processed',
      });
      return;
    }

    toast.info(`Processing ${unprocessedDocs.length} document${unprocessedDocs.length > 1 ? 's' : ''}...`, {
      description: 'This may take a few moments',
    });

    unprocessedDocs.forEach((doc) => {
      handleProcess(doc.id);
    });
  };


  const getExtractionStatusBadge = (status: string | null): React.ReactElement | null => {
    if (!status) return null;

    const variants = {
      pending: { variant: 'secondary' as const, text: 'Processing', icon: Loader2 },
      completed: { variant: 'default' as const, text: 'Processed', icon: CheckCircle2 },
      failed: { variant: 'destructive' as const, text: 'Failed', icon: AlertCircle },
      unsupported: { variant: 'secondary' as const, text: 'Unsupported', icon: AlertTriangle },
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="text-xs">
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getFileIcon = (document: DocumentManagement): React.ReactElement => {
    const mimeType = document.mime_type;
    if (mimeType === 'application/zip') {
      return <FileArchive className="h-5 w-5 text-purple-500" />;
    }
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (mimeType === 'application/pdf') {
      return <File className="h-5 w-5 text-red-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const groupedDocuments = documents?.reduce(
    (acc, doc) => {
      const key = doc.folder_path || 'root';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(doc);
      return acc;
    },
    {} as Record<string, DocumentManagement[]>
  );

  return (
    <div className="space-y-6">
      {/* Document Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Generera dokument med AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentGenerationButtons
            caseId={caseId}
            onDocumentSaved={() => refetch()}
          />
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              AI-genererade dokument ({documents?.length || 0})
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/documents/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Skapa nytt
              </Button>
              {documents && documents.some(
                (doc) =>
                  !doc.extraction_status ||
                  doc.extraction_status === 'pending' ||
                  doc.extraction_status === 'failed'
              ) && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleBulkProcess}
                  disabled={processMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process All Unprocessed
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8 text-muted-foreground">Laddar dokument...</div>
          )}

          {!isLoading && (!documents || documents.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Inga AI-genererade dokument ännu</p>
              <p className="text-sm">Använd knapparna ovan för att generera dokument</p>
            </div>
          )}

          {!isLoading && groupedDocuments && Object.keys(groupedDocuments).length > 0 && (
            <div className="space-y-6">
              {Object.entries(groupedDocuments).map(([folderPath, docs]) => (
                <div key={folderPath} className="space-y-2">
                  {folderPath !== 'root' && (
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <FolderTree className="h-4 w-4" />
                      <span>{folderPath}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    {docs.map((document) => (
                      <div
                        key={document.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {getFileIcon(document)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{document.title}</p>
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI-genererad
                            </Badge>
                            {document.extracted_from && (
                              <Badge variant="outline" className="text-xs">
                                Från ZIP
                              </Badge>
                            )}
                            {getExtractionStatusBadge(document.extraction_status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span>{document.file_name}</span>
                            <span>{formatFileSize(Number(document.size_bytes))}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(document.created_at, 'PPp')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {(!document.extraction_status ||
                            document.extraction_status === 'pending' ||
                            document.extraction_status === 'failed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcess(document.id)}
                              disabled={processingDocId === document.id || processMutation.isPending}
                              title="Process with AI"
                            >
                              {processingDocId === document.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewDocId(document.id)}
                            title="Visa dokument"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Ladda ner">
                            <Download className="h-4 w-4" />
                          </Button>
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
              Dokumentet kommer att tas bort permanent. Denna åtgärd kan inte ångras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Tar bort...' : 'Ta bort'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Preview Modal */}
      {previewDocId && (
        <SimpleDocumentViewer documentId={previewDocId} onClose={() => setPreviewDocId(null)} />
      )}
    </div>
  );
}
