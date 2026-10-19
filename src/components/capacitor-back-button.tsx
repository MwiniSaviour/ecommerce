"use client";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export function CapacitorBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const register = App.addListener("backButton", () => {
      if (window.history.length > 1) window.history.back();
      else App.exitApp();
    });
    return () => {
      register.then((h) => h.remove());
    };
  }, []);
  return null;
}
