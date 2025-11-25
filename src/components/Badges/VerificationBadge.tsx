import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  FileText,
  CreditCard,
  Star,
  TrendingUp,
  Shield
} from "lucide-react";

interface VerificationBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerificationBadge = ({ type, size = 'md', showLabel = true }: VerificationBadgeProps) => {
  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'email':
        return {
          icon: <Mail className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Email Verified',
          color: 'bg-blue-500 hover:bg-blue-600',
          textColor: 'text-white'
        };
      case 'phone':
        return {
          icon: <Phone className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Phone Verified',
          color: 'bg-green-500 hover:bg-green-600',
          textColor: 'text-white'
        };
      case 'id_document':
        return {
          icon: <FileText className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'ID Verified',
          color: 'bg-purple-500 hover:bg-purple-600',
          textColor: 'text-white'
        };
      case 'payment_method':
        return {
          icon: <CreditCard className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Payment Verified',
          color: 'bg-orange-500 hover:bg-orange-600',
          textColor: 'text-white'
        };
      case 'top_rated':
        return {
          icon: <Star className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Top Rated',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          textColor: 'text-black'
        };
      case 'rising_talent':
        return {
          icon: <TrendingUp className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Rising Talent',
          color: 'bg-pink-500 hover:bg-pink-600',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <Shield className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />,
          label: 'Verified',
          color: 'bg-gray-500 hover:bg-gray-600',
          textColor: 'text-white'
        };
    }
  };

  const config = getBadgeConfig(type);

  return (
    <Badge className={`${config.color} ${config.textColor} border-0 flex items-center gap-1 px-2 py-1`}>
      {config.icon}
      {showLabel && <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{config.label}</span>}
    </Badge>
  );
};