import React from "react";
import { ChartLine, Book, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

const Index = () => {
  const features = [
    {
      icon: <ChartLine className="w-6 h-6" />,
      title: "Track Your Trades",
      description:
        "Log and monitor all your trading activities in one place with our intuitive interface.",
    },

    {
      icon: <Book className="w-6 h-6" />,
      title: "Learn & Grow",
      description:
        "Analyze your past trades and identify patterns to enhance your trading strategy.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Master Your Trading Journey
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A simple yet powerful trading journal that helps you track,
              analyze, and improve your trading performance.
            </p>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-card-foreground">
            Everything you need to succeed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-lg shadow-sm border"
              >
                <div className="mb-4 text-primary">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-2 text-card-foreground">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 ">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
            Ready to improve your trading?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders who are already using TradeJournal to
            enhance their trading performance.
          </p>
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            Start Journaling Now
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 ">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
            Built with Modern Technology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              "Next.js",
              "React",
              "TypeScript",
              "Supabase",
              "Tailwind",
              "Recharts",
            ].map((tech) => (
              <div key={tech} className="p-4 bg-muted rounded-lg shadow-sm">
                <p className="font-medium text-card-foreground">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
