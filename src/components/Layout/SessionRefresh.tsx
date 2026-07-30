import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import { useAuth } from "../../context/AuthContext";


/**
 * Re-runs ITS login once per session so designation / can_access_hub
 * stay in sync after roster imports (without forcing a full sign-out).
 */
const SessionRefresh: React.FC = () => {
  const { member, login, logout } = useAuth();
  const loginMutation = useMutation(api.members.login);
  const ranForIts = useRef<string | null>(null);

  useEffect(() => {
    if (!member?.its_number) return;
    if (ranForIts.current === member.its_number) return;
    ranForIts.current = member.its_number;

    let cancelled = false;
    void (async () => {
      try {
        const fresh = await loginMutation({ its_number: member.its_number });
        if (cancelled) return;
        if (!fresh) {
          logout();
          return;
        }
        login(fresh);
      } catch (e) {
        console.error("Session refresh failed", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [member?.its_number, loginMutation, login, logout]);

  return null;
};

export default SessionRefresh;
