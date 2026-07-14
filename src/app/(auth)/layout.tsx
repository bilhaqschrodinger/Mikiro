import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold">
            <span className="text-primary">Mikiro</span>
          </Link>
          <p className="text-muted text-sm mt-2">
            Share your thoughts. Start conversations.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
