'use client'

import React, { useCallback, useState } from 'react'

interface DropzoneProps {
  label?: string
  name: string
  defaultImageUrl?: string | null
}

export function ImageUploadDropzone({
  label = 'Product Image',
  name,
  defaultImageUrl,
}: DropzoneProps) {
  const [preview, setPreview] = useState<string | null>(defaultImageUrl || null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const objectUrl = URL.createObjectURL(file)
    setPreview((prev) => {
      // Clean up memory
      if (prev && !prev.startsWith('http') && !prev.startsWith('/')) {
        URL.revokeObjectURL(prev)
      }
      return objectUrl
    })
    
    // Auto populate the actual hidden input or rely on the form having this input
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    const fileInput = document.getElementById(name) as HTMLInputElement
    if (fileInput) {
      fileInput.files = dataTransfer.files
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="field-label">{label}</span>
      <label
        htmlFor={name}
        className={`group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-sm overflow-hidden transition-colors cursor-pointer ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background hover:bg-muted/30'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id={name}
          name={name}
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold px-3 py-1 bg-black/50 rounded-sm">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground text-center">
            <svg
              className="w-8 h-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-1 text-sm font-semibold">
              <span className="text-primary group-hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs">PNG, JPG or WEBP (MAX. 5MB)</p>
          </div>
        )}
      </label>
    </div>
  )
}
