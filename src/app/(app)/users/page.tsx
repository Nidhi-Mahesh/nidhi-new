import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users as UsersIcon } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Users</h2>
       <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[400px]">
            <UsersIcon className="h-16 w-16 mb-4" />
            <p className="font-bold">User Management Coming Soon</p>
            <p>Invite, edit, and manage users and their roles.</p>
        </CardContent>
      </Card>
    </div>
  );
}
