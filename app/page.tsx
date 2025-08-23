"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Users,
  Brain,
  BookOpen,
  Trophy,
  Zap,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Menu,
  X,
} from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [email, setEmail] = useState("")

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      university: "Stanford University",
      content:
        "PeerSpark transformed my study routine. The AI tutor helped me understand complex algorithms, and study pods made learning collaborative and fun!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=SC",
    },
    {
      name: "Marcus Johnson",
      role: "Pre-Med Student",
      university: "Harvard University",
      content:
        "The analytics feature is incredible. I can track my progress across subjects and the AI suggests optimal study schedules. My grades improved by 15%!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=MJ",
    },
    {
      name: "Elena Rodriguez",
      role: "Engineering Student",
      university: "MIT",
      content:
        "Finding study partners was always difficult until PeerSpark. Now I'm part of multiple pods and we tackle challenging problems together.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60&text=ER",
    },
  ]

  const features = [
    {
      icon: Users,
      title: "Smart Study Pods",
      description:
        "Join AI-matched study groups based on your subjects, learning style, and schedule. Collaborate with peers who complement your strengths.",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      icon: Brain,
      title: "AI-Powered Tutoring",
      description:
        "Get instant, personalized explanations for any topic. Our AI adapts to your learning pace and provides targeted practice problems.",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: BarChart3,
      title: "Learning Analytics",
      description:
        "Track your progress with detailed insights. Identify knowledge gaps and optimize your study schedule with data-driven recommendations.",
      gradient: "from-pink-500 to-red-600",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Coordinate study sessions effortlessly. AI suggests optimal meeting times and sends intelligent reminders to keep everyone on track.",
      gradient: "from-red-500 to-orange-600",
    },
    {
      icon: BookOpen,
      title: "Resource Vault",
      description:
        "Access a curated library of study materials, practice tests, and peer-shared resources. Everything organized by subject and difficulty.",
      gradient: "from-orange-500 to-yellow-600",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description:
        "Stay motivated with gamified learning. Earn badges, climb leaderboards, and celebrate milestones with your study community.",
      gradient: "from-yellow-500 to-green-600",
    },
  ]

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users },
    { number: "95%", label: "Grade Improvement", icon: TrendingUp },
    { number: "2M+", label: "Study Sessions", icon: Clock },
    { number: "4.9/5", label: "User Rating", icon: Star },
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Join up to 3 study pods",
        "Basic AI tutoring (10 questions/day)",
        "Simple progress tracking",
        "Community access",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "month",
      description: "For serious students",
      features: [
        "Unlimited study pods",
        "Advanced AI tutoring",
        "Detailed analytics & insights",
        "Priority matching",
        "Custom study schedules",
        "Resource sharing",
      ],
      popular: true,
    },
    {
      name: "Team",
      price: "$19.99",
      period: "month",
      description: "For study groups & classes",
      features: [
        "Everything in Pro",
        "Group management tools",
        "Instructor dashboard",
        "Advanced collaboration",
        "Custom integrations",
        "Priority support",
      ],
      popular: false,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full animate-float blur-3xl" />
        <div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-red-600/20 rounded-full animate-float blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-3/4 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-600/20 rounded-full animate-float blur-3xl"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">PeerSpark</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="premium-button text-white">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t animate-fade-in">
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
                  Testimonials
                </Link>
                <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="premium-button text-white w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3 h-3 mr-1" />
              Now in Private Beta
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Transform Your Learning with <span className="text-gradient">AI-Powered</span> Collaboration
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students who've revolutionized their study experience. Connect with perfect study
              partners, get instant AI tutoring, and track your progress with intelligent analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/register">
                <Button size="lg" className="premium-button text-white px-8 py-4 text-lg">
                  Start Learning Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg glass bg-transparent">
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Benefit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Target, title: "95% Grade Improvement", desc: "Students see average 15% grade boost" },
                { icon: Users, title: "Perfect Study Matches", desc: "AI finds your ideal study partners" },
                { icon: Zap, title: "Instant AI Help", desc: "Get explanations 24/7 from our AI tutor" },
              ].map((benefit, index) => (
                <Card
                  key={index}
                  className="glass card-hover animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gradient mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything You Need to <span className="text-gradient">Excel Academically</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform combines the power of AI with collaborative learning to create the ultimate
              study experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="card-hover animate-slide-in-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Loved by Students at <span className="text-gradient">Top Universities</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of students who've transformed their academic journey with PeerSpark.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="glass animate-scale-in">
              <CardContent className="p-8 lg:p-12">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-xl lg:text-2xl font-medium mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center justify-center space-x-4">
                    <img
                      src={testimonials[currentTestimonial].avatar || "/placeholder.svg"}
                      alt={testimonials[currentTestimonial].name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="text-left">
                      <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                      <div className="text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                      <div className="text-sm text-gradient font-medium">
                        {testimonials[currentTestimonial].university}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Choose Your <span className="text-gradient">Learning Journey</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core collaborative features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative card-hover animate-slide-in-right ${plan.popular ? "ring-2 ring-blue-500" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-gradient">
                    {plan.price}
                    <span className="text-lg text-muted-foreground font-normal">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className={`w-full ${plan.popular ? "premium-button text-white" : ""}`}>
                      {plan.name === "Free" ? "Get Started" : "Start Free Trial"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Stay Updated with <span className="text-gradient">PeerSpark</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get the latest features, study tips, and success stories delivered to your inbox.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" className="premium-button text-white">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">PeerSpark</span>
              </div>
              <p className="text-muted-foreground">Transforming education through AI-powered collaborative learning.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-foreground transition-colors">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 PeerSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
