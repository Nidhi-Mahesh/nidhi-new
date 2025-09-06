'use client';

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      firstName: user?.displayName?.split(" ")[0] || "",
      lastName: user?.displayName?.split(" ")[1] || "",
      email: user?.email || ""
    }
  });

  const onProfileSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsProfileSaving(true);
    try {
      const displayName = `${data.firstName} ${data.lastName}`;
      await updateUserProfile({ displayName });
      toast({ title: "Profile updated successfully!" });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible."
      )
    ) {
      // Implement account deletion logic here
      toast({
        title: "Account Deletion",
        description: "Account deletion feature not yet implemented."
      });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">
        Settings
      </h2>
      <p className="text-muted-foreground">
        Manage your account and application settings.
      </p>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...registerProfile("firstName")} />
                    {profileErrors.firstName && (
                      <p className="text-sm text-destructive">
                        {profileErrors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...registerProfile("lastName")} />
                    {profileErrors.lastName && (
                      <p className="text-sm text-destructive">
                        {profileErrors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...registerProfile("email")}
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isProfileSaving}>
                  {isProfileSaving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Account Tab (Only Delete Account now) */}
        <TabsContent value="account" className="space-y-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all of your content. This
                action is not reversible.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete My Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
