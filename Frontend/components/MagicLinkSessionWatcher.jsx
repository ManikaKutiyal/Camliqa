"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function MagicLinkSessionWatcher({ next = "/profile" }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const redirectIfSessionExists = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isActive && session) {
        router.replace(next);
      }
    };

    redirectIfSessionExists();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isActive && session) {
        router.replace(next);
      }
    });

    const pollInterval = window.setInterval(() => {
      redirectIfSessionExists();
    }, 2000);

    return () => {
      isActive = false;
      window.clearInterval(pollInterval);
      data.subscription.unsubscribe();
    };
  }, [next, router]);

  return null;
}
