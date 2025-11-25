import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

export interface OnboardingData {
  seller?: {
    storeName: string;
    profileImage?: string;
    categories: string[];
    shippingZones: string[];
    deliveryTime: string;
    withdrawalMethod: string;
    businessDescription: string;
    supportEmail?: string;
  };
  buyer?: {
    fullName: string;
    shippingAddress: string;
    preferenceType: "delivery" | "pickup";
    interestCategories: string[];
    wantRecommendations: boolean;
    paymentMethod: string;
    notificationPreferences: string[];
  };
  client?: {
    companyName: string;
    industry: string;
    projectTypes: string[];
    communicationStyle: string;
    budgetRange: string;
    paymentMethod: string;
    billingInfo?: string;
  };
  worker?: {
    tagline: string;
    categories: string[];
    skills: string[];
    languages: string[];
    hourlyRate: number;
    location: string;
    portfolioItems?: string[];
    cvLink?: string;
  };
}

export const onboardingService = {
  async updateProfile(userId: string, data: {
    fullName?: string;
    bio?: string;
    avatarUrl?: string;
  }) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        full_name: data.fullName,
        bio: data.bio,
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) throw error;
    return profile;
  },

  async saveSellerSetup(userId: string, data: OnboardingData["seller"]) {
    if (!data) return;

    try {
      const { data: result, error } = (await supabase
        .from("store_settings" as never)
        .upsert({
          user_id: userId,
          store_name: data.storeName,
          categories: data.categories,
          shipping_zones: data.shippingZones,
          delivery_time: data.deliveryTime,
          withdrawal_method: data.withdrawalMethod,
          business_description: data.businessDescription,
          support_email: data.supportEmail,
          updated_at: new Date().toISOString(),
        } as never, { onConflict: "user_id" })) as {
        data: unknown;
        error: any;
      };

      if (error && error.code !== '42703') throw error;

      await this.updateProfile(userId, {
        fullName: data.storeName,
        bio: data.businessDescription,
        avatarUrl: data.profileImage,
      });

      return result;
    } catch (error) {
      console.error("Error saving seller setup:", error);
      throw error;
    }
  },

  async saveBuyerSetup(userId: string, data: OnboardingData["buyer"]) {
    if (!data) return;

    try {
      const { data: result, error } = (await supabase
        .from("buyer_preferences" as never)
        .upsert({
          user_id: userId,
          delivery_preference: data.preferenceType,
          interest_categories: data.interestCategories,
          want_recommendations: data.wantRecommendations,
          payment_method: data.paymentMethod,
          notification_preferences: data.notificationPreferences,
          updated_at: new Date().toISOString(),
        } as never, { onConflict: "user_id" })) as {
        data: unknown;
        error: any;
      };

      if (error && error.code !== '42703') throw error;

      if (data.shippingAddress) {
        await supabase.from("addresses").insert({
          user_id: userId,
          address: data.shippingAddress,
          is_default: true,
        });
      }

      await this.updateProfile(userId, {
        fullName: data.fullName,
      });

      return result;
    } catch (error) {
      console.error("Error saving buyer setup:", error);
      throw error;
    }
  },

  async saveClientSetup(userId: string, data: OnboardingData["client"]) {
    if (!data) return;

    try {
      const { data: result, error } = await supabase
        .from("client_preferences")
        .upsert({
          user_id: userId,
          industry: data.industry,
          project_types: data.projectTypes,
          communication_style: data.communicationStyle,
          budget_range: data.budgetRange,
          payment_method: data.paymentMethod,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error && error.code !== '42703') throw error;

      await this.updateProfile(userId, {
        fullName: data.companyName,
      });

      return result;
    } catch (error) {
      console.error("Error saving client setup:", error);
      throw error;
    }
  },

  async saveWorkerSetup(userId: string, data: OnboardingData["worker"]) {
    if (!data) return;

    try {
      await this.updateProfile(userId, {
        fullName: data.tagline,
        bio: data.tagline,
      });

      const workerSkillsData = {
        user_id: userId,
        categories: data.categories,
        skills: data.skills,
        languages: data.languages,
        hourly_rate: data.hourlyRate,
        location: data.location,
        updated_at: new Date().toISOString(),
      };

      const { error: skillsError } = await supabase
        .from("worker_skills")
        .upsert(workerSkillsData, { onConflict: "user_id" });

      if (skillsError && skillsError.code !== '42703') throw skillsError;

      if (data.portfolioItems && data.portfolioItems.length > 0) {
        const portfolioData = data.portfolioItems.map((url) => ({
          user_id: userId,
          title: `Portfolio Item ${new Date().getTime()}`,
          project_url: url,
        }));

        const { error: portfolioError } = await supabase
          .from("portfolio_items")
          .insert(portfolioData);

        if (portfolioError && portfolioError.code !== '42703') throw portfolioError;
      }
    } catch (error) {
      console.error("Error saving worker setup:", error);
      throw error;
    }
  },

  async markOnboardingComplete(userId: string) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (error && error.code !== '42703') throw error;
    } catch (error) {
      console.warn("Could not mark onboarding complete:", error);
    }
  },

  async checkOnboardingStatus(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("onboarding_complete")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== '42703') throw error;
      return profile?.onboarding_complete || false;
    } catch (error) {
      console.warn("Could not check onboarding status:", error);
      return false;
    }
  },

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) throw error;
    return (data || []).map((r) => r.role as UserRole);
  },

  async getOnboardingData(userId: string): Promise<OnboardingData> {
    try {
      const [sellerData, buyerData, clientData, workerData] = await Promise.all([
        (async () => {
          const result = await supabase.from("store_settings").select("*").eq("user_id", userId).single();
          return result.error ? { data: null } : result;
        })(),
        (async () => {
          const result = await supabase.from("buyer_preferences").select("*").eq("user_id", userId).single();
          return result.error ? { data: null } : result;
        })(),
        (async () => {
          const result = await supabase.from("client_preferences").select("*").eq("user_id", userId).single();
          return result.error ? { data: null } : result;
        })(),
        (async () => {
          const result = await supabase.from("worker_skills").select("*").eq("user_id", userId).single();
          return result.error ? { data: null } : result;
        })(),
      ]);

      const data: OnboardingData = {};

      if (sellerData.data) {
        data.seller = {
          storeName: sellerData.data.store_name,
          categories: sellerData.data.categories || [],
          shippingZones: sellerData.data.shipping_zones || [],
          deliveryTime: sellerData.data.delivery_time,
          withdrawalMethod: sellerData.data.withdrawal_method,
          businessDescription: sellerData.data.business_description,
          supportEmail: sellerData.data.support_email,
        };
      }

      if (buyerData.data) {
        data.buyer = {
          fullName: "",
          shippingAddress: "",
          preferenceType: buyerData.data.delivery_preference || "delivery",
          interestCategories: buyerData.data.interest_categories || [],
          wantRecommendations: buyerData.data.want_recommendations || false,
          paymentMethod: buyerData.data.payment_method,
          notificationPreferences: buyerData.data.notification_preferences || [],
        };
      }

      if (clientData.data) {
        data.client = {
          companyName: "",
          industry: clientData.data.industry,
          projectTypes: clientData.data.project_types || [],
          communicationStyle: clientData.data.communication_style,
          budgetRange: clientData.data.budget_range,
          paymentMethod: clientData.data.payment_method,
        };
      }

      if (workerData.data) {
        data.worker = {
          tagline: "",
          categories: workerData.data.categories || [],
          skills: workerData.data.skills || [],
          languages: workerData.data.languages || [],
          hourlyRate: workerData.data.hourly_rate,
          location: workerData.data.location,
        };
      }

      return data;
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
      return {};
    }
  },
};
