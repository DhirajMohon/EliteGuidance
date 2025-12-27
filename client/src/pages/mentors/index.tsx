import { useState } from "react";
import { useMentors, useMentor } from "@/hooks/use-mentors";
import { useCreateRequest } from "@/hooks/use-requests";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, GraduationCap, Star, Search, Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function MentorsPage() {
  const [filters, setFilters] = useState({ university: "", expertise: "" });
  const { data: mentors, isLoading } = useMentors(filters);

  // Debounce could be added here for production
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-display font-bold text-primary">Browse Mentors</h1>
        <p className="text-muted-foreground max-w-2xl">
          Connect with experienced mentors from top universities who can guide you through your academic journey.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by University (e.g. MIT)" 
              className="pl-9"
              value={filters.university}
              onChange={(e) => handleFilterChange("university", e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by Expertise (e.g. Physics)" 
              className="pl-9"
              value={filters.expertise}
              onChange={(e) => handleFilterChange("expertise", e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : mentors?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No mentors found</h3>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors?.map(user => (
            <MentorCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function MentorCard({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const { mutate: createRequest, isPending } = useCreateRequest();
  
  // Form handling
  const formSchema = z.object({ message: z.string().min(10, "Message must be at least 10 characters") });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createRequest({
      mentorId: user.id,
      message: data.message
    }, {
      onSuccess: () => {
        setOpen(false);
        reset();
      }
    });
  };

  const mentorProfile = user.mentor;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-t-4 border-t-transparent hover:border-t-primary">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-accent mt-1">
              Top Rated Mentor
            </CardDescription>
          </div>
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 text-sm font-medium">
            <Star className="h-3 w-3 fill-yellow-700 mr-1" />
            {mentorProfile?.rating || 5}.0
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Universities</p>
          <div className="flex flex-wrap gap-2">
            {mentorProfile?.universities?.map((uni: string, i: number) => (
              <Badge key={i} variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary border-primary/20">
                {uni}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Expertise</p>
          <div className="flex flex-wrap gap-2">
            {mentorProfile?.expertise?.map((exp: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {exp}
              </Badge>
            ))}
          </div>
        </div>
        
        {mentorProfile?.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3 italic">
            "{mentorProfile.bio}"
          </p>
        )}
      </CardContent>

      <CardFooter>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">Request Mentorship</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Mentorship from {user.name}</DialogTitle>
              <DialogDescription>
                Introduce yourself and explain what you're looking for help with.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Textarea 
                  placeholder="Hi, I'm interested in applying to..." 
                  className="min-h-[100px]"
                  {...register("message")}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Request"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
