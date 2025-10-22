
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MotionDiv, useScroll, useTransform } from '@/components/client/motion-div';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';

const howItWorks = [
  {
    icon: <SearchIcon />,
    title: 'Find a Ride',
    description:
      'Enter your destination and search for available rides that match your route and schedule.',
  },
  {
    icon: <CarIcon />,
    title: 'Offer a Ride',
    description:
      'Share your travel plans, set a price per seat, and get bookings from fellow travelers.',
  },
  {
    icon: <UsersIcon />,
    title: 'Connect & Travel',
    description:
      'Connect with your driver or passengers, and enjoy a safe and affordable journey together.',
  },
];

const testimonials = [
  {
    name: 'Sarah J.',
    role: 'Passenger',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar1'),
    quote:
      'PaddleShare made my commute so much easier and affordable. I met some great people too!',
  },
  {
    name: 'Mike D.',
    role: 'Driver',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar2'),
    quote:
      'I love that I can cover my fuel costs by offering rides. The platform is super easy to use.',
  },
  {
    name: 'Emily R.',
    role: 'Passenger',
    avatar: PlaceHolderImages.find(p => p.id === 'avatar3'),
    quote:
      'A fantastic way to travel sustainably and save money. Highly recommended for students!',
  },
];

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
          {heroImage && (
            <MotionDiv
              className="absolute inset-0 z-0"
              style={{ y }}
            >
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            </MotionDiv>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="relative container px-4 sm:px-6 lg:px-8">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-headline font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  Share your ride.
                  <br />
                  Save money. Save the planet.
                </h1>
              </MotionDiv>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <p className="mx-auto mt-6 max-w-[700px] text-muted-foreground md:text-xl">
                  PaddleShare is the future of travel. A carpooling platform connecting you with people heading your way.
                </p>
              </MotionDiv>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <form action="/search" className="mt-8 max-w-2xl mx-auto">
                    <div className="p-2 rounded-lg bg-background/80 backdrop-blur-sm flex items-center gap-2">
                        <Search className="ml-2 h-5 w-5 text-muted-foreground shrink-0" />
                        <Input name="from" placeholder="Leaving from..." className="h-12 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1" />
                        <Input name="to" placeholder="Going to..." className="h-12 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1" />
                        <Button type="submit" size="lg" className="h-12 text-base">
                          Find a ride
                        </Button>
                    </div>
                </form>
              </MotionDiv>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                Getting started with PaddleShare is as easy as 1-2-3.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl items-start gap-8 sm:grid-cols-3 sm:gap-12">
              {howItWorks.map((step, index) => (
                <MotionDiv
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="grid gap-2 text-center"
                >
                  <div className="flex justify-center items-center">
                    <div className="flex items-center justify-center rounded-full bg-primary/10 p-4 text-primary">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-headline">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <h2 className="text-center text-3xl font-bold font-headline tracking-tighter sm:text-4xl">
              What Our Community Says
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {testimonials.map((testimonial, index) => (
                    <MotionDiv 
                        key={index} 
                        className="bg-card p-6 flex flex-col justify-between h-full rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                    >
                        <p className="text-muted-foreground">"{testimonial.quote}"</p>
                        <div className="mt-6 flex items-center gap-4">
                            {testimonial.avatar && (
                            <Avatar>
                                <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.avatar.imageHint} />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            )}
                            <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </div>
                    </MotionDiv>
                  ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container text-center">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">
              Ready to Hit the Road?
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground md:text-xl">
              Join thousands of commuters saving money and the planet. Your next ride is just a click away.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg" className="font-headline text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
                <Link href="/signup">Sign Up Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
