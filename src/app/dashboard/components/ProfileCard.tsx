import { Copy, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileCardProps {
  currentUserAddress: string;
}

const shortenAddress = (address: string, start = 8, end = 6): string => {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const ProfileCard = ({ currentUserAddress }: ProfileCardProps) => {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a3f9d8] to-[#e6fc73] flex items-center justify-center text-2xl font-bold text-[#262d5c]">
            {currentUserAddress.slice(2, 4).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-sm">
                {shortenAddress(currentUserAddress)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  navigator.clipboard.writeText(currentUserAddress);
                }}
                title="Copy address"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
          </div>
          <Button onClick={() => router.push("/upload")}>
            <Upload className="w-4 h-4 mr-2" />
            Upload New Work
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
