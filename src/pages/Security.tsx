import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, AlertCircle, CheckCircle } from "lucide-react";

const Security = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: "Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard TLS/SSL protocols."
    },
    {
      icon: Shield,
      title: "Two-Factor Authentication",
      description: "Enable 2FA on your account for an additional layer of security."
    },
    {
      icon: AlertCircle,
      title: "Fraud Detection",
      description: "Advanced monitoring systems detect and prevent fraudulent activities."
    },
    {
      icon: CheckCircle,
      title: "Regular Audits",
      description: "We conduct regular security audits and penetration testing."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-4">Security & Trust</h1>
          <p className="text-2xl text-muted-foreground">Your privacy and security are our top priority</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 my-12">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 border border-border rounded-lg hover:shadow-lg transition-all"
            >
              <feature.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-3xl"
        >
          <h2 className="text-3xl font-bold mb-6">Security Best Practices</h2>
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span>Use a strong, unique password for your account</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span>Enable two-factor authentication (2FA) for extra security</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span>Never share your password or personal information</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span>Keep your email address up to date</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <span>Report suspicious activity immediately to support@oneverse.site</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-primary/5 p-8 rounded-lg border border-primary/20 mt-12"
        >
          <h3 className="text-2xl font-bold mb-4">Report a Security Issue</h3>
          <p className="text-muted-foreground mb-4">
            If you discover a security vulnerability, please email security@oneverse.site with details.
            We appreciate your responsible disclosure and will address issues promptly.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Security;
