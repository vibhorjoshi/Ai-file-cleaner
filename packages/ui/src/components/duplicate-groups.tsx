'use client'

import React from 'react'
import { Files, Trash2, Download, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import type { DuplicateGroup, FileMetadata } from '@ai-file-cleanup/core'

interface DuplicateGroupsProps {
  groups?: DuplicateGroup[]
  onCleanup?: (groupIds: number[]) => void
  onPreview?: (file: FileMetadata) => void
  onDownload?: (groupId: number) => void
}

export function DuplicateGroups({
  groups = [],
  onCleanup,
  onPreview,
  onDownload
}: DuplicateGroupsProps) {
  const [selectedGroups, setSelectedGroups] = React.useState<Set<number>>(new Set())

  const handleGroupSelect = (groupId: number, checked: boolean) => {
    const newSelected = new Set(selectedGroups)
    if (checked) {
      newSelected.add(groupId)
    } else {
      newSelected.delete(groupId)
    }
    setSelectedGroups(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedGroups(new Set(groups.map(g => g.id!)))
    } else {
      setSelectedGroups(new Set())
    }
  }

  const handleCleanup = () => {
    if (selectedGroups.size > 0) {
      onCleanup?.(Array.from(selectedGroups))
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'bg-red-100 text-red-800'
    if (similarity >= 0.85) return 'bg-orange-100 text-orange-800'
    if (similarity >= 0.75) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getGroupTypeLabel = (type: string) => {
    switch (type) {
      case 'exact': return 'Exact Match'
      case 'text_similar': return 'Text Similar'
      case 'image_similar': return 'Image Similar'
      default: return type
    }
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Files className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No duplicate groups found yet.</p>
          <p className="text-sm">Start a scan to detect duplicates.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Files className="w-5 h-5" />
            Duplicate Groups ({groups.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSelectAll(selectedGroups.size !== groups.length)}
            >
              {selectedGroups.size === groups.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedGroups.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCleanup}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Selected ({selectedGroups.size})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedGroups.has(group.id!)}
                    onCheckedChange={(checked: boolean) => handleGroupSelect(group.id!, checked)}
                  />
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getGroupTypeLabel(group.groupType)}
                    </Badge>
                    <Badge className={getSimilarityColor(group.similarity)}>
                      {Math.round(group.similarity * 100)}% similar
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload?.(group.id!)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {group.files.map((file, index) => (
                  <div
                    key={file.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.originalName}</p>
                      <p className="text-sm text-gray-500 truncate">{file.filePath}</p>
                      <div className="flex gap-4 text-xs text-gray-400 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{file.mimeType}</span>
                        {file.lastModified && (
                          <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview?.(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                Total size: {formatFileSize(group.files.reduce((sum, file) => sum + file.size, 0))} • 
                Space to free: {formatFileSize(group.files.slice(1).reduce((sum, file) => sum + file.size, 0))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}