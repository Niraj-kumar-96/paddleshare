import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from './logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

const socialLinks = [
  { icon: <Twitter className="h-5 w-5" />, href: '#', name: 'Twitter' },
  { icon: <Github className="h-5 w-5" />, href: '#', name: 'GitHub' },
  { icon: <Linkedin className="h-5 w-5" />, href: '#', name: 'LinkedIn' },
];

const footerLinks = [
  { title: 'Product', links: [{ name: 'Find a Ride', href: '/search' }, { name: 'Offer a Ride', href: '/offer-ride' }, { name: 'Dashboard', href: '/dashboard' }] },
  { title: 'Company', links: [{ name: 'About Us', href: '/about' }, { name: 'Contact', href: '/contact' }, { name: 'Careers', href: '#' }] },
  { title: 'Legal', links: [{ name: 'Terms of Service', href: '#' }, { name: 'Privacy Policy', href: '#' }] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-muted-foreground max-w-xs">
              Connecting you with people heading your way.
            </p>
            <form className="mt-6 flex w-full max-w-sm items-center space-x-2">
              <Input type="email" placeholder="Email for newsletter" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-headline font-semibold">{section.title}</h4>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PaddleShare. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {socialLinks.map((social) => (
              <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">{social.name}</span>
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
