import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CreateLoan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [purpose, setPurpose] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("loans").insert({
      borrower_id: user.id,
      amount: parseFloat(amount),
      interest_rate: parseFloat(interestRate),
      duration_months: parseInt(duration),
      purpose,
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Loan request created successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Request a Loan</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <Card className="max-w-2xl mx-auto p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="amount">Loan Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                required
                min="100"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="interest">Interest Rate (%)</Label>
              <Input
                id="interest"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="5.5"
                required
                min="0.1"
                step="0.1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Competitive rates based on your credit score
              </p>
            </div>

            <div>
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="12"
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="purpose">Loan Purpose</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Business expansion, education, home improvement, etc."
                required
                rows={4}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-glow"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Loan Request
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateLoan;
