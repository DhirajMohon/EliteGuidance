import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="flex flex-col items-center justify-center text-center p-8">
          <div className="rounded-full bg-red-100 p-3 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">404 Page Not Found</h1>
          <p className="text-gray-500 mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/">
            <Button variant="default" className="w-full">
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
