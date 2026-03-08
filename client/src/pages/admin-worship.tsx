import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Settings, Trash2, Loader2 } from "lucide-react";

interface Unit {
  id: number;
  number: number;
  title: string;
  lessons?: { id: number }[];
}

interface UploadStatus {
  status: "processing" | "ready" | "error";
  currentStep: string;
  progress: number;
  percentage?: number;
  error?: string;
}

export default function AdminWorship() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/worship/units"],
    queryFn: async () => {
      const res = await fetch("/api/worship/units");
      return res.json();
    },
  });

  const { data: uploadStatus } = useQuery<UploadStatus>({
    queryKey: [`/api/worship/upload/${uploadId}/status`],
    queryFn: async () => {
      const res = await fetch(`/api/worship/upload/${uploadId}/status`);
      return res.json();
    },
    enabled: !!uploadId,
    refetchInterval: uploadId ? 1000 : false,
  });

  useEffect(() => {
    if (!uploadStatus || !uploadId) return;
    if (uploadStatus.status === "ready") {
      setUploadId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/worship/units"] });
    } else if (uploadStatus.status === "error") {
      setUploadError(uploadStatus.error || "Upload failed");
      setUploadId(null);
    }
  }, [uploadStatus, uploadId]);

  async function handleDelete(unitId: number) {
    setDeletingId(unitId);
    try {
      const res = await fetch(`/api/worship/units/${unitId}`, { method: "DELETE" });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/worship/units"] });
      }
    } catch {
      // Error handling
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);

      const res = await fetch("/api/worship/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const error = JSON.parse(text);
          setUploadError(error.message || "Failed to upload curriculum");
        } catch {
          setUploadError("Failed to upload curriculum");
        }
        setUploading(false);
        return;
      }

      const data = await res.json();
      setUploadId(data.uploadId);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload curriculum");
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  }

  const allUnits = units || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button
          onClick={() => setLocation("/admin")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-gray-800 text-lg">
            <span className="font-accent text-2xl text-se-green">Worship</span>{" "}
            <span className="font-accent text-2xl text-se-blue">Explorer</span>
            <span className="text-gray-400 text-sm ml-2">Admin</span>
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="mb-8">
          <div className="hidden">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileChange}
            />
          </div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-se-blue/10 border border-se-blue/30 rounded-2xl p-5
                       flex items-center gap-4
                       hover:bg-se-blue/20 hover:border-se-blue/50 transition-all mb-4
                       disabled:opacity-50"
          >
            <div className="w-12 h-12 rounded-xl bg-se-blue/15 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-se-blue" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-se-blue text-base block">
                Upload New Curriculum
              </span>
              <span className="text-gray-400 text-sm">Upload .docx or .pdf file</span>
            </div>
          </motion.button>

          {selectedFile && !uploadId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-se-blue/5 border border-se-blue/20 rounded-xl"
            >
              <p className="text-sm text-gray-700 mb-3 font-display font-bold">
                Selected: {selectedFile.name}
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-se-blue text-white font-display font-bold
                           rounded-lg hover:bg-se-blue/90 transition-all disabled:opacity-50
                           flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </motion.button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-display font-bold
                           rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {uploadId && uploadStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-se-blue/5 border border-se-blue/20 rounded-xl"
            >
              <p className="text-sm text-gray-700 mb-3 font-display font-bold">
                {uploadStatus.currentStep}
              </p>
              <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadStatus.progress}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${
                    uploadStatus.status === "error"
                      ? "bg-red-500"
                      : uploadStatus.status === "ready"
                      ? "bg-se-green"
                      : "bg-se-blue"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 font-display">{uploadStatus.progress}%</p>
              {uploadStatus.status === "ready" && (
                <p className="text-sm text-se-green font-display font-bold mt-2">Upload complete!</p>
              )}
              {uploadStatus.status === "error" && (
                <p className="text-sm text-red-500 font-display font-bold mt-2">
                  {uploadStatus.error || "Upload failed"}
                </p>
              )}
            </motion.div>
          )}

          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4"
            >
              <p className="text-sm text-red-600 font-display">{uploadError}</p>
            </motion.div>
          )}
        </div>

        {/* Management Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-gray-400" />
            <h2 className="font-display font-bold text-gray-400 text-sm uppercase tracking-wider">
              Manage Curriculum
            </h2>
          </div>

          {allUnits.length === 0 ? (
            <p className="text-gray-300 text-sm font-display py-6 text-center">
              No units to manage
            </p>
          ) : (
            <div className="space-y-2">
              {allUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-gray-700 text-sm">
                      Unit {unit.number}: {unit.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {unit.lessons ? unit.lessons.length : 0} lessons
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {confirmDeleteId === unit.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-2 flex-shrink-0"
                      >
                        <button
                          onClick={() => handleDelete(unit.id)}
                          disabled={deletingId === unit.id}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-500 text-xs font-display font-bold
                                     hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          {deletingId === unit.id ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-xs font-display
                                     hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="delete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setConfirmDeleteId(unit.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-all group/del flex-shrink-0"
                        title="Delete unit"
                      >
                        <Trash2 className="w-4 h-4 text-gray-300 group-hover/del:text-red-400 transition-colors" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
