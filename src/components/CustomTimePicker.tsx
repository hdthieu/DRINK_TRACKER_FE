"use client";

import React, { useEffect, useState } from "react";
import { CustomSelect } from "./CustomSelect";
import { Clock } from "lucide-react";

interface CustomTimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
}

export function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  const [hour, setHour] = useState(value.split(":")[0] || "08");
  const [minute, setMinute] = useState(value.split(":")[1] || "00");

  useEffect(() => {
    const [h, m] = value.split(":");
    if (h) setHour(h);
    if (m) setMinute(m);
  }, [value]);

  const hours = Array.from({ length: 24 }, (_, i) => ({
    val: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    val: i.toString().padStart(2, "0"),
    label: i.toString().padStart(2, "0"),
  }));

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    onChange(`${newHour}:${minute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    onChange(`${hour}:${newMinute}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <CustomSelect
          options={hours}
          value={hour}
          onChange={handleHourChange}
          placeholder="Giờ"
          className="!h-14"
        />
      </div>
      <span className="text-xl font-black text-[var(--brown-muted)] font-mono">
        :
      </span>
      <div className="flex-1">
        <CustomSelect
          options={minutes}
          value={minute}
          onChange={handleMinuteChange}
          placeholder="Phút"
          className="!h-14"
        />
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--latte)] flex items-center justify-center text-[var(--brown-muted)] shadow-sm shrink-0">
        <Clock size={20} />
      </div>
    </div>
  );
}
