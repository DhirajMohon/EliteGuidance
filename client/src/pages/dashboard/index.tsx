import { useAuth } from "@/hooks/use-auth";
import { useRequests, useUpdateRequestStatus } from "@/hooks/use-requests";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Search, MessageSquare, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { clsx } from "clsx";

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) return null; // Should be handled by layout/redirect

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}. Here's what's happening.
          </p>
        </div>
        {user.role === "student" && (
          <Link href="/mentors">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Search className="mr-2 h-4 w-4" /> Find a Mentor
            </Button>
          </Link>
        )}
      </div>

      {user.role === "mentor" ? <MentorDashboard /> : <StudentDashboard />}
    </div>
  );
}

function StudentDashboard() {
  const { data: requests, isLoading } = useRequests();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];
  const activeMentorships = requests?.filter(r => r.status === 'accepted') || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Active Mentorships */}
      <Card className="border-t-4 border-t-primary shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Mentorships
          </CardTitle>
          <CardDescription>Your current mentors and chats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeMentorships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              No active mentorships yet.
              <br />
              <Link href="/mentors" className="text-primary hover:underline">Find a mentor</Link> to get started.
            </div>
          ) : (
            activeMentorships.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-secondary">
                <div>
                  <p className="font-semibold text-primary">{req.mentor?.name}</p>
                  <p className="text-sm text-muted-foreground">Started {format(new Date(req.createdAt!), 'MMM d, yyyy')}</p>
                </div>
                <Link href={`/messages?requestId=${req.id}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" /> Chat
                  </Button>
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card className="border-t-4 border-t-accent shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Pending Requests
          </CardTitle>
          <CardDescription>Requests awaiting mentor approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending requests.</div>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} className="p-4 rounded-lg bg-muted/20 border">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold">{req.mentor?.name}</p>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">"{req.message}"</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MentorDashboard() {
  const { data: requests, isLoading } = useRequests();
  const { mutate: updateStatus, isPending } = useUpdateRequestStatus();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const incomingRequests = requests?.filter(r => r.status === 'pending') || [];
  const myStudents = requests?.filter(r => r.status === 'accepted') || [];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{myStudents.length}</div>
            <p className="text-sm text-muted-foreground">Active Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent">{incomingRequests.length}</div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">5.0</div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Requests */}
        <Card className="border-t-4 border-t-accent shadow-sm">
          <CardHeader>
            <CardTitle>Incoming Requests</CardTitle>
            <CardDescription>Students requesting your mentorship</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No new requests at the moment.</div>
            ) : (
              incomingRequests.map(req => (
                <div key={req.id} className="p-5 rounded-lg border bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{req.student?.name}</p>
                      <p className="text-xs text-muted-foreground">Requested {format(new Date(req.createdAt!), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded text-sm italic text-muted-foreground">
                    "{req.message}"
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isPending}
                      onClick={() => updateStatus({ id: req.id, status: 'rejected' })}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> Decline
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isPending}
                      onClick={() => updateStatus({ id: req.id, status: 'accepted' })}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" /> Accept
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Students */}
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <CardTitle>My Students</CardTitle>
            <CardDescription>Your active mentorship sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">You don't have any students yet.</div>
            ) : (
              myStudents.map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {req.student?.name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{req.student?.name}</p>
                      <p className="text-xs text-muted-foreground">Joined {format(new Date(req.createdAt!), 'MMM d')}</p>
                    </div>
                  </div>
                  <Link href={`/messages?requestId=${req.id}`}>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
