import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";

const Press = () => {
  const navigate = useNavigate();

  const articles = [
    {
      title: "OneVerse Launches Revolutionary All-in-One Platform",
      date: "2024-11-20",
      publication: "TechCrunch",
      excerpt: "A new platform combining e-commerce, freelancing, and social networking..."
    },
    {
      title: "The Future of Freelancing: OneVerse Interview",
      date: "2024-11-15",
      publication: "Forbes",
      excerpt: "How OneVerse is changing the way creators and professionals work..."
    },
    {
      title: "OneVerse Secures Series A Funding",
      date: "2024-11-10",
      publication: "VentureBeat",
      excerpt: "Platform raises $5M to expand global operations..."
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
          <h1 className="text-5xl font-bold mb-4">Press & Media</h1>
          <p className="text-2xl text-muted-foreground">Latest news about OneVerse</p>
        </motion.div>

        <div className="my-12 space-y-6">
          {articles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="p-6 border border-border rounded-lg hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.date).toLocaleDateString()}
                  </div>
                </div>
                <ExternalLink className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-accent font-semibold mb-2">{article.publication}</p>
              <p className="text-muted-foreground">{article.excerpt}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-primary/5 p-8 rounded-lg border border-primary/20"
        >
          <h3 className="text-2xl font-bold mb-4">For Press Inquiries</h3>
          <p className="text-lg text-muted-foreground">
            For media inquiries, press kits, or interview requests, please contact us at press@oneverse.site
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Press;
