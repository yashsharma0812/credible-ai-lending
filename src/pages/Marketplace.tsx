import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

const Marketplace = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<any[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchLoans();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredLoans(
        loans.filter(
          (loan) =>
            loan.purpose.toLowerCase().includes(search.toLowerCase()) ||
            loan.amount.toString().includes(search)
        )
      );
    } else {
      setFilteredLoans(loans);
    }
  }, [search, loans]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setUser(user);
  };

  const fetchLoans = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*, profiles!loans_borrower_id_fkey(full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setLoans(data || []);
    setFilteredLoans(data || []);
  };

  const handleFundLoan = async (loanId: string, amount: number) => {
    if (!user) return;

    const blockNumber = Math.floor(Math.random() * 1000000);
    const contractHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    const { error: loanError } = await supabase
      .from("loans")
      .update({
        lender_id: user.id,
        status: "funded",
        funded_at: new Date().toISOString(),
        smart_contract_hash: contractHash,
      })
      .eq("id", loanId);

    if (loanError) {
      toast.error("Failed to fund loan");
      return;
    }

    const { error: txError } = await supabase
      .from("transactions")
      .insert({
        loan_id: loanId,
        from_user_id: user.id,
        to_user_id: loans.find(l => l.id === loanId)?.borrower_id,
        amount,
        transaction_type: "loan_funding",
        blockchain_hash: `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        block_number: blockNumber,
      });

    if (txError) {
      toast.error("Transaction failed");
      return;
    }

    toast.success("Loan funded successfully!");
    fetchLoans();
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">Loan Marketplace</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search loans by purpose or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loans Grid */}
        {filteredLoans.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground">No loans available at the moment.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <Card key={loan.id} className="p-6 shadow-elevated hover:shadow-glow transition-all">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">${loan.amount}</h3>
                    <span className="text-sm bg-gradient-accent text-white px-3 py-1 rounded-full">
                      {loan.interest_rate}% APR
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Borrower: {loan.profiles?.full_name || "Anonymous"}
                  </p>
                  <p className="text-sm font-medium">{loan.purpose}</p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{loan.duration_months} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize">{loan.status}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:shadow-glow"
                  onClick={() => handleFundLoan(loan.id, loan.amount)}
                >
                  Fund This Loan
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
