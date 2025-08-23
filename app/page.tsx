"use client"

import React, { useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ArrowRight, CheckCircle, Users, BarChart3, Clock, Star, Twitter, Linkedin, Gitlab } from 'lucide-react';
import { waitlistService } from '@/lib/services/waitlist';

// Placeholder for 3D bird component with floating animation
const Bird3D = () => (
  <motion.div
    animate={{ y: [-5, 5, -5] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="w-64 h-64 lg:w-96 lg:h-96 bg-gray-200 rounded-full flex items-center justify-center"
  >
    <p className="text-muted-foreground">[3D Bird Logo]</p>
  </motion.div>
);

// Placeholder for UI preview component
const UiPreview = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center shadow-lg"
    >
      <p className="text-muted-foreground">[Floating Device Mockup]</p>
    </motion.div>
  );

export default function WaitlistPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast({ title: "Please fill in both fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await waitlistService.joinWaitlist(name, email);
      toast({
        title: "You're on the list! 🎉",
        description: "We'll notify you when PeerSpark is ready.",
      });
      setName('');
      setEmail('');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (error: any) {
      toast({
        title: "An error occurred.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-white text-[#1a1a1a] font-sans overflow-x-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} gravity={0.1} colors={['#FF7A59', '#FFFFFF', '#F5F5F5']} />}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center py-20 px-4">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="text-center lg:text-left"
          >
            <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold leading-tight mb-4">
              Transform Learning <span className="text-[#FF7A59]">Together.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              PeerSpark is the AI-powered social learning platform that connects you with the perfect study partners and resources to help you excel.
            </motion.p>
            <motion.div variants={itemVariants} className="bg-[#FAFAFA] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto lg:mx-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input type="text" placeholder="Your Name" className="bg-white" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                <Input type="email" placeholder="Your Email" className="bg-white" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Button type="submit" className="w-full bg-[#FF7A59] text-white hover:bg-[#ff8b70]" disabled={isLoading}>
                    {isLoading ? 'Joining...' : 'Join the Waitlist'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
          <div className="flex justify-center items-center">
            <Bird3D />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-20 bg-[#F5F5F5]"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Why You'll Love PeerSpark</h2>
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { icon: Users, title: "Collaborate", description: "Connect with peers in AI-matched study pods for any subject." },
              { icon: Sparkles, title: "AI Tutoring", description: "Get instant, personalized help and explanations 24/7." },
              { icon: BarChart3, title: "Analytics", description: "Track your progress and get data-driven study recommendations." }
            ].map((feature, i) => (
              <motion.div key={i} variants={itemVariants} whileHover={{ y: -5, borderColor: '#FF7A59' }} className="bg-white p-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
                <feature.icon className="w-10 h-10 text-[#FF7A59] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
        className="py-20"
      >
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-12">Get Started in Seconds</h2>
              <motion.div
                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                className="grid md:grid-cols-3 gap-12"
              >
                  <motion.div variants={itemVariants} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF7A59] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                      <h3 className="text-xl font-bold mb-2">Join the Waitlist</h3>
                      <p className="text-gray-600">Sign up to get your exclusive early access invite.</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF7A59] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                      <h3 className="text-xl font-bold mb-2">Get Your Invite</h3>
                      <p className="text-gray-600">Receive your personal access code to join the beta.</p>
                  </motion.div>
                  <motion.div variants={itemVariants} className="text-center">
                      <div className="w-16 h-16 rounded-full bg-[#FF7A59] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                      <h3 className="text-xl font-bold mb-2">Start Learning</h3>
                      <p className="text-gray-600">Enter the app and transform your study habits.</p>
                  </motion.div>
              </motion.div>
          </div>
      </motion.section>

      {/* Other sections would be animated similarly */}
      <section className="py-20"><div className="container mx-auto px-4"><UiPreview /></div></section>
      <section className="py-20 bg-[#F5F5F5]"><div className="container mx-auto px-4"><div className="grid md:grid-cols-3 gap-8 text-center"><div><p className="text-5xl font-bold text-[#FF7A59]">95%</p><p className="text-lg text-gray-600">Grade Improvement</p></div><div><p className="text-5xl font-bold text-[#FF7A59]">10K+</p><p className="text-lg text-gray-600">Students on Waitlist</p></div><div><p className="text-5xl font-bold text-[#FF7A59]">4.9/5</p><p className="text-lg text-gray-600">Anticipated User Rating</p></div></div></div></section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Spark Your Potential?</h2>
            <div className="w-24 h-1 bg-[#FF7A59] mx-auto mb-8"></div>
            <div className="flex justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-[#FAFAFA] p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.05)] w-full max-w-md">
                    <h3 className="font-bold text-lg mb-4">Get Your Early Invite</h3>
                    <ul className="space-y-2 text-left mb-6">
                        <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#FF7A59] mr-2" /><span>Priority access to the beta</span></li>
                        <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#FF7A59] mr-2" /><span>Exclusive beta-tester badge</span></li>
                        <li className="flex items-center"><CheckCircle className="w-5 h-5 text-[#FF7A59] mr-2" /><span>Shape the future of PeerSpark</span></li>
                    </ul>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input type="text" placeholder="Your Name" className="bg-white" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                        <Input type="email" placeholder="Your Email" className="bg-white" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                        <motion.div whileHover={{ y: -2, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                          <Button type="submit" className="w-full bg-[#FF7A59] text-white hover:bg-[#ff8b70]" disabled={isLoading}>
                              {isLoading ? 'Submitting...' : 'Get My Invite'}
                          </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 text-center text-gray-600">
              <div className="flex justify-center space-x-6 mb-4">
                  <a href="#" className="hover:text-[#FF7A59]"><Twitter /></a>
                  <a href="#" className="hover:text-[#FF7A59]"><Linkedin /></a>
                  <a href="#" className="hover:text-[#FF7A59]"><Gitlab /></a>
              </div>
              <p>&copy; {new Date().getFullYear()} PeerSpark. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
