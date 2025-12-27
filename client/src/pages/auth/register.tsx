import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { z } from "zod";

const formSchema = api.auth.register.input;

export default function RegisterPage() {
  const { register, isRegistering, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      role: "student",
      universities: [],
      expertise: [],
      targetUniversities: [],
    },
  });

  const selectedRole = form.watch("role");

  // Helper to handle comma-separated string inputs for array fields
  const handleArrayInput = (field: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    field.onChange(value.split(",").map((s) => s.trim()).filter(Boolean));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    register(values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4 py-8">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-accent">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-display">Create Account</CardTitle>
          <CardDescription>Join our community of scholars and mentors</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="janed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a...</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student seeking mentorship</SelectItem>
                        <SelectItem value="mentor">Mentor offering guidance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === "mentor" && (
                <div className="space-y-4 pt-2 border-t">
                  <FormField
                    control={form.control}
                    name="universities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Universities (Alma Mater)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Harvard, Stanford (comma separated)" 
                            onChange={handleArrayInput(field)}
                          />
                        </FormControl>
                        <FormDescription>Comma separated list</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Areas of Expertise</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Essay Writing, SAT Prep, Career Planning" 
                            onChange={handleArrayInput(field)}
                          />
                        </FormControl>
                        <FormDescription>Comma separated list</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedRole === "student" && (
                <div className="space-y-4 pt-2 border-t">
                  <FormField
                    control={form.control}
                    name="targetUniversities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Universities</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MIT, Yale (comma separated)" 
                            onChange={handleArrayInput(field)}
                          />
                        </FormControl>
                        <FormDescription>Where do you want to go?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <Button type="submit" className="w-full mt-6" disabled={isRegistering}>
                {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
