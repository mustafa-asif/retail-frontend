import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore, User } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const USERS = [
  { id: 1, username: 'admin',   password: 'admin123',   role: 'admin',   storeId: null,  name: 'Admin User',    branch: null },
  { id: 2, username: 'gulshan', password: 'gulshan123', role: 'manager', storeId: 1,     name: 'Gulshan Manager', branch: 'Gulshan' },
  { id: 3, username: 'defense', password: 'defense123', role: 'manager', storeId: 2,     name: 'Defense Manager', branch: 'Defense' },
  { id: 4, username: 'awami',   password: 'awami123',   role: 'manager', storeId: 3,     name: 'Awami Manager',   branch: 'Awami' },
];

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: LoginFormValues) {
    const user = USERS.find((u) => u.username === values.username && u.password === values.password);

    if (user) {
      // Omit password before storing
      const { password, ...userWithoutPassword } = user;
      
      login(userWithoutPassword as User, 'simulated-jwt-token');
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } else {
      toast.error('Invalid username or password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-[#1e293b] font-sans p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white tracking-widest">RP</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">RETAIL PRO</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Enter your username" {...register("username")} />
              {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 mt-6 text-sm text-slate-500">
          <p>Demo Credentials: admin / admin123</p>
        </CardFooter>
      </Card>
    </div>
  );
}
