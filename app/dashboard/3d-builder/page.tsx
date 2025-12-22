"use client"

import { Canvas3D, Canvas3DLoader } from "@/components/3d/Canvas3D"
import { ModelViewer } from "@/components/3d/ModelViewer"
import { ModelControls } from "@/components/3d/ModelControls"
import { Button } from "@/components/ui/button"
import {
  use3DModels,
  useCreate3DModel,
  upload3DModelFile,
} from "@/lib/hooks/use3DModels"
import { useAuth } from "@/lib/hooks/useAuth"
import { Upload, Save, ArrowLeft, Loader2, Box, Sparkles } from "lucide-react"
import { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import type { Transform3D } from "@/lib/types/3d"

function ThreeDBuilderContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { data: models, isLoading: isLoadingModels } = use3DModels()
  const createModel = useCreate3DModel()

  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [modelName, setModelName] = useState<string>("Untitled Model")
  const [isUploading, setIsUploading] = useState(false)
  const [transform, setTransform] = useState<Transform3D>({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    if (!["glb", "gltf"].includes(fileExt || "")) {
      alert("Please upload a GLB or GLTF file")
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB")
      return
    }

    setModelFile(file)
    setModelName(file.name.replace(/\.[^/.]+$/, ""))

    // Create temporary URL for preview
    const url = URL.createObjectURL(file)
    setModelUrl(url)
  }

  const handleSaveModel = async () => {
    if (!modelFile || !user || !modelUrl) return

    setIsUploading(true)

    try {
      // Upload file to Supabase Storage
      const uploadedUrl = await upload3DModelFile(modelFile, user.id)

      // Get file size in KB
      const fileSizeKb = Math.round(modelFile.size / 1024)

      // Determine format
      const format = modelFile.name.endsWith(".gltf") ? "gltf" : "glb"

      // Create database entry
      await createModel.mutateAsync({
        owner_id: user.id,
        name: modelName,
        model_url: uploadedUrl,
        file_size_kb: fileSizeKb,
        format,
        has_textures: false, // TODO: Detect textures
        has_animations: false, // TODO: Detect animations
        generation_method: "upload",
      })

      alert("Model saved successfully!")

      // Reset form
      setModelUrl(null)
      setModelFile(null)
      setModelName("Untitled Model")
      setTransform({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      })
    } catch (error) {
      console.error("Failed to save model:", error)
      alert("Failed to save model. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleLoadModel = (url: string, name: string) => {
    setModelUrl(url)
    setModelName(name)
    setTransform({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    })
  }

  return (
    <div className="h-screen w-screen flex">
      {/* Left Sidebar: Model Library */}
      <div className="w-64 border-r border-border-primary bg-card overflow-y-auto">
        <div className="p-4 border-b border-border-primary">
          <h2 className="font-semibold flex items-center gap-2">
            <Box className="w-5 h-5" />
            Model Library
          </h2>
        </div>

        <div className="p-4">
          {isLoadingModels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !models || models.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Box className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No models yet</p>
              <p className="text-xs mt-1">Upload your first model</p>
            </div>
          ) : (
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleLoadModel(model.model_url, model.name)}
                  className="w-full p-3 rounded-lg border border-border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex items-start gap-2">
                    <Box className="w-4 h-4 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {model.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {model.format.toUpperCase()} •{" "}
                        {model.file_size_kb
                          ? `${model.file_size_kb} KB`
                          : "Unknown size"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 border-b border-border-primary bg-card flex items-center px-4 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/projects")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex-1">
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none"
              placeholder="Model name"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/ai-generator')}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </Button>

          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Model
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
          />

          {modelFile && (
            <Button
              onClick={handleSaveModel}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Model
                </>
              )}
            </Button>
          )}
        </div>

        {/* 3D Viewport + Controls */}
        <div className="flex-1 flex">
          {/* 3D Canvas */}
          <div className="flex-1">
            <Suspense fallback={<Canvas3DLoader />}>
              <Canvas3D>
                {modelUrl && (
                  <ModelViewer
                    modelUrl={modelUrl}
                    transform={transform}
                    onLoad={() => console.log("Model loaded")}
                  />
                )}
              </Canvas3D>
            </Suspense>
          </div>

          {/* Right Sidebar: Transform Controls */}
          {modelUrl && (
            <div className="w-80 border-l border-border-primary bg-card overflow-y-auto">
              <ModelControls
                transform={transform}
                onTransformChange={setTransform}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ThreeDBuilderPage() {
  return (
    <Suspense fallback={<Canvas3DLoader />}>
      <ThreeDBuilderContent />
    </Suspense>
  )
}
