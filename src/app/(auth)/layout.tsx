
import { Logo } from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authBgImage = PlaceHolderImages.find(p => p.id === 'auth-bg');

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      {authBgImage && (
        <Image
          src={authBgImage.imageUrl}
          alt={authBgImage.description}
          fill
          className="absolute inset-0 z-0 object-cover opacity-20"
          data-ai-hint={authBgImage.imageHint}
        />
      )}
      <Link href="/" className="absolute top-8 left-8 z-20">
        <Logo />
      </Link>
      <div className="relative z-10 w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
