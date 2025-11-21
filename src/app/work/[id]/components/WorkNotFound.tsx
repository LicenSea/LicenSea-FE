import { Navbar } from "@/components/Navbar/Navbar";

export const WorkNotFound = () => {
  return (
    <div className="min-w-screen min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Work not found</p>
      </div>
    </div>
  );
};
