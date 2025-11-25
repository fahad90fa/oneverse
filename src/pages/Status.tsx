import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const Status = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Website", status: "operational", uptime: "99.9%" },
    { name: "API Services", status: "operational", uptime: "99.95%" },
    { name: "Database", status: "operational", uptime: "99.9%" },
    { name: "Payment Processing", status: "operational", uptime: "99.99%" },
    { name: "Email Notifications", status: "operational", uptime: "99.8%" },
    { name: "File Storage", status: "operational", uptime: "99.95%" }
  ];

  const incidents = [
    {
      date: "2024-11-15",
      title: "Scheduled Maintenance",
      description: "Completed system maintenance on database infrastructure.",
      duration: "Resolved"
    },
    {
      date: "2024-11-10",
      title: "Payment Gateway Update",
      description: "Updated payment processing system for enhanced security.",
      duration: "Resolved"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "down":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-500/10 border-green-500/30";
      case "degraded":
        return "bg-yellow-500/10 border-yellow-500/30";
      case "down":
        return "bg-red-500/10 border-red-500/30";
      default:
        return "";
    }
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
          <h1 className="text-5xl font-bold mb-4">System Status</h1>
          <p className="text-2xl text-muted-foreground">All systems operational</p>
        </motion.div>

        <div className="my-12">
          <h2 className="text-3xl font-bold mb-6">Service Status</h2>
          <div className="space-y-4">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`p-4 rounded-lg border ${getStatusColor(service.status)} flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-bold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{service.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{service.uptime}</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="my-12">
          <h2 className="text-3xl font-bold mb-6">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-6 border border-border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{incident.title}</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                    {incident.duration}
                  </span>
                </div>
                <p className="text-muted-foreground mb-2">{incident.description}</p>
                <p className="text-sm text-muted-foreground">{incident.date}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-primary/5 p-8 rounded-lg border border-primary/20 text-center"
        >
          <h3 className="text-2xl font-bold mb-2">Subscribe to Updates</h3>
          <p className="text-muted-foreground mb-4">
            Get notified about system maintenance and incidents
          </p>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all">
            Subscribe
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Status;
