

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsers, UserProfile } from '@/services/users';
import { getAuthenticatedUser } from "@/lib/auth";
import { UsersTable } from "@/components/users-table";

export default async function UsersPage() {
  const users = await getUsers();
  const currentUser = await getAuthenticatedUser();
  
  if (currentUser?.role !== 'Admin') {
     return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Users</h2>
          <p className="text-muted-foreground">
            Manage users and their roles.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable initialUsers={users} currentUser={currentUser} />
        </CardContent>
      </Card>
    </div>
  );
}
