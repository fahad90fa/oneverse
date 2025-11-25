import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          <h1 className="text-5xl font-bold mb-8">Terms of Service</h1>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using OneVerse, you accept and agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain the confidentiality of your account information</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Provide accurate and complete information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Prohibited Activities</h2>
              <p>You may not use OneVerse to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Violate any laws or regulations</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Infringe on intellectual property rights</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Spam or send unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Transactions & Payments</h2>
              <p>
                All transactions on OneVerse are subject to our payment policies. OneVerse charges service fees on transactions.
                You are responsible for understanding applicable taxes and regulations in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
              <p>
                OneVerse is provided on an "AS IS" basis. We do not warrant that the service will be uninterrupted or error-free.
                We are not liable for any indirect, incidental, special, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Termination</h2>
              <p>
                OneVerse reserves the right to suspend or terminate your account if you violate these terms or engage in
                prohibited activities. You may terminate your account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Changes to Terms</h2>
              <p>
                We may modify these terms at any time. Continued use of the service constitutes your acceptance of modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact</h2>
              <p>
                For questions about these Terms of Service, contact us at legal@oneverse.site
              </p>
            </section>
          </div>

          <p className="text-sm text-muted-foreground mt-12">Last updated: November 2024</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
