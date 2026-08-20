import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCustomerMomentsServerFn,
  saveCustomerMomentsServerFn,
  resetCustomerMomentsServerFn,
} from "./customer-moments.functions";

export interface CustomerMoment {
  id: string;
  customer: string;
  occasion: string;
  rating: number;
  note: string;
  image: string;
  isActive: boolean;
}

export const DEFAULT_MOMENTS: CustomerMoment[] = [
  {
    id: "mom-1",
    customer: "PRIYA & KARTHIK",
    occasion: "2nd Anniversary Celebration",
    rating: 5,
    note: "The strawberry mascarpone was heavenly! Not overly sweet, just pure cloud perfection.",
    image: "/cakes/pink-bento-cake.jpg",
    isActive: true,
  },
  {
    id: "mom-2",
    customer: "DR. ANANYA S.",
    occasion: "Mum's 50th High-Tea Party",
    rating: 5,
    note: "The showstopper of our evening. Everyone thought it was flown in from Paris!",
    image: "/cakes/lavender-pearl-cake.jpg",
    isActive: true,
  },
  {
    id: "mom-3",
    customer: "KAVYA & ARJUN",
    occasion: "Birthday Celebration",
    rating: 5,
    note: "The rich dark Belgian ganache melted like silk. Absolutely sensational for chocolate lovers!",
    image: "/cakes/belgian-truffle-cake.jpg",
    isActive: true,
  },
  {
    id: "mom-4",
    customer: "ROHAN & DEV TEAM",
    occasion: "Product Launch Party",
    rating: 5,
    note: "Fudge brownie of our dreams. The gold chocolate spheres made the photos look unreal.",
    image: "/cakes/royal-gold-brownie.jpg",
    isActive: true,
  },
  {
    id: "mom-5",
    customer: "MEERA V.",
    occasion: "Family Sunday Feast",
    note: "Every single square had a distinct crunch. Pistachio + Biscoff was the unanimous winner!",
    rating: 5,
    image: "/cakes/biscoff-nut-brownie.jpg",
    isActive: true,
  },
];

const STORAGE_KEY = "ani_bakes_customer_moments_v1";

export function getCustomerMoments(): CustomerMoment[] {
  if (typeof window === "undefined") return DEFAULT_MOMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MOMENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_MOMENTS;
  } catch {
    return DEFAULT_MOMENTS;
  }
}

export function saveCustomerMoments(moments: CustomerMoment[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("customer-moments-updated", { detail: moments }));
  } catch (e) {
    console.error("Failed to save customer moments:", e);
  }
}

export function useCustomerMoments() {
  const queryClient = useQueryClient();
  const fetchFn = useServerFn(getCustomerMomentsServerFn);
  const saveFn = useServerFn(saveCustomerMomentsServerFn);
  const resetFn = useServerFn(resetCustomerMomentsServerFn);

  const { data: serverMoments } = useQuery({
    queryKey: ["customer-moments"],
    queryFn: async () => {
      try {
        const res = await fetchFn();
        if (res && Array.isArray(res) && res.length > 0) {
          saveCustomerMoments(res);
          return res;
        }
      } catch (err) {
        console.warn("Failed to fetch customer moments from server:", err);
      }
      return getCustomerMoments();
    },
    staleTime: 1000 * 60 * 5,
  });

  const [localMoments, setLocalMoments] = useState<CustomerMoment[]>(() => {
    return getCustomerMoments();
  });

  useEffect(() => {
    if (serverMoments && Array.isArray(serverMoments)) {
      setLocalMoments(serverMoments);
    }
  }, [serverMoments]);

  useEffect(() => {
    const handleUpdate = () => {
      setLocalMoments(getCustomerMoments());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("customer-moments-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("customer-moments-updated", handleUpdate);
    };
  }, []);

  const activeMomentsList = serverMoments || localMoments || DEFAULT_MOMENTS;

  return {
    moments: activeMomentsList,
    activeMoments: activeMomentsList.filter((m) => m.isActive),
    save: async (newMoments: CustomerMoment[]) => {
      saveCustomerMoments(newMoments);
      setLocalMoments(newMoments);
      try {
        await saveFn({ data: newMoments });
        await queryClient.invalidateQueries({ queryKey: ["customer-moments"] });
      } catch (err) {
        console.warn("Failed to save customer moments to server:", err);
      }
    },
    resetDefaults: async () => {
      saveCustomerMoments(DEFAULT_MOMENTS);
      setLocalMoments(DEFAULT_MOMENTS);
      try {
        await resetFn();
        await queryClient.invalidateQueries({ queryKey: ["customer-moments"] });
      } catch (err) {
        console.warn("Failed to reset customer moments on server:", err);
      }
    },
  };
}
