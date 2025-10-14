-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'borrower', 'lender');

-- Create enum for loan status
CREATE TYPE public.loan_status AS ENUM ('pending', 'active', 'funded', 'repaying', 'completed', 'defaulted');

-- Create profiles table with KYC data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  kyc_status TEXT DEFAULT 'pending',
  kyc_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create credit_scores table
CREATE TABLE public.credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  explanation TEXT,
  factors JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID NOT NULL,
  lender_id UUID,
  amount DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  duration_months INTEGER NOT NULL,
  purpose TEXT NOT NULL,
  status loan_status DEFAULT 'pending',
  repayment_amount DECIMAL(15, 2),
  amount_repaid DECIMAL(15, 2) DEFAULT 0,
  next_payment_date DATE,
  smart_contract_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  funded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create transactions table (blockchain simulation)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type TEXT NOT NULL,
  blockchain_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  gas_fee DECIMAL(10, 4) DEFAULT 0.0001,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (true);

-- RLS Policies for credit_scores
CREATE POLICY "Users can view their own credit score"
  ON public.credit_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit scores"
  ON public.credit_scores FOR INSERT
  WITH CHECK (true);

-- RLS Policies for loans
CREATE POLICY "Borrowers can view their own loans"
  ON public.loans FOR SELECT
  USING (auth.uid() = borrower_id);

CREATE POLICY "Lenders can view loans they funded"
  ON public.loans FOR SELECT
  USING (auth.uid() = lender_id);

CREATE POLICY "Anyone can view pending loans"
  ON public.loans FOR SELECT
  USING (status = 'pending');

CREATE POLICY "Borrowers can create loans"
  ON public.loans FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Lenders can update loans they fund"
  ON public.loans FOR UPDATE
  USING (auth.uid() = lender_id OR auth.uid() = borrower_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "System can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  
  -- Assign default borrower role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'borrower');
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();