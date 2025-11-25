import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Zap, Globe } from "lucide-react";

const About = () => {
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
        >
          <h1 className="text-5xl font-bold mb-6">About OneVerse</h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Empowering creators, workers, and entrepreneurs worldwide
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 my-12">
          {[
            { icon: Users, title: "Community-Driven", desc: "Building a global community of creators and professionals" },
            { icon: Zap, title: "Innovative", desc: "Cutting-edge technology for seamless experiences" },
            { icon: Globe, title: "Global Reach", desc: "Connecting talent and opportunities across the world" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="p-6 border border-border rounded-lg hover:shadow-lg transition-all"
            >
              <item.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="prose dark:prose-invert max-w-none"
        >
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-8">
            OneVerse is the all-in-one platform that revolutionizes how people work, create, and connect. 
            We believe in breaking down barriers between e-commerce, freelancing, social networking, and portfolio showcasing.
          </p>

          <h2 className="text-3xl font-bold mb-4">Why OneVerse?</h2>
          <ul className="text-lg text-muted-foreground space-y-4 mb-8">
            <li>✓ One platform for all your professional needs</li>
            <li>✓ Seamless integration of work, commerce, and community</li>
            <li>✓ Fair pricing and transparent transactions</li>
            <li>✓ Global opportunities right at your fingertips</li>
            <li>✓ Secure and reliable infrastructure</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
