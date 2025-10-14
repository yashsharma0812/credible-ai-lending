import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Credible
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            AI-Driven Decentralized Lending Platform
          </p>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Fair, explainable lending powered by AI credit scoring and blockchain transparency. 
            Borrow or lend money with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 shadow-elevated hover:shadow-glow transition-all">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Credit Scoring</h3>
            <p className="text-sm text-muted-foreground">
              Alternative data analysis for fair, explainable credit decisions
            </p>
          </Card>

          <Card className="p-6 shadow-elevated hover:shadow-glow transition-all">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
            <p className="text-sm text-muted-foreground">
              Automated, transparent loan management on blockchain
            </p>
          </Card>

          <Card className="p-6 shadow-elevated hover:shadow-glow transition-all">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
            <p className="text-sm text-muted-foreground">
              KYC/AML compliant with full data protection
            </p>
          </Card>

          <Card className="p-6 shadow-elevated hover:shadow-glow transition-all">
            <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Matching</h3>
            <p className="text-sm text-muted-foreground">
              Fast, efficient marketplace connecting borrowers & lenders
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-10 max-w-3xl mx-auto shadow-elevated bg-gradient-primary">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-6 text-white/90">
              Join the future of decentralized lending. Fair rates, transparent processes, AI-powered decisions.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate("/auth")}
            >
              Create Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
