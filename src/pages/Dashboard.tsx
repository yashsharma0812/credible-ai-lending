import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, TrendingUp, DollarSign, Activity, CreditCard } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [creditScore, setCreditScore] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [role, setRole] = useState<"borrower" | "lender">("borrower");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    setProfile(profileData);

    // Fetch credit score
    const { data: scoreData } = await supabase
      .from("credit_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    setCreditScore(scoreData);

    // Fetch loans
    const { data: loansData } = await supabase
      .from("loans")
      .select("*")
      .or(`borrower_id.eq.${user.id},lender_id.eq.${user.id}`)
      .order("created_at", { ascending: false });
    
    setLoans(loansData || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const requestCreditScore = async () => {
    if (!user) return;

    toast.promise(
      supabase.functions.invoke("calculate-credit-score", {
        body: { userId: user.id }
      }),
      {
        loading: "Calculating your credit score...",
        success: (response) => {
          if (response.data?.score) {
            setCreditScore(response.data);
            return `Your credit score is ${response.data.score}!`;
          }
          return "Credit score calculated!";
        },
        error: "Failed to calculate credit score",
      }
    );
  };

  const myLoans = loans.filter(l => l.borrower_id === user?.id);
  const fundedLoans = loans.filter(l => l.lender_id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Credible
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {profile?.full_name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 shadow-elevated">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credit Score</p>
                <p className="text-2xl font-bold">
                  {creditScore ? creditScore.score : "—"}
                </p>
              </div>
            </div>
            {!creditScore && (
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2"
                onClick={requestCreditScore}
              >
                Calculate Score
              </Button>
            )}
          </Card>

          <Card className="p-6 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{myLoans.filter(l => l.status === "active").length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Funded Loans</p>
                <p className="text-2xl font-bold">{fundedLoans.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">KYC Status</p>
                <p className="text-lg font-semibold capitalize">
                  {profile?.kyc_status || "Pending"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:shadow-glow"
            onClick={() => navigate("/marketplace")}
          >
            Browse Loan Marketplace
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => navigate("/create-loan")}
          >
            Request a Loan
          </Button>
        </div>

        {/* Loans Tabs */}
        <Card className="p-6 shadow-elevated">
          <Tabs defaultValue="borrower" onValueChange={(v) => setRole(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="borrower">My Loans</TabsTrigger>
              <TabsTrigger value="lender">Funded Loans</TabsTrigger>
            </TabsList>

            <TabsContent value="borrower">
              {myLoans.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No active loans. Request one to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLoans.map((loan) => (
                    <Card key={loan.id} className="p-4 hover:shadow-glow transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">${loan.amount}</p>
                          <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{loan.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {loan.duration_months} months @ {loan.interest_rate}%
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="lender">
              {fundedLoans.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>You haven't funded any loans yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fundedLoans.map((loan) => (
                    <Card key={loan.id} className="p-4 hover:shadow-glow transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">${loan.amount}</p>
                          <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{loan.status}</p>
                          <p className="text-xs text-muted-foreground">
                            Returns: {loan.interest_rate}%
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
