"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { accessCodeService } from '@/lib/services/access-codes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import Cookies from 'js-cookie';

export default function BetaAccessPage() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast({ title: "Please enter an access code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const result = await accessCodeService.verifyCode(accessCode);

      if (result.isValid) {
        // Set a cookie to remember that the user has access.
        // This is a simple client-side flag. A more robust system might
        // tie the claimed code to the user account on the backend.
        Cookies.set('peer-spark-beta-access', 'granted', { expires: 365 });

        toast({
          title: "Access Granted!",
          description: "Welcome to the PeerSpark beta. You can now register or log in.",
        });

        // Redirect to the register page to encourage new sign-ups
        router.push('/register');

      } else {
        toast({
          title: "Access Denied",
          description: result.message,
          variant: "destructive",
        });
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle>Beta Access</CardTitle>
          <CardDescription>Enter your access code to join the PeerSpark beta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Your Access Code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={isLoading}
              className="text-center"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Enter Beta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
