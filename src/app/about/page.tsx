import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Globe, Leaf, Users } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/client/motion-div";

const values = [
    {
        icon: <Leaf className="w-8 h-8 text-primary" />,
        title: "Sustainability",
        description: "We are committed to reducing carbon emissions one shared ride at a time, creating a greener future for everyone."
    },
    {
        icon: <Users className="w-8 h-8 text-primary" />,
        title: "Community",
        description: "We believe in the power of connection, building a trusted community of drivers and passengers."
    },
    {
        icon: <Globe className="w-8 h-8 text-primary" />,
        title: "Accessibility",
        description: "Making travel more affordable and accessible for people everywhere, regardless of their location."
    }
];

export default function AboutPage() {
  const aboutHeroImage = PlaceHolderImages.find(p => p.id === 'about-hero');

  return (
    <div className="container py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <MotionDiv
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Our Mission: A Greener, More Connected World
          </h1>
          <p className="mt-6 text-muted-foreground md:text-xl">
            At PaddleShare, we're reimagining travel. Our mission is to make transportation sustainable, affordable, and community-driven. By connecting drivers with empty seats to passengers heading in the same direction, we're reducing traffic, cutting down on carbon emissions, and fostering new friendships along the way.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signup">Join the Movement</Link>
          </Button>
        </MotionDiv>
        <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          {aboutHeroImage && (
            <Image
              src={aboutHeroImage.imageUrl}
              alt={aboutHeroImage.description}
              width={600}
              height={400}
              className="rounded-xl shadow-2xl shadow-primary/10"
              data-ai-hint={aboutHeroImage.imageHint}
            />
          )}
        </MotionDiv>
      </div>

      <div className="py-16 md:py-24">
        <h2 className="text-center text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Our Core Values</h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {values.map((value, index) => (
                <MotionDiv
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                    className="flex flex-col items-center p-6 rounded-lg bg-card shadow-lg"
                >
                    {value.icon}
                    <h3 className="mt-4 text-xl font-bold font-headline">{value.title}</h3>
                    <p className="mt-2 text-muted-foreground">{value.description}</p>
                </MotionDiv>
            ))}
        </div>
      </div>
    </div>
  );
}
