export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Home layout specific components can go here */}
      {children}
    </div>
  );
}
