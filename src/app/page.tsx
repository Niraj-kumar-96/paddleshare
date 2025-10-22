import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Car, Leaf, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import EcoCounter from '@/components/eco-counter';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MotionDiv } from '@/components/client/motion-div';

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

const featuredRides = [
  { id: 1, from: 'New York, NY', to: 'Boston, MA', price: 35, image: PlaceHolderImages.find(p => p.id === 'ride1') },
  { id: 2, from: 'San Francisco, CA', to: 'Los Angeles, CA', price: 45, image: PlaceHolderImages.find(p => p.id === 'ride2') },
  { id: 3, from: 'Chicago, IL', to: 'Detroit, MI', price: 30, image: PlaceHolderImages.find(p => p.id === 'ride3') },
  { id: 4, from: 'Austin, TX', to: 'Houston, TX', price: 25, image: PlaceHolderImages.find(p => p.id === 'ride4') },
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
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
          <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            )}
          </MotionDiv>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div className="relative px-4 sm:px-6 lg:px-8">
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
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button asChild size="lg" className="font-headline text-lg">
                  <Link href="/search">Find a Ride</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="font-headline text-lg">
                  <Link href="/offer-ride">Offer a Ride</Link>
                </Button>
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

        {/* Eco Counter Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Leaf className="w-12 h-12 text-primary" />
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">
                Join the Green Movement
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Every ride shared on PaddleShare contributes to a healthier planet. See our collective impact.
              </p>
              <EcoCounter />
              <p className="font-medium text-muted-foreground">kg of CO₂ saved and counting!</p>
            </div>
          </div>
        </section>

        {/* Featured Rides Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
              <div>
                <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Featured Rides</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  Explore popular routes and book your next adventure.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/search">
                  View All Rides <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12">
              <Carousel opts={{ align: 'start', loop: true }}>
                <CarouselContent>
                  {featuredRides.map((ride) => (
                    <CarouselItem key={ride.id} className="md:basis-1/2 lg:basis-1/3">
                      <MotionDiv
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <Card className="overflow-hidden group bg-card/60 backdrop-blur-sm border-border/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                          <CardContent className="p-0">
                            <div className="relative h-48 w-full">
                              {ride.image && (
                                <Image
                                  src={ride.image.imageUrl}
                                  alt={ride.image.description}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  data-ai-hint={ride.image.imageHint}
                                />
                              )}
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-lg">{ride.from}</p>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                <p className="font-semibold text-lg">{ride.to}</p>
                              </div>
                              <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Price per seat</p>
                                <p className="text-xl font-bold text-primary">${ride.price}</p>
                              </div>
                              <Button asChild className="w-full mt-4">
                                <Link href={`/search?to=${ride.to}`}>Book Now</Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </MotionDiv>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6">
            <h2 className="text-center text-3xl font-bold font-headline tracking-tighter sm:text-4xl">
              What Our Community Says
            </h2>
            <div className="mt-12">
              <Carousel opts={{ align: 'start', loop: true }}>
                <CarouselContent>
                  {testimonials.map((testimonial, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                      <div className="p-2">
                        <Card className="h-full bg-card/60 backdrop-blur-sm border-border/20 shadow-lg">
                          <CardContent className="p-6 flex flex-col justify-between h-full">
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
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
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
