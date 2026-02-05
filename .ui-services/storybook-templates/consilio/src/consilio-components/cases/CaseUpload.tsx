import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, Music, FolderOpen, Download, Trash2, Eye, Calendar, File, Image, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnifiedUpload } from '@/hooks/useUnifiedUpload';
import { useDriveImport, useDriveStatus } from '@/hooks/useDriveFiles';
import { useCaseDocuments, useFileUpload } from '@/hooks/useFileUpload';
import { DriveFilePicker } from '@/components/drive/DriveFilePicker';
import { UnifiedFileList } from './UnifiedFileList';
import { toast } from 'sonner';
import { SimpleDocumentViewer } from '@/components/documents/SimpleDocumentViewer';
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
import { formatDate } from '@/lib/date';
import { documentManagementService } from '@/services/document-management.service';
import type { DocumentManagement } from '@/types/document-management.types';
import {
  ALL_MIME_TYPES,
  detectFileCategory,
  validateFileSize,
  type FileCategory,
} from '@/lib/fileTypeUtils';

interface FileWithStatus {
  id: string;
  file: File;
  category: FileCategory;
  uploadStatus: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface CaseUploadProps {
  caseId: string;
}

export function CaseUpload({ caseId }: CaseUploadProps): React.ReactElement {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  // Hidden file input ref for manual file picker
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { uploadFile, uploadProgress, isUploading } = useUnifiedUpload();
  const driveImport = useDriveImport();
  const { data: driveStatus } = useDriveStatus();
  const { data: allDocuments, isLoading: documentsLoading, refetch: refetchDocuments } = useCaseDocuments(caseId);
  const { deleteMutation } = useFileUpload();

  // Filter to only show uploaded documents (not AI-generated)
  const uploadedDocuments = allDocuments?.filter((doc) => doc.source === 'UPLOAD' || doc.source === 'DRIVE');

  // Unified drop handler for all file types
  const onDropFiles = React.useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    console.log('[CaseUpload] onDropFiles called');
    console.log('[CaseUpload] Accepted files:', acceptedFiles);
    console.log('[CaseUpload] Rejected files:', rejectedFiles);

    if (rejectedFiles.length > 0) {
      console.warn('[CaseUpload] Some files were rejected:', rejectedFiles);
      rejectedFiles.forEach((rejected) => {
        console.warn('[CaseUpload] Rejected file:', {
          file: rejected.file.name,
          errors: rejected.errors,
        });
      });
      toast.error('Vissa filer kunde inte väljas. Kontrollera filtyp och storlek.');
    }

    const filesWithStatus: FileWithStatus[] = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      category: detectFileCategory(file),
      uploadStatus: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...filesWithStatus]);

    console.log('[CaseUpload] Added files:', filesWithStatus.length);
  }, []);

  // Unified dropzone with custom validator for file sizes
  const unifiedDropzone = useDropzone({
    onDrop: onDropFiles,
    accept: ALL_MIME_TYPES,
    validator: (file) => {
      const validation = validateFileSize(file);
      if (!validation.valid) {
        return {
          code: 'file-too-large',
          message: validation.error || 'Filen är för stor',
        };
      }
      return null;
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
    disabled: false,
  });

  // Unified upload handler
  const uploadSingleFile = async (fileWithStatus: FileWithStatus) => {
    const { id, file, category } = fileWithStatus;

    console.log('[CaseUpload] Starting unified upload:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
      caseId,
    });

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, uploadStatus: 'uploading' } : f))
    );

    try {
      const result = await uploadFile({ file, caseId });

      console.log('[CaseUpload] Upload successful:', result);

      // Update status to success
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, uploadStatus: 'success' } : f))
      );

      // Show success toast based on category
      if (category === 'email' && result.emailsProcessed !== undefined) {
        toast.success(`${result.emailsProcessed} e-postmeddelanden importerade`);
      } else if (category === 'audio') {
        toast.success(`${file.name} uppladdad - transkribering startad`);
      } else {
        toast.success(`${file.name} uppladdad`);
      }

      // Refresh documents list
      refetchDocuments();

      // Auto-process document for AI (if applicable and if we have an ID)
      // NOTE: Audio files cannot be auto-processed immediately after upload because:
      // 1. The transcript document is created asynchronously by the transcription worker
      // 2. It would fail with DOCUMENT_NOT_FOUND error
      // 3. Auto-processing will be triggered after transcription completes
      if (category === 'document' && result.id) {
        try {
          await documentManagementService.processDocument(result.id);
          console.log('[CaseUpload] Document auto-processed:', result.id);
        } catch (processError) {
          console.error('[CaseUpload] Auto-processing failed:', processError);
          // Don't fail the upload, just log the error
        }
      }
      // Note: Audio and email files are processed asynchronously after completion
    } catch (error) {
      console.error('[CaseUpload] Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Uppladdning misslyckades';
      console.error('[CaseUpload] Error message:', errorMessage);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                uploadStatus: 'error',
                error: errorMessage,
              }
            : f
        )
      );
      toast.error(`Misslyckades att ladda upp ${file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = files.filter((f) => f.uploadStatus === 'pending');
    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }
  };

  const handleDriveFileSelect = async (fileId: string, fileName: string) => {
    console.log('[CaseUpload] Starting Drive import:', {
      fileId,
      fileName,
      caseId,
    });

    if (!caseId) {
      console.error('[CaseUpload] Missing caseId for Drive import');
      toast.error('Kunde inte importera fil: saknar case ID');
      return;
    }

    const toastId = toast.loading(`Importerar ${fileName} från Drive...`);

    try {
      const result = await driveImport.mutateAsync({
        fileId,
        caseId,
      });
      console.log('[CaseUpload] Drive import successful:', result);
      toast.success(`${fileName} importerad från Drive`, { id: toastId });
      setShowDrivePicker(false);
      refetchDocuments(); // Refresh the uploaded documents list

      // Auto-process imported document for AI
      if (result && typeof result === 'object' && 'id' in result && result.id) {
        try {
          await documentManagementService.processDocument(result.id as string);
          console.log('[CaseUpload] Drive document auto-processed:', result.id);
        } catch (processError) {
          console.error('[CaseUpload] Auto-processing failed:', processError);
          // Don't fail the import, just log the error
        }
      }
    } catch (error) {
      console.error('[CaseUpload] Drive import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Misslyckades att importera från Drive';
      console.error('[CaseUpload] Error details:', {
        error,
        errorMessage,
        fileId,
        caseId,
      });
      toast.error(errorMessage, { id: toastId });
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDeleteUploadedDocument = (): void => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete, {
        onSuccess: () => {
          setDocumentToDelete(null);
          refetchDocuments();
          toast.success('Dokument borttaget');
        },
      });
    }
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
    if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
      return <Music className="h-5 w-5 text-purple-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const formatUploadedFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (file: FileWithStatus) => {
    switch (file.uploadStatus) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeIcon = (category: FileCategory): React.ReactNode => {
    switch (category) {
      case 'audio':
        return <Music className="h-8 w-8 text-purple-500 flex-shrink-0" />;
      case 'email':
        return <FileText className="h-8 w-8 text-green-500 flex-shrink-0" />;
      case 'document':
      default:
        return <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Unified Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ladda upp filer</CardTitle>
          <CardDescription>
            Dra och släpp filer eller klicka för att välja
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={Object.keys(ALL_MIME_TYPES).join(',')}
            style={{ display: 'none' }}
            onChange={(e) => {
              const fileList = Array.from(e.target.files || []);
              console.log('[CaseUpload] File input onChange:', fileList.length);
              onDropFiles(fileList, []);
              e.target.value = ''; // Reset for re-selection
            }}
          />

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                console.log('[CaseUpload] "Från dator" button clicked');
                fileInputRef.current?.click();
              }}
              className="h-20 flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              <span>Från dator</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                console.log('[CaseUpload] Drive button clicked');
                console.log('[CaseUpload] Drive status:', driveStatus);
                setShowDrivePicker(true);
              }}
              className="h-20 flex-col gap-2"
              disabled={!driveStatus?.connected}
            >
              <FolderOpen className="h-6 w-6" />
              <span>Från Drive</span>
              {!driveStatus?.connected && (
                <span className="text-xs text-muted-foreground">(Ej ansluten)</span>
              )}
            </Button>
          </div>

          {/* Unified dropzone */}
          <div
            {...unifiedDropzone.getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              unifiedDropzone.isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
          >
            <input {...unifiedDropzone.getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {unifiedDropzone.isDragActive ? (
              <p className="text-blue-600 font-medium">Släpp filen här...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">
                  Dra och släpp filer här, eller klicka för att välja
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Dokument: PDF, Word, bilder (max 100MB)</p>
                  <p>Ljud: MP3, WAV, M4A, MP4 (max 100MB)</p>
                  <p>E-post: EML, MBOX, PST, MSG (max 500MB)</p>
                </div>
              </div>
            )}
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Filer ({files.length})</h3>
                {files.some((f) => f.uploadStatus === 'pending') && (
                  <Button size="sm" onClick={uploadAllFiles}>
                    Ladda upp alla
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {files.map((file) => {
                  const progress = uploadProgress[file.file.name] || 0;

                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                      {getFileTypeIcon(file.category)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                          {getStatusIcon(file)}
                        </div>
                        <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>

                        {file.uploadStatus === 'uploading' && (
                          <Progress value={progress} className="mt-1 h-1" />
                        )}

                        {file.uploadStatus === 'error' && file.error && (
                          <p className="text-xs text-red-600 mt-1">{file.error}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {file.uploadStatus === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => uploadSingleFile(file)}>
                            Ladda upp
                          </Button>
                        )}
                        {file.uploadStatus === 'error' && (
                          <Button size="sm" variant="outline" onClick={() => uploadSingleFile(file)}>
                            Försök igen
                          </Button>
                        )}
                        {file.uploadStatus !== 'uploading' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified File List */}
      <UnifiedFileList
        documents={allDocuments as any}
        isLoading={documentsLoading}
        onDelete={(id) => {
          deleteMutation.mutate(id, {
            onSuccess: () => {
              refetchDocuments();
              toast.success('Fil borttagen');
            },
            onError: (error) => {
              const errorMessage = error instanceof Error ? error.message : 'Misslyckades att ta bort fil';
              toast.error(errorMessage);
            },
          });
        }}
        onPreview={(id) => setPreviewDocId(id)}
        deleteLoading={deleteMutation.isPending}
      />

      {/* Drive File Picker Dialog */}
      <DriveFilePicker
        open={showDrivePicker}
        onClose={() => setShowDrivePicker(false)}
        onSelectFile={handleDriveFileSelect}
        acceptedMimeTypes={Object.keys(ALL_MIME_TYPES)}
        title="Välj fil från Drive"
      />

      {/* Delete Confirmation Dialog - Kept for backward compatibility but handled by UnifiedFileList */}
      {/* This dialog is now managed within UnifiedFileList component */}

      {/* Document Preview Modal */}
      {previewDocId && (
        <SimpleDocumentViewer documentId={previewDocId} onClose={() => setPreviewDocId(null)} />
      )}
    </div>
  );
}
