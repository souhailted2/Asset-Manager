import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, LogIn } from "lucide-react";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({ title: "يرجى إدخال اسم المستخدم وكلمة المرور", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username: username.trim(), password });
      const user = await res.json();
      onLogin(user);
    } catch (error: any) {
      toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(215 25% 12%) 0%, hsl(210 20% 16%) 30%, hsl(160 84% 20%) 70%, hsl(160 84% 30%) 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(160 84% 39% / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(199 89% 48% / 0.2) 0%, transparent 40%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-[fadeSlideUp_0.6s_ease-out]">
        <Card
          className="w-full border-0 overflow-visible"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: "linear-gradient(135deg, hsl(160 84% 39%) 0%, hsl(160 84% 50%) 50%, hsl(199 89% 48%) 100%)",
                  boxShadow: "0 4px 20px hsl(160 84% 39% / 0.4), 0 0 40px hsl(160 84% 39% / 0.15)",
                }}
              >
                <Package className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle
              className="text-2xl font-bold text-white"
              data-testid="text-login-title"
            >
              نظام إدارة المخزون
            </CardTitle>
            <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              تسجيل الدخول للمتابعة
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">
                  اسم المستخدم
                </Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  autoComplete="username"
                  className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  كلمة المرور
                </Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  autoComplete="current-password"
                  className="border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:border-white/30"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                data-testid="button-login"
                style={{
                  background: "linear-gradient(135deg, hsl(160 84% 39%) 0%, hsl(160 84% 45%) 100%)",
                  boxShadow: "0 4px 15px hsl(160 84% 39% / 0.3)",
                }}
              >
                <LogIn className="h-4 w-4" />
                {loading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <p
        className="relative z-10 mt-8 text-xs"
        style={{ color: "rgba(255, 255, 255, 0.35)" }}
        data-testid="text-footer-version"
      >
        نظام إدارة المخزون v1.0
      </p>

      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
