import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, BookOpen, Users, Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://pixabay.com/get/gd4a875d6d2d7c0805d0c4907023a4404fefa3b7815c7217ec8f2c8ffa8e17ea2156580e69b40714f10a0ea566de44a164762c3809bd27eb6313c80340a424809_1280.png')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl animate-enter">
              Unlock Your Academic Potential
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-foreground/80 max-w-2xl mx-auto">
              Connect with elite mentors from top universities. Receive personalized guidance, strategic advice, and the support you need to achieve your dreams.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 h-12 shadow-xl shadow-accent/20">
                  Find Your Mentor
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="link" className="text-white hover:text-white/80">
                  Log in <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg shadow-gray-100 border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-primary mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Mentorship</h3>
              <p className="text-muted-foreground">Gain insights from students and alumni who have walked the path you aspire to follow.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg shadow-gray-100 border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-accent mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tailored Guidance</h3>
              <p className="text-muted-foreground">Personalized roadmaps for university applications, test prep, and career planning.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-lg shadow-gray-100 border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proven Results</h3>
              <p className="text-muted-foreground">Our students consistently gain admission to Ivy League and top-tier institutions worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Image Split */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
              {/* mentorship session library */}
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
                alt="Students studying" 
                className="rounded-2xl shadow-2xl relative z-10"
              />
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-display font-bold mb-6 text-primary">Why EliteGuidance?</h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Navigating the complex world of higher education and career development is challenging. 
                  EliteGuidance bridges the gap between ambition and achievement.
                </p>
                <p>
                  Whether you're aiming for Harvard, Oxford, or MIT, our mentors provide the insider 
                  knowledge that textbooks and counselors often miss.
                </p>
                <div className="pt-4">
                  <Link href="/register">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                      Join Our Community
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
