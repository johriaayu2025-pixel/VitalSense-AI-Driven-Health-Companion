import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Activity, Utensils, Brain, Pill, Menu, X, ArrowRight, CheckCircle2 } from "lucide-react";
import heroAIImage from "@/assets/hero-ai-health.jpg";
import dashboardImage from "@/assets/feature-dashboard.jpg";
import nutrisnapImage from "@/assets/feature-nutrisnap.jpg";
import aiImage from "@/assets/feature-ai.jpg";
import medicationImage from "@/assets/feature-medication.jpg";
import aboutImage from "@/assets/about-vitalsense.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);

  }, []);

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Smart Health Dashboard",
      description: "Summaries of vitals, scans, meds, and AI suggestions all in one place.",
      image: dashboardImage,
    },
    {
      icon: Utensils,
      title: "NutriSnap Meal Scanner",
      description: "Snap a meal → detect food → calories → update 'Today's Meals' instantly.",
      image: nutrisnapImage,
    },
    {
      icon: Brain,
      title: "AI Health Recommendations",
      description: "Daily recommendations based on vitals, meals, and activity patterns.",
      image: aiImage,
    },
    {
      icon: Pill,
      title: "Medication Manager",
      description: "Add medications with custom timing and never miss a dose with smart reminders.",
      image: medicationImage,
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Scan or Log Health Data",
      description: "Upload vitals, scan meals, or add medications with ease.",
    },
    {
      number: "02",
      title: "AI Analyzes Everything",
      description: "Our AI processes your data instantly to provide personalized insights.",
    },
    {
      number: "03",
      title: "Track Weekly Insights",
      description: "Monitor your progress with beautiful visualizations and smart recommendations.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur shadow-sm">
        <div className="container flex h-16 items-center justify-between px-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              VitalSense
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors">
              Contact
            </button>
            <Button onClick={() => scrollToSection('get-started')} className="ml-2 bg-[#3b82f6] hover:bg-[#2563eb]">
              Get Started
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <nav className="container py-4 flex flex-col gap-4 px-6">
              <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors text-left">
                Features
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors text-left">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-gray-700 hover:text-[#3b82f6] transition-colors text-left">
                Contact
              </button>
              <Button onClick={() => scrollToSection('get-started')} className="w-full bg-[#3b82f6] hover:bg-[#2563eb]">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background with hero image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0a0e27]"></div>
          <img 
            src={heroAIImage} 
            alt="AI Health Technology" 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e27]/50 to-[#0a0e27]"></div>
          
          {/* Pulsing radial glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3b82f6] rounded-full blur-[120px] animate-radial-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ec4899] rounded-full blur-[120px] animate-radial-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-[#8b5cf6] rounded-full blur-[100px] animate-radial-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Network lines SVG */}
        <svg className="absolute inset-0 z-[1] w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
          <defs>
            <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="line-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Network connecting lines */}
          <line x1="10%" y1="20%" x2="40%" y2="60%" stroke="url(#line-gradient-1)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3s" repeatCount="indefinite" />
          </line>
          <line x1="40%" y1="60%" x2="70%" y2="30%" stroke="url(#line-gradient-2)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="70%" y1="30%" x2="90%" y2="70%" stroke="url(#line-gradient-3)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3.5s" repeatCount="indefinite" />
          </line>
          <line x1="20%" y1="80%" x2="60%" y2="40%" stroke="url(#line-gradient-1)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5s" repeatCount="indefinite" />
          </line>
          <line x1="60%" y1="40%" x2="85%" y2="85%" stroke="url(#line-gradient-2)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4.5s" repeatCount="indefinite" />
          </line>
          <line x1="15%" y1="40%" x2="45%" y2="15%" stroke="url(#line-gradient-3)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="3.8s" repeatCount="indefinite" />
          </line>
          <line x1="50%" y1="90%" x2="80%" y2="50%" stroke="url(#line-gradient-1)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="4.2s" repeatCount="indefinite" />
          </line>
          <line x1="30%" y1="30%" x2="70%" y2="70%" stroke="url(#line-gradient-2)" strokeWidth="1" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="5.5s" repeatCount="indefinite" />
          </line>
        </svg>

        {/* Animated floating particles */}
        <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute rounded-full animate-float"
              style={{
                width: Math.random() * 6 + 2 + 'px',
                height: Math.random() * 6 + 2 + 'px',
                background: i % 3 === 0 
                  ? 'radial-gradient(circle, #ec4899 0%, transparent 70%)' 
                  : i % 2 === 0 
                  ? 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' 
                  : 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                boxShadow: i % 3 === 0 
                  ? '0 0 10px #ec4899' 
                  : i % 2 === 0 
                  ? '0 0 10px #3b82f6' 
                  : '0 0 10px #8b5cf6',
                animationDelay: Math.random() * 8 + 's',
                animationDuration: (Math.random() * 8 + 6) + 's',
              }}
            />
          ))}
          
          {/* Glowing connection nodes */}
          {[
            { x: '10%', y: '20%', color: '#3b82f6', delay: '0s' },
            { x: '40%', y: '60%', color: '#ec4899', delay: '1s' },
            { x: '70%', y: '30%', color: '#8b5cf6', delay: '2s' },
            { x: '90%', y: '70%', color: '#3b82f6', delay: '1.5s' },
            { x: '20%', y: '80%', color: '#ec4899', delay: '2.5s' },
            { x: '85%', y: '85%', color: '#8b5cf6', delay: '0.5s' },
          ].map((node, i) => (
            <div
              key={`node-${i}`}
              className="absolute rounded-full animate-pulse-glow"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: node.color,
                left: node.x,
                top: node.y,
                animationDelay: node.delay,
              }}
            />
          ))}
        </div>
        
        <div className="container relative z-10 py-20 md:py-32 px-6 mx-auto max-w-7xl">
          <div className="max-w-4xl text-left space-y-6 animate-fade-in">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              VitalSense
            </h1>
            <div className="text-3xl md:text-4xl font-medium">
              <span className="text-white">Your AI </span>
              <span className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">Health Companion</span>
            </div>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl">
              Track your vitals, scan meals, manage medications, and get AI-powered insights all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                onClick={() => scrollToSection('get-started')} 
                className="text-lg px-8 bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] transition-all"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => scrollToSection('features')} 
                className="text-lg px-8 border-white text-white bg-white/10 hover:bg-white/20 hover:border-white transition-all"
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your health journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="aspect-video overflow-hidden">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center animate-bounce-gentle" style={{ animationDelay: `${index * 0.2}s` }}>
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => scrollToSection('get-started')} className="px-8">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1229]">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3b82f6]/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10 rounded-full blur-3xl animate-radial-pulse"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-pulse-glow">
                Why VitalSense?
              </h2>
              <div className="space-y-4 text-lg text-gray-300">
                <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  Smart AI-powered health tracking that is simple, clean, and accurate. We believe managing your health shouldn't be complicated.
                </p>
                <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  VitalSense helps you build healthy habits, track your meals with ease, receive personalized insights, and stay consistent with your health goals.
                </p>
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 animate-fade-in hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: '0.3s' }}>
                    <CheckCircle2 className="h-6 w-6 text-[#3b82f6] flex-shrink-0 animate-pulse-glow" />
                    <span className="text-white">AI-powered personalized recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 animate-fade-in hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: '0.4s' }}>
                    <CheckCircle2 className="h-6 w-6 text-[#3b82f6] flex-shrink-0 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
                    <span className="text-white">Simple and intuitive interface</span>
                  </div>
                  <div className="flex items-center gap-3 animate-fade-in hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: '0.5s' }}>
                    <CheckCircle2 className="h-6 w-6 text-[#3b82f6] flex-shrink-0 animate-pulse-glow" style={{ animationDelay: '1s' }} />
                    <span className="text-white">All your health data in one place</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-[#3b82f6]/30 to-[#8b5cf6]/30 rounded-2xl blur-xl animate-pulse-glow"></div>
              <img src={aboutImage} alt="VitalSense Platform" className="relative rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Animated Timeline */}
      <section className="relative py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center space-y-4">
                  {/* Number Circle */}
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#a5b4fc] to-[#c4b5fd] text-white text-3xl font-bold mb-4">
                    {step.number}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-base leading-relaxed px-4">
                    {step.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="pt-4 px-8">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full"
                        style={{ width: `${(index + 1) * 33}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Start Your Journey Button */}
            <div className="text-center mt-12">
              <Button 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 bg-[#3b82f6] hover:bg-[#2563eb] shadow-lg"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="get-started" className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-[#0a0e27] via-[#1a1f3a] to-[#0f1229]">
        {/* Parallax animated orbs */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-[#3b82f6]/20 rounded-full blur-3xl animate-pulse-glow parallax"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-[#8b5cf6]/20 rounded-full blur-3xl animate-pulse-glow parallax"
          style={{ transform: `translateY(${-scrollY * 0.08}px)`, animationDelay: '1s' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="container relative z-10">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Get Started with VitalSense
            </h2>
            <p className="text-xl text-gray-300">
              Choose your path to better health
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative overflow-hidden bg-white/95 backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in border-2 border-transparent hover:border-[#3b82f6]/50" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/5 to-transparent"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Login</CardTitle>
                <CardDescription className="text-base text-gray-600">Welcome back! Continue your health journey</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8 relative z-10">
                <Button size="lg" onClick={() => navigate('/auth')} className="w-full max-w-xs bg-[#3b82f6] hover:bg-[#2563eb] shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
                  Sign In
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/95 backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in border-2 border-transparent hover:border-[#8b5cf6]/50" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 to-transparent"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Sign Up</CardTitle>
                <CardDescription className="text-base text-gray-600">New to VitalSense? Start your journey today</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8 relative z-10">
                <Button size="lg" onClick={() => navigate('/auth')} className="w-full max-w-xs bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all">
                  Create Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-gray-50 py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">VitalSense</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI-powered companion for a healthier life.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <p className="text-sm text-muted-foreground">
                Email: support@vitalsense.com
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 VitalSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
