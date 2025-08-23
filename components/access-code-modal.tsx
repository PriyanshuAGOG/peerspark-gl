"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { accessCodeService } from '@/lib/services/access-codes';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface AccessCodeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function AccessCodeModal({ isOpen, onSuccess }: AccessCodeModalProps) {
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim() || !user || !profile) {
      toast({ title: "Please enter an access code.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const result = await accessCodeService.verifyCode(accessCode);

      if (result.isValid && result.codeDetails) {
        // Claim the code and update the user's profile
        await accessCodeService.claimCode(result.codeDetails.$id, user.$id);
        await refreshProfile(); // Re-fetch profile to get hasBetaAccess=true

        toast({
          title: "Welcome to the Beta!",
          description: "Your access code has been accepted.",
        });
        onSuccess(); // Close the modal
      } else {
        toast({
          title: "Invalid Code",
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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6" />
            </div>
          <DialogTitle>Beta Access Required</DialogTitle>
          <DialogDescription>
            This is a private beta. Please enter your access code to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
              {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock Access'}
            </Button>
          </form>
      </DialogContent>
    </Dialog>
  );
}
