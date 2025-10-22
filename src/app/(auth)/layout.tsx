import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <Link href="/" className="absolute top-8 left-8 z-20">
        <Logo />
      </Link>
      <div className="relative z-10 w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}
