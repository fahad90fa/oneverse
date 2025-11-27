import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Careers = () => {
  const navigate = useNavigate();

  const jobs = [
    { title: "Full Stack Developer", location: "Remote", salary: "$80k - $120k" },
    { title: "UI/UX Designer", location: "Remote", salary: "$60k - $90k" },
    { title: "Product Manager", location: "Remote", salary: "$100k - $150k" },
    { title: "Community Manager", location: "Remote", salary: "$50k - $70k" }
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
          <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-2xl text-muted-foreground">Help us build the future of work</p>
        </motion.div>

        <div className="my-12">
          <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="p-6 border border-border rounded-lg hover:shadow-lg transition-all"
              >
                <h3 className="text-2xl font-bold mb-4">{job.title}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-5 w-5" />
                    {job.salary}
                  </div>
                </div>
                <Button className="w-full">Learn More</Button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-primary/5 p-8 rounded-lg border border-primary/20"
        >
          <h3 className="text-2xl font-bold mb-4">Don't see your role?</h3>
          <p className="text-lg text-muted-foreground mb-4">
            We're always looking for talented individuals. Send us your resume and let us know what you're passionate about!
          </p>
          <Button variant="outline">Send Your Resume</Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Careers;
