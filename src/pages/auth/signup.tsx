import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import authServices from "@/services/authServices";
import { RoleType, SignUpType } from "@/types/auth";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { useAuth } from "@/store/useAuth";
import { toast } from "sonner";
import schoolServices from "@/services/schoolServices";
import { SchoolType } from "@/types/school";

const Signup = () => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleType | null>(null);
  const [schoolId, setSchoolId] = useState("");

  const navigate = useNavigate();

  // Get school query
  const { data: schools, status: schoolStatus } = useQuery({
    queryKey: ["schools"],
    queryFn: schoolServices.getAllSchools,
  });

  // React Query
  const { mutate: signUp, status } = useMutation({
    mutationFn: (payload: SignUpType) => authServices.signUp(payload),
    onSuccess: (data) => {
      if (data.data.user !== user) {
        // Avoid unnecessary state updates
        setUser(data.data.user);
      }
      toast(`Registration successful: ${data.data}`);
      navigate(ROUTES.login);
    },
    onError: (data) => {
      toast(`Registration failed: ${data.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast("Role is required");
      return;
    }

    const payload: SignUpType = {
      firstName,
      lastName,
      email,
      password,
      role,
      schoolId,
    };

    signUp(payload);
  };

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Sign up</CardTitle>
                <CardDescription>
                  Enter your details below to Sign Up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">First name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Last name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="m@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {/* Role */}
                    <div className="grid gap-2">
                      <Label htmlFor="label">Role</Label>
                      <div className="flex items-center">
                        <Select
                          value={role ?? ""}
                          onValueChange={(value) => setRole(value as RoleType)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Role</SelectLabel>
                              <SelectItem value={RoleType.STUDENT}>
                                Student
                              </SelectItem>
                              <SelectItem value={RoleType.FACULTY}>
                                Faculty
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* School */}
                    <div className="grid gap-2">
                      <Label htmlFor="label">School</Label>
                      <div className="flex items-center">
                        <Select
                          value={schoolId ?? ""}
                          onValueChange={(value) => setSchoolId(value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>School</SelectLabel>
                              {schoolStatus === "success" &&
                                schools?.map((school: SchoolType) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Button */}
                    <Button type="submit" className="w-full">
                      {status === "pending" ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Sign up"
                      )}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Have an account?{" "}
                    <Link
                      to={ROUTES.login}
                      className="underline underline-offset-4"
                    >
                      Sign In
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
