import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUpload";
import {
  Upload,
  Download,
  File,
  Image,
  FileText,
  Folder,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Eye
} from "lucide-react";

interface ProjectFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  folder_path: string;
  created_at: string;
  task_id?: string;
  uploader?: {
    full_name: string;
  };
}

interface FileRepositoryProps {
  projectId: string;
  userRole: string;
}

export const FileRepository = ({ projectId, userRole }: FileRepositoryProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("/");
  const [folders, setFolders] = useState<string[]>(["/"]);

  // Upload form state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState("/");
  const [uploadTaskId, setUploadTaskId] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from("project_files")
          .select(`
            *,
            uploader:uploaded_by (full_name)
          `)
          .eq("project_id", projectId)
          .eq("folder_path", selectedFolder)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFiles(data || []);

        const { data: allFiles, error: folderError } = await supabase
          .from("project_files")
          .select("folder_path")
          .eq("project_id", projectId);

        if (!folderError && allFiles) {
          const uniqueFolders = [...new Set(allFiles.map(f => f.folder_path))];
          setFolders(uniqueFolders);
        }
      } catch (error: unknown) {
        console.error("Error fetching files:", error);
        toast({
          title: "Error",
          description: "Failed to load files",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [projectId, selectedFolder, toast]);

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not authenticated");

      const uploadPromises = selectedFiles.map(async (file) => {
        // Upload file to storage
        const uploadResult = await fileUploadService.uploadFile(file, 'project-files');

        // Save file metadata to database
        const { data, error } = await supabase
          .from("project_files")
          .insert({
            project_id: projectId,
            task_id: uploadTaskId || null,
            file_name: file.name,
            file_path: uploadResult.url,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: session.user.id,
            folder_path: uploadFolder
          })
          .select()
          .single();

        if (error) throw error;

        // Log activity
        await supabase
          .from("project_activities")
          .insert({
            project_id: projectId,
            user_id: session.user.id,
            activity_type: 'file_uploaded',
            description: `Uploaded file: ${file.name}`,
            metadata: { file_id: data.id, file_size: file.size }
          });

        return data;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Files uploaded",
        description: `${selectedFiles.length} file(s) uploaded successfully`
      });

      setShowUploadDialog(false);
      setSelectedFiles([]);
      setUploadTaskId("");
      fetchFiles();
    } catch (error: unknown) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (file: ProjectFile) => {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = file.file_path;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: `Downloading ${file.file_name}`
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const downloadAllFiles = async () => {
    try {
      // This would typically create a ZIP file on the server
      // For now, we'll just download individual files
      toast({
        title: "Download all files",
        description: "This feature is coming soon. Please download files individually for now."
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download files",
        variant: "destructive"
      });
    }
  };

  const deleteFile = async (fileId: string, fileName: string) => {
    try {
      const { error } = await supabase
        .from("project_files")
        .delete()
        .eq("id", fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(f => f.id !== fileId));

      toast({
        title: "File deleted",
        description: `${fileName} has been deleted`
      });
    } catch (error: unknown) {
      console.error("Error deleting file:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-green-500" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="glass-effect border-border p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">File Repository</h2>
          <p className="text-muted-foreground">Manage project files and documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={downloadAllFiles}
            className="glass-effect"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-blue-500">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Files</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setSelectedFiles(files);
                    }}
                    className="w-full mt-2 p-2 border border-border rounded-lg bg-background"
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {selectedFiles.length} file(s) selected
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Folder</label>
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full mt-2 p-2 border border-border rounded-lg bg-background"
                    >
                      {folders.map(folder => (
                        <option key={folder} value={folder}>
                          {folder === '/' ? 'Root' : folder}
                        </option>
                      ))}
                      <option value="new">+ Create new folder</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Related Task (Optional)</label>
                    <Input
                      value={uploadTaskId}
                      onChange={(e) => setUploadTaskId(e.target.value)}
                      placeholder="Task ID"
                      className="glass-effect border-border mt-2"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadDialog(false);
                      setSelectedFiles([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={uploadFiles}
                    disabled={uploading || selectedFiles.length === 0}
                    className="bg-gradient-to-r from-primary to-blue-500"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folder Navigation */}
      <Card className="glass-effect border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Folder className="h-5 w-5" />
          <span className="font-medium">Current Folder:</span>
          <span className="text-muted-foreground">
            {selectedFolder === '/' ? 'Root' : selectedFolder}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {folders.map(folder => (
            <Button
              key={folder}
              variant={selectedFolder === folder ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFolder(folder)}
              className="glass-effect"
            >
              {folder === '/' ? 'Root' : folder.split('/').pop()}
            </Button>
          ))}
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="glass-effect border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-effect border-border"
          />
        </div>
      </Card>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFiles.length === 0 ? (
          <Card className="glass-effect border-border p-8 text-center col-span-full">
            <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Upload your first file to get started'}
            </p>
          </Card>
        ) : (
          filteredFiles.map((file) => (
            <Card key={file.id} className="glass-effect border-border p-4 hover-scale">
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(file.file_type)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {/* Open context menu */}}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <h4 className="font-medium text-sm mb-2 line-clamp-2">{file.file_name}</h4>

              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Size: {formatFileSize(file.file_size)}</p>
                <p>Uploaded by: {file.uploader?.full_name || 'Unknown'}</p>
                <p>{new Date(file.created_at).toLocaleDateString()}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadFile(file)}
                  className="flex-1 glass-effect"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                {file.file_type.startsWith('image/') && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(file.file_path, '_blank')}
                    className="glass-effect"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteFile(file.id, file.file_name)}
                  className="glass-effect text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};