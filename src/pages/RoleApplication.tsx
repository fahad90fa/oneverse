import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { roleApplicationSchema } from '@/schemas/roleApplicationSchema';

const RoleApplication = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});

  const form = useForm({
    resolver: zodResolver(roleApplicationSchema),
    defaultValues: {
      role: (role as 'worker' | 'seller') || 'worker',
      fullName: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      linkedinUrl: '',
      websiteUrl: '',
      bio: '',
      skills: [],
      businessName: '',
      productCategories: [],
    },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId && role) {
      checkExistingApplication();
    }
  }, [userId, role]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
  };

  const checkExistingApplication = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('role_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .in('status', ['pending', 'approved']);

    if (data && data.length > 0) {
      setExistingApplication(data[0]);
      if (data[0].status === 'approved') {
        toast({
          title: 'Already Approved',
          description: 'Your role has already been approved!',
        });
        navigate(`/dashboard/${role}`);
      }
    }
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!userId) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${fieldName}-${Date.now()}.${fileExt}`;
    const filePath = `role-applications/${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });

    if (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: { ...file, url: publicUrl }
    }));

    toast({
      title: 'Upload Successful',
      description: `${fieldName} uploaded successfully`,
    });
  };

  const onSubmit = async (data: any) => {
    if (!userId) return;
    
    setIsSubmitting(true);

    try {
      const applicationData = {
        user_id: userId,
        role: role as 'worker' | 'seller',
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        address: data.address,
        city: data.city,
        province: data.province,
        postal_code: data.postalCode,
        linkedin_url: data.linkedinUrl || null,
        website_url: data.websiteUrl || null,
        bio: data.bio,
        skills: data.skills || [],
        business_name: data.businessName || null,
        product_categories: data.productCategories || [],
        profile_image_url: uploadedFiles.profileImage?.url || null,
        resume_url: uploadedFiles.resume?.url || null,
        cnic_url: uploadedFiles.cnic?.url || null,
        status: 'pending',
      };

      if (existingApplication?.id) {
        const { error } = await supabase
          .from('role_applications')
          .update({
            ...applicationData,
            submission_count: existingApplication.submission_count + 1,
          })
          .eq('id', existingApplication.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_applications')
          .insert([applicationData]);

        if (error) throw error;
      }

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted. An admin will review and notify you by email.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role || !['worker', 'seller'].includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertCircle className="w-5 h-5" />
            <h1>Invalid Role</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Please access this page with a valid role (worker or seller).
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  const isWorker = role === 'worker';
  const roleTitle = isWorker ? 'Worker' : 'Seller';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">
                Apply as {roleTitle}
              </h1>
              <p className="text-muted-foreground">
                Complete your profile to get started on OneVerse
              </p>
            </div>

            {existingApplication?.status === 'rejected' && (
              <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-900">
                  Your previous application was rejected. You cannot reapply.
                </p>
                {existingApplication.admin_notes && (
                  <p className="text-xs text-amber-800 mt-2">
                    Reason: {existingApplication.admin_notes}
                  </p>
                )}
              </div>
            )}

            {existingApplication?.status === 'pending' && (
              <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  Your application is pending review. An admin will notify you by email.
                </p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Personal Information</h2>

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Your full name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1 (555) 000-0000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Street address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Province" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Postal code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Documents */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Documents</h2>

                  <FormField
                    control={form.control}
                    name="cnic"
                    render={() => (
                      <FormItem>
                        <FormLabel>National ID / CNIC *</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                            <input
                              type="file"
                              className="hidden"
                              id="cnic-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('cnic', file);
                              }}
                              accept="image/*,.pdf"
                            />
                            <label htmlFor="cnic-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">Upload CNIC/ID</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or PDF</p>
                            </label>
                            {uploadedFiles.cnic && (
                              <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">Uploaded</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="profileImage"
                    render={() => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                            <input
                              type="file"
                              className="hidden"
                              id="profile-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('profileImage', file);
                              }}
                              accept="image/*"
                            />
                            <label htmlFor="profile-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">Upload Profile Photo</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG</p>
                            </label>
                            {uploadedFiles.profileImage && (
                              <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">Uploaded</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resume"
                    render={() => (
                      <FormItem>
                        <FormLabel>Resume / CV</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                            <input
                              type="file"
                              className="hidden"
                              id="resume-upload"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('resume', file);
                              }}
                              accept=".pdf,.doc,.docx"
                            />
                            <label htmlFor="resume-upload" className="cursor-pointer">
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm font-medium">Upload CV / Portfolio</p>
                              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
                            </label>
                            {uploadedFiles.resume && (
                              <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm">Uploaded</span>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Professional Information</h2>

                  <FormField
                    control={form.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/in/yourprofile" />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website / Portfolio</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://yourwebsite.com" />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About Me / Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Tell us about your professional background and expertise"
                            className="min-h-32"
                          />
                        </FormControl>
                        <FormDescription>10-500 characters</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isWorker && (
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                placeholder="Enter a skill and press Enter"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const value = (e.target as HTMLInputElement).value.trim();
                                    if (value && !field.value?.includes(value)) {
                                      field.onChange([...(field.value || []), value]);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <div className="flex flex-wrap gap-2">
                                {field.value?.map((skill) => (
                                  <div
                                    key={skill}
                                    className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                  >
                                    {skill}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.onChange(
                                          field.value?.filter(s => s !== skill)
                                        )
                                      }
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {!isWorker && (
                    <>
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Your business name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="productCategories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Categories *</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Enter a category and press Enter"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const value = (e.target as HTMLInputElement).value.trim();
                                      if (value && !field.value?.includes(value)) {
                                        field.onChange([...(field.value || []), value]);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }
                                  }}
                                />
                                <div className="flex flex-wrap gap-2">
                                  {field.value?.map((cat) => (
                                    <div
                                      key={cat}
                                      className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                    >
                                      {cat}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          field.onChange(
                                            field.value?.filter(c => c !== cat)
                                          )
                                        }
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || existingApplication?.status === 'rejected'}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleApplication;
