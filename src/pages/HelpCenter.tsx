import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Sign up by clicking 'Create Account' on the landing page. Choose your role (buyer, seller, client, or worker) and follow the onboarding process."
    },
    {
      id: 2,
      category: "Getting Started",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe integration."
    },
    {
      id: 3,
      category: "Gigs & Services",
      question: "How do I post a gig?",
      answer: "Go to your Worker Dashboard and click 'Create Gig'. Fill in the details, set your price, and publish."
    },
    {
      id: 4,
      category: "Gigs & Services",
      question: "What's the fee for selling gigs?",
      answer: "OneVerse charges a 20% service fee on completed gig transactions."
    },
    {
      id: 5,
      category: "Products",
      question: "How do I list a product?",
      answer: "Navigate to the Seller Dashboard and click 'Add Product'. Upload images, write descriptions, and set pricing."
    },
    {
      id: 6,
      category: "Account",
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page and follow the email instructions."
    }
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-2xl text-muted-foreground">Find answers to common questions</p>
        </motion.div>

        <div className="my-12 max-w-3xl">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="mb-4"
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full p-4 border border-border rounded-lg hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-accent font-semibold">{faq.category}</span>
                    <h3 className="text-lg font-bold mt-1">{faq.question}</h3>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${expandedId === faq.id ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              {expandedId === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-primary/5 text-muted-foreground"
                >
                  {faq.answer}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-primary/5 p-8 rounded-lg border border-primary/20 text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Contact our support team at support@oneverse.site
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpCenter;
