import { z } from 'zod';

export const roleApplicationSchema = z.object({
  role: z.enum(['worker', 'seller']),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  profileImage: z instanceof(File).optional(),
  resume: z instanceof(File).optional(),
  cnic: z instanceof(File),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must not exceed 500 characters'),
  
  // Worker specific
  skills: z.array(z.string()).optional().default([]),
  
  // Seller specific
  businessName: z.string().optional(),
  productCategories: z.array(z.string()).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.role === 'worker' && (!data.skills || data.skills.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['skills'],
      message: 'At least one skill is required for workers',
    });
  }
  
  if (data.role === 'seller' && !data.businessName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['businessName'],
      message: 'Business name is required for sellers',
    });
  }
  
  if (data.role === 'seller' && (!data.productCategories || data.productCategories.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['productCategories'],
      message: 'At least one product category is required for sellers',
    });
  }
});

export type RoleApplicationForm = z.infer<typeof roleApplicationSchema>;
