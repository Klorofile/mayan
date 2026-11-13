"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { clockIn, clockOut } from "./api";
import { useBrowserLocation } from "./use-browser-location";

export function ClockCard() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { location, error: locationError, isLoading: isLocationLoading, requestLocation } = useBrowserLocation();

  const mutation = useMutation({
    mutationFn: async (type: "clock-in" | "clock-out") => {
      setSubmitError(null);
      const currentLocation = location ?? (await requestLocation());
      if (!currentLocation) throw new Error("Lokasi belum tersedia.");

      const payload = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        attendanceDate: new Date().toISOString(),
        notes
      };

      return type === "clock-in" ? clockIn(payload) : clockOut(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendances"] });
      setNotes("");
    },
    onError: (error) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message ?? error.message
          : error instanceof Error
            ? error.message
            : "Clock action gagal.";
      setSubmitError(Array.isArray(message) ? message.join(", ") : message);
    }
  });

  return (
    <Card className="border-0 bg-slate-950 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-300" />
          My Attendance
        </CardTitle>
        <CardDescription className="text-slate-300">Clock in/out menggunakan lokasi browser dan validasi radius branch.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="h-4 w-4 text-emerald-300" />
            {location ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : "Lokasi belum diambil"}
          </div>
          {(locationError || submitError) && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-200">{locationError ?? submitError}</p>}
        </div>
        <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Catatan opsional" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            className="bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            disabled={mutation.isPending || isLocationLoading}
            onClick={() => mutation.mutate("clock-in")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Submitting..." : "Clock In"}
          </Button>
          <Button
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            disabled={mutation.isPending || isLocationLoading}
            onClick={() => mutation.mutate("clock-out")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Submitting..." : "Clock Out"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
