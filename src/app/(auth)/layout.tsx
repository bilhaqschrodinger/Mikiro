import Link from "next/link";
import AuthBackground from "@/components/AuthBackground";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthBackground>
      <div className="text-center mb-8">
        <Link href="/" className="text-3xl font-bold">
          <span className="text-primary">Mikiro</span>
        </Link>
        <p className="text-muted text-sm mt-2">
          Share your thoughts. Start conversations.
        </p>
      </div>
      {children}
    </AuthBackground>
  );
}
