import schoolServices from "@/services/schoolServices";
import { UserType } from "@/types/auth";
import { create } from "zustand";

interface AuthState {
  user: UserType | null;
  schoolName: string | null;
  hydrated: boolean; // <--- NEW
  setUser: (user: UserType | null) => void;
}

const savedUser: string | null = sessionStorage.getItem("user");
const savedSchoolName: string | null = sessionStorage.getItem("schoolName");

const parsedUser: UserType | null = savedUser ? JSON.parse(savedUser) : null;

export const useAuth = create<AuthState>((set) => {
  const initializeSchoolName = async (user: UserType | null) => {
    if (user?.schoolId) {
      const schools = await schoolServices.getAllSchools();
      const school = schools.find(
        (s: { id: string; name: string }) => s.id === user.schoolId
      );
      const schoolName = school?.name || null;
      set({ schoolName });
      if (schoolName) {
        sessionStorage.setItem("schoolName", schoolName);
      } else {
        sessionStorage.removeItem("schoolName");
      }
    } else {
      set({ schoolName: null });
      sessionStorage.removeItem("schoolName");
    }

    set({ hydrated: true }); // <-- set as ready
  };

  if (parsedUser) {
    initializeSchoolName(parsedUser);
  } else {
    set({ hydrated: true }); // <--- if no user, still ready
  }

  return {
    user: parsedUser,
    schoolName: savedSchoolName,
    hydrated: false, // <--- add default
    setUser: async (user) => {
      if (user) {
        sessionStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.removeItem("user");
      }
      set({ user, hydrated: false }); // <-- temporarily not ready
      await initializeSchoolName(user);
    },
  };
});
