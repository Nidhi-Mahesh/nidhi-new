import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, MessageSquare, Newspaper, Users } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "Total Posts", value: "1,234", icon: <Newspaper className="h-6 w-6 text-muted-foreground" /> },
    { title: "Subscribers", value: "567", icon: <Users className="h-6 w-6 text-muted-foreground" /> },
    { title: "Comments", value: "8,901", icon: <MessageSquare className="h-6 w-6 text-muted-foreground" /> },
    { title: "Total Views", value: "2.3M", icon: <BarChart className="h-6 w-6 text-muted-foreground" /> },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <p className="text-muted-foreground">Recent comments and likes will be displayed here.</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A list of your most recent posts will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
