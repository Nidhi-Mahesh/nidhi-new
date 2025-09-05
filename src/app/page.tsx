"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const splineRef = useRef<HTMLDivElement | null>(null);
  const [isBookOpen, setIsBookOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (splineRef.current) {
        const { top } = splineRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Adjust this threshold as needed
        if (top < viewportHeight * 0.75 && !isBookOpen) {
          setIsBookOpen(true);
          // Assuming the spline viewer has a method or property to trigger animation
          // You might need to adjust this based on the actual spline-viewer API
          // For now, we'll just log the state change.
          console.log("Book should open!");
        } else if (top >= viewportHeight * 0.75 && isBookOpen) {
          setIsBookOpen(false);
          console.log("Book should close!");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isBookOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <h1 className="text-2xl font-bold font-headline">Modern Chyrp</h1>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Button asChild variant="link">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="ml-2">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 lg:py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight">
                Build Your Digital Voice
              </h2>
              <p className="mt-4 text-lg max-w-2xl mx-auto md:mx-0 text-muted-foreground">
                Modern Chyrp is the minimalist blogging platform for creators who value simplicity and elegance. Focus on your writing, and we'll handle the rest.
              </p>
              <div className="mt-8 flex justify-center md:justify-start gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start Your Blog <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center" ref={splineRef}>
              <spline-viewer url="https://prod.spline.design/kBLHfuWO7HLJtWv1/scene.splinecode" style={{ width: '100%', height: '500px' }}></spline-viewer>
            </div>
          </div>
        </section>

        {/* 1. AI-Powered Writing Section */}
        <section className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 text-center md:text-left">
              <h3 className="text-4xl font-bold font-headline">AI that Understands Your Voice</h3>
              <p className="mt-4 text-lg text-muted-foreground">
                Our advanced AI goes beyond basic grammar checks. It understands your unique writing style, helps improve clarity, polishes grammar, and refines flow, all while preserving your authentic voice. Say goodbye to generic suggestions and hello to truly personalized writing assistance.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              {/* Placeholder for illustrative icon or vector */}
              <div className="w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center text-blue-800 dark:text-blue-200 text-6xl">
                ✨
              </div>
            </div>
          </div>
        </section>

        {/* 2. Key Features Grid */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl font-bold font-headline">Key Features to Elevate Your Writing</h3>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
              Modern Chyrp provides a suite of powerful tools designed to streamline your content creation process.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature Card 1 */}
              <div className="group p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl text-primary mb-4">📝</div> {/* Placeholder Icon */}
                <h4 className="text-xl font-semibold">Minimalist Editor</h4>
                <p className="mt-2 text-muted-foreground">A clean, distraction-free writing space that lets you focus purely on your content.</p>
              </div>
              {/* Feature Card 2 */}
              <div className="group p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl text-primary mb-4">💡</div> {/* Placeholder Icon */}
                <h4 className="text-xl font-semibold">AI Writing Suggestions</h4>
                <p className="mt-2 text-muted-foreground">Get real-time assistance with grammar, style, and content generation.</p>
              </div>
              {/* Feature Card 3 */}
              <div className="group p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl text-primary mb-4">📊</div> {/* Placeholder Icon */}
                <h4 className="text-xl font-semibold">Analytics Dashboard</h4>
                <p className="mt-2 text-muted-foreground">Track reader engagement, traffic sources, and content performance with ease.</p>
              </div>
              {/* Feature Card 4 */}
              <div className="group p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl text-primary mb-4">🚀</div> {/* Placeholder Icon */}
                <h4 className="text-xl font-semibold">One-Click Publishing</h4>
                <p className="mt-2 text-muted-foreground">Publish your posts effortlessly across multiple platforms with a single click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Showcase Section */}
        <section className="py-20 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-4xl font-bold font-headline">See Modern Chyrp in Action</h3>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
              Explore beautiful blog layouts and engaging content created with Modern Chyrp.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Placeholder for Blog Mockup 1 */}
              <div className="group relative w-full h-64 bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <img src="https://via.placeholder.com/400x250/F3F4F6/9CA3AF?text=Blog+Mockup+1" alt="Blog Mockup 1" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xl font-semibold transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">Sample Post Title</p>
                </div>
              </div>
              {/* Placeholder for Blog Mockup 2 */}
              <div className="group relative w-full h-64 bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <img src="https://via.placeholder.com/400x250/E5E7EB/9CA3AF?text=Blog+Mockup+2" alt="Blog Mockup 2" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xl font-semibold transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">Another Great Read</p>
                </div>
              </div>
              {/* Placeholder for Blog Mockup 3 */}
              <div className="group relative w-full h-64 bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <img src="https://via.placeholder.com/400x250/D1D5DB/9CA3AF?text=Blog+Mockup+3" alt="Blog Mockup 3" className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xl font-semibold transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">Tips for Writers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </main>

      {/* 5. Call-to-Action Footer */}
      <footer className="py-20 lg:py-32 bg-background text-foreground text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl lg:text-6xl font-bold font-headline tracking-tight">
            Start Writing Smarter
          </h2>
          <p className="mt-4 text-xl max-w-2xl mx-auto opacity-90">
            Join Modern Chyrp today and transform your blogging experience with powerful AI and a beautiful platform.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-foreground text-foreground hover:bg-accent hover:text-accent-foreground">
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
