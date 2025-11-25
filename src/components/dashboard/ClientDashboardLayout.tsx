import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClientDashboardLayoutProps {
  children: ReactNode;
  tabs?: Array<{
    id: string;
    label: string;
    path: string;
  }>;
}

export const ClientDashboardLayout = ({ children, tabs }: ClientDashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = tabs?.find(tab => location.pathname.includes(tab.path))?.id || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/client")}
          className="glass-effect mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {tabs && tabs.length > 0 && (
          <Tabs
            value={currentTab}
            onValueChange={(value) => {
              const tab = tabs.find(t => t.id === value);
              if (tab) navigate(tab.path);
            }}
            className="mb-8"
          >
            <TabsList className="glass-effect">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                {children}
              </TabsContent>
            ))}
          </Tabs>
        )}

        {(!tabs || tabs.length === 0) && children}
      </div>
    </div>
  );
};
