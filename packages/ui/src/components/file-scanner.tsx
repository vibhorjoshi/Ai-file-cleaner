'use client'

import React, { useState, useCallback } from 'react'
import { FolderOpen, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import type { ScanRequest } from '@ai-file-cleanup/core'

interface FileScannerProps {
  onScanStart?: (request: ScanRequest) => void
  onScanPause?: () => void
  onScanStop?: () => void
  isScanning?: boolean
  isPaused?: boolean
}

export function FileScanner({
  onScanStart,
  onScanPause,
  onScanStop,
  isScanning = false,
  isPaused = false
}: FileScannerProps) {
  const [directoryPath, setDirectoryPath] = useState('')
  const [includeSubdirs, setIncludeSubdirs] = useState(true)
  const [fileTypes, setFileTypes] = useState<string[]>([])
  const [maxFileSize, setMaxFileSize] = useState(100)

  const handleScan = useCallback(() => {
    if (!directoryPath.trim()) return

    const request: ScanRequest = {
      directoryPath: directoryPath.trim(),
      includeSubdirs,
      fileTypes: fileTypes.length > 0 ? fileTypes : undefined,
      maxFileSize: maxFileSize * 1024 * 1024 // Convert MB to bytes
    }

    onScanStart?.(request)
  }, [directoryPath, includeSubdirs, fileTypes, maxFileSize, onScanStart])

  const handleSelectDirectory = async () => {
    // In a real app, this would open a directory picker
    // For now, we'll use a simple prompt
    const path = prompt('Enter directory path:')
    if (path) {
      setDirectoryPath(path)
    }
  }

  const handleFileTypesChange = (value: string) => {
    const types = value.split(',').map(t => t.trim()).filter(Boolean)
    setFileTypes(types)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          File Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Directory Path</label>
          <div className="flex gap-2">
            <Input
              value={directoryPath}
              onChange={(e) => setDirectoryPath(e.target.value)}
              placeholder="/path/to/scan"
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectDirectory}
            >
              Browse
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="subdirs"
            checked={includeSubdirs}
            onCheckedChange={setIncludeSubdirs}
          />
          <label htmlFor="subdirs" className="text-sm">
            Include subdirectories
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">File Types (optional)</label>
          <Input
            placeholder="jpg, png, pdf, txt (leave empty for all)"
            onChange={(e) => handleFileTypesChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Max File Size (MB)</label>
          <Input
            type="number"
            value={maxFileSize}
            onChange={(e) => setMaxFileSize(Number(e.target.value))}
            min="1"
            max="1000"
          />
        </div>

        <div className="flex gap-2 pt-4">
          {!isScanning ? (
            <Button 
              onClick={handleScan} 
              disabled={!directoryPath.trim()}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Scan
            </Button>
          ) : (
            <>
              <Button 
                onClick={onScanPause} 
                variant="outline"
                className="flex-1"
              >
                <Pause className="w-4 h-4 mr-2" />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                onClick={onScanStop} 
                variant="destructive"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}