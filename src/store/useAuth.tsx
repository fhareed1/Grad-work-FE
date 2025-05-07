import schoolServices from "@/services/schoolServices";
import { UserType } from "@/types/auth";
import { create } from "zustand";

interface AuthState {
  user: UserType | null;
  schoolName: string | null;
  setUser: (user: UserType | null) => void;
}

const savedUser: string | null = localStorage.getItem("user");
const savedSchoolName: string | null = localStorage.getItem("schoolName");

const parsedUser: UserType | null = savedUser ? JSON.parse(savedUser) : null;

export const useAuth = create<AuthState>((set) => {
  const initializeSchoolName = async (user: UserType | null) => {
    if (user?.schoolId) {
      console.log("ENV:", import.meta.env.VITE_BASE_URL); // ✅ Correct

      const schools = await schoolServices.getAllSchools();

      const school = schools.find(
        (s: { id: string; name: string }) => s.id === user.schoolId
      );
      const schoolName = school?.name || null;
      set({ schoolName });
      if (schoolName) {
        localStorage.setItem("schoolName", schoolName);
      } else {
        localStorage.removeItem("schoolName");
      }
    } else {
      set({ schoolName: null });
      localStorage.removeItem("schoolName");
    }
  };

  // If there's a saved user, fetch school name
  if (parsedUser) {
    initializeSchoolName(parsedUser);
  }

  return {
    user: parsedUser,
    schoolName: savedSchoolName, // use cached name first
    setUser: async (user) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
      set({ user });
      await initializeSchoolName(user);
    },
  };
});
