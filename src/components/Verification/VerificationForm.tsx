import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fileUploadService } from "@/services/fileUpload";
import {
  Mail,
  Phone,
  FileText,
  CreditCard,
  Upload,
  X
} from "lucide-react";

interface VerificationFormProps {
  verificationType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerificationForm = ({ verificationType, onClose, onSuccess }: VerificationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const getFormConfig = (type: string) => {
    switch (type) {
      case 'email':
        return {
          title: 'Verify Email Address',
          description: 'We\'ll send a verification code to confirm your email',
          icon: <Mail className="h-6 w-6" />,
          fields: [
            { name: 'email', label: 'Email Address', type: 'email', required: true }
          ]
        };
      case 'phone':
        return {
          title: 'Verify Phone Number',
          description: 'We\'ll send an SMS with a verification code',
          icon: <Phone className="h-6 w-6" />,
          fields: [
            { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+1 (555) 123-4567' }
          ]
        };
      case 'id_document':
        return {
          title: 'Verify Identity',
          description: 'Upload a government-issued ID (passport, driver\'s license, etc.)',
          icon: <FileText className="h-6 w-6" />,
          fields: [
            { name: 'document_type', label: 'Document Type', type: 'select', required: true, options: ['passport', 'drivers_license', 'national_id', 'other'] },
            { name: 'document_number', label: 'Document Number', type: 'text', required: true },
            { name: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
          ],
          allowFiles: true,
          maxFiles: 2
        };
      case 'payment_method':
        return {
          title: 'Verify Payment Method',
          description: 'Connect and verify your payment method for secure transactions',
          icon: <CreditCard className="h-6 w-6" />,
          fields: [
            { name: 'payment_type', label: 'Payment Type', type: 'select', required: true, options: ['bank_account', 'paypal', 'stripe', 'other'] },
            { name: 'account_holder', label: 'Account Holder Name', type: 'text', required: true }
          ]
        };
      default:
        return {
          title: 'Verification Request',
          description: 'Submit your verification request',
          icon: <FileText className="h-6 w-6" />,
          fields: []
        };
    }
  };

  const config = getFormConfig(verificationType);

  const handleInputChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (config.maxFiles && fileArray.length > config.maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${config.maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }
    setUploadedFiles(fileArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const submittedData = { ...formData };

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const uploadPromises = uploadedFiles.map(file => fileUploadService.uploadFile(file, 'verification'));
        const uploadResults = await Promise.all(uploadPromises);
        submittedData.files = uploadResults.map(result => result.url);
      }

      // Submit verification request
      const { error } = await supabase
        .from('verifications')
        .insert({
          user_id: session.user.id,
          verification_type: verificationType,
          submitted_data: submittedData,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Verification submitted!',
        description: 'Your verification request has been submitted for review'
      });

      onSuccess();
    } catch (error: unknown) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit verification',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: unknown) => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-background"
            required={field.required}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <Textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="glass-effect border-border"
          />
        );
      default:
        return (
          <Input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="glass-effect border-border"
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {config.icon}
            {config.title}
          </DialogTitle>
          <p className="text-muted-foreground">{config.description}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}

          {config.allowFiles && (
            <div>
              <Label className="text-sm font-medium">
                Upload Files {config.maxFiles && `(Max ${config.maxFiles})`}
              </Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple={config.maxFiles > 1}
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload files
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, PDF up to 10MB each
                    </p>
                  </div>
                </Label>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-blue-500"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};