"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import { UserProfile } from "@/lib/types";
import { toast } from "sonner";

export function useUser() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchUser = useCallback(async () => {
        try {
            const { data } = await api.get("/user/my-profile");
            setUser(data.data || data);
        } catch (err) {
            console.error("Failed to fetch user", err);
        } finally {
            setLoadingUser(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("/user/upload-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Cập nhật ảnh đại diện thành công! ✨");
            fetchUser();
        } catch {
            toast.error("Lỗi khi tải ảnh lên");
        } finally {
            setUploading(false);
        }
    };

    return {
        user,
        loadingUser,
        fetchUser,
        uploading,
        fileInputRef,
        handleFileUpload,
    };
}
