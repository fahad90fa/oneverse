import * as z from "zod";

export const sellerSetupSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(100, "Store name must be less than 100 characters"),
  profileImage: z.string().url("Invalid image URL").optional().or(z.literal("")),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  shippingZones: z.array(z.string()).min(1, "Add at least one shipping zone"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  withdrawalMethod: z.string().min(1, "Withdrawal method is required"),
  businessDescription: z.string().min(20, "Business description must be at least 20 characters").max(1000, "Business description must be less than 1000 characters"),
  supportEmail: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const buyerSetupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name must be less than 100 characters"),
  shippingAddress: z.string().min(10, "Shipping address must be at least 10 characters").max(500, "Address must be less than 500 characters"),
  preferenceType: z.enum(["delivery", "pickup"], { errorMap: () => ({ message: "Select delivery or pickup" }) }),
  interestCategories: z.array(z.string()).min(1, "Select at least one category of interest"),
  wantRecommendations: z.boolean(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notificationPreferences: z.array(z.string()).min(1, "Select at least one notification preference"),
});

export const clientSetupSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100, "Company name must be less than 100 characters"),
  industry: z.string().min(1, "Industry is required"),
  projectTypes: z.array(z.string()).min(1, "Select at least one project type"),
  communicationStyle: z.string().min(1, "Communication style is required"),
  budgetRange: z.string().min(1, "Budget range is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  billingInfo: z.string().optional().or(z.literal("")),
});

export const workerSetupSchema = z.object({
  tagline: z.string().min(10, "Tagline must be at least 10 characters").max(150, "Tagline must be less than 150 characters"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  hourlyRate: z.number().min(1, "Hourly rate must be greater than 0").max(10000, "Hourly rate seems too high"),
  location: z.string().min(2, "Location is required"),
  portfolioItems: z.array(z.string().url("Invalid URL")).optional(),
  cvLink: z.string().url("Invalid CV URL").optional().or(z.literal("")),
});

export type SellerSetupData = z.infer<typeof sellerSetupSchema>;
export type BuyerSetupData = z.infer<typeof buyerSetupSchema>;
export type ClientSetupData = z.infer<typeof clientSetupSchema>;
export type WorkerSetupData = z.infer<typeof workerSetupSchema>;
