import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-8 w-8 text-sideA" />
            Verdict.ai
          </Link>
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/debate/new">
                <Button>New Debate</Button>
              </Link>
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Settle Any Debate with AI
          </h1>
          <p className="text-xl text-slate-600">
            Submit two sides of an argument. Our AI judge delivers an unbiased
            verdict based on logical coherence, evidence quality, and argument
            strength.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Start Your Debate
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/debate/new">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Start Your Debate
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 max-w-4xl w-full">
          <h2 className="text-2xl font-semibold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <div className="w-12 h-12 rounded-full bg-sideA/10 text-sideA flex items-center justify-center mx-auto mb-4 font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Enter Your Debate</h3>
              <p className="text-slate-600 text-sm">
                Add a topic and present both sides of the argument with your
                strongest points.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <div className="w-12 h-12 rounded-full bg-sideB/10 text-sideB flex items-center justify-center mx-auto mb-4 font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-slate-600 text-sm">
                Our impartial AI judge evaluates logical coherence, evidence,
                and persuasiveness.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Get Your Verdict</h3>
              <p className="text-slate-600 text-sm">
                Receive a detailed analysis with scores and reasoning for each
                side.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-slate-500 text-sm">
        <p>Verdict.ai — Objective AI-powered debate evaluation</p>
      </footer>
    </div>
  );
}
