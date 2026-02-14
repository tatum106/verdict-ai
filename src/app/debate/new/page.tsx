"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";

export default function NewDebatePage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [sideA, setSideA] = useState("");
  const [sideB, setSideB] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          side_a: sideA.trim(),
          side_b: sideB.trim(),
          is_public: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push(`/debate/${data.debate_id}`);
    } catch {
      setError("Unable to reach the judge. Please check your connection and retry.");
      setLoading(false);
    }
  };

  const MIN_ARGUMENT = 20;
  const isValid =
    topic.trim().length >= 1 &&
    topic.trim().length <= 200 &&
    sideA.trim().length >= MIN_ARGUMENT &&
    sideA.trim().length <= 2000 &&
    sideB.trim().length >= MIN_ARGUMENT &&
    sideB.trim().length <= 2000 &&
    sideA.trim().toLowerCase() !== sideB.trim().toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Scale className="h-8 w-8 text-sideA" />
            Verdict.ai
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Debate</h1>
          <p className="text-slate-600">
            Enter a topic and both sides of the argument. Our AI judge will
            evaluate and deliver an unbiased verdict.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submit Your Debate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-2">
                  Debate Topic *
                </label>
                <Input
                  id="topic"
                  placeholder="What are you debating? (e.g., 'Cats vs Dogs as pets')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {topic.length}/200 characters
                </p>
              </div>

              <div>
                <label htmlFor="sideA" className="block text-sm font-medium mb-2">
                  Argument for Side A *
                </label>
                <Textarea
                  id="sideA"
                  placeholder="Present the strongest case for this position..."
                  value={sideA}
                  onChange={(e) => setSideA(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {sideA.length}/2000 characters (min {MIN_ARGUMENT})
                  {sideA.length > 0 && sideA.length < MIN_ARGUMENT && (
                    <span className="text-amber-600"> — Add more content</span>
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="sideB" className="block text-sm font-medium mb-2">
                  Argument for Side B *
                </label>
                <Textarea
                  id="sideB"
                  placeholder="Present the strongest case for this position..."
                  value={sideB}
                  onChange={(e) => setSideB(e.target.value)}
                  maxLength={2000}
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {sideB.length}/2000 characters (min {MIN_ARGUMENT})
                  {sideB.length > 0 && sideB.length < MIN_ARGUMENT && (
                    <span className="text-amber-600"> — Add more content</span>
                  )}
                </p>
              </div>

              {sideA.trim() && sideB.trim() && sideA.trim().toLowerCase() === sideB.trim().toLowerCase() && (
                <p className="text-amber-600 text-sm">
                  Side A and Side B cannot be identical.
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={!isValid || loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    The judge is reviewing your arguments...
                  </>
                ) : (
                  "Get Verdict"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
