import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

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
          className="max-w-4xl"
        >
          <h1 className="text-5xl font-bold mb-8">Privacy Policy</h1>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly, such as when you create an account, post content, or contact us.
                This includes name, email, profile information, and transaction history.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send promotional emails and updates (which you can opt out of)</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies & Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to remember your preferences and enhance your experience.
                You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Third-Party Services</h2>
              <p>
                We use third-party services such as Stripe for payments and Supabase for data management.
                These providers maintain their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time.
                Contact us at privacy@oneverse.site for any privacy-related requests.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@oneverse.site
              </p>
            </section>
          </div>

          <p className="text-sm text-muted-foreground mt-12">Last updated: November 2024</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
