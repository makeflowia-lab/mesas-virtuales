import { useState, useRef } from "react"

interface UseFileInputOptions {
  accept?: string
  maxSize?: number // MB
}

export function useFileInput({ accept, maxSize }: UseFileInputOptions) {
  const [fileName, setFileName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)

  const validateAndSetFile = (file: File | undefined) => {
    setError("")
    if (file) {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`El archivo debe pesar menos de ${maxSize}MB`)
        return
      }
      if (accept && !file.type.match(accept.replace("/*", "/"))) {
        setError(`Tipo de archivo inválido (se espera ${accept})`)
        return
      }
      setFileSize(file.size)
      setFileName(file.name)
      setSelectedFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    validateAndSetFile(file)
  }

  const clearFile = () => {
    setFileName("")
    setError("")
    setFileSize(0)
    setSelectedFile(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return {
    fileName,
    error,
    fileInputRef,
    handleFileSelect,
    validateAndSetFile,
    clearFile,
    fileSize,
    selectedFile,
  }
}

