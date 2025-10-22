
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MotionDiv } from "@/components/client/motion-div";

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-24 flex justify-center">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-card/60 backdrop-blur-sm border-border/20 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline tracking-tighter sm:text-4xl">Get in Touch</CardTitle>
            <CardDescription className="text-muted-foreground md:text-xl">
              Have questions or feedback? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Question about a ride" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." className="min-h-[150px]" />
              </div>
              <Button 
                type="submit" 
                className="w-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                size="lg"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
