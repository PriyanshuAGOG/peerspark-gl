"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.sendPasswordRecovery(email)
      setIsSubmitted(true)
      toast({
        title: "Check your email",
        description: "A password reset link has been sent to your email address.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">PeerSpark</span>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
            <CardDescription>
              {isSubmitted
                ? "You can close this page now."
                : "Enter your email to receive a password reset link."}
            </CardDescription>
          </CardHeader>
          {!isSubmitted && (
            <>
              <CardContent>
                <form onSubmit={handlePasswordReset}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="text-center">
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
