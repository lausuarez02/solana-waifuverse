"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/8bit/button";

import styles from "./page.module.css";


export default function Home() {
  const router = useRouter();

  // Temporarily disable MiniKit for testing
  // const { isFrameReady, setFrameReady, context } = useMiniKit();
  // const [email, setEmail] = useState("");
  // const [error, setError] = useState("");

  // // Initialize the  miniapp
  // useEffect(() => {
  //   if (!isFrameReady) {
  //     setFrameReady();
  //   }
  // }, [setFrameReady, isFrameReady]);
 
  

  // If you need to verify the user's identity, you can use the useQuickAuth hook.
  // This hook will verify the user's signature and return the user's FID. You can update
  // this to meet your needs. See the /app/api/auth/route.ts file for more details.
  // Note: If you don't need to verify the user's identity, you can get their FID and other user data
  // via `context.user.fid`.
  // const { data, isLoading, error } = useQuickAuth<{
  //   userFid: string;
  // }>("/api/auth");

  // Temporarily disabled for testing
  // const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
  //   "/api/auth",
  //   { method: "GET" }
  // );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.menuButtons}>
          <Button
            onClick={() => router.push('/game')}
            size="lg"
          >
            PLAY
          </Button>
          <Button
            onClick={() => router.push('/menu')}
            size="lg"
            variant="outline"
          >
            MENU
          </Button>
        </div>
      </div>
    </div>
  );
}
