
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help with Modern Chyrp.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>The support page is currently under construction. Please check back later.</p>
        </CardContent>
      </Card>
    </div>
  );
}
