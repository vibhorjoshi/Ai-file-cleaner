'use client'

import React from 'react'
import { Activity, Clock, HardDrive, Files } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import type { ScanProgress } from '@ai-file-cleanup/core'

interface ProgressStatsProps {
  progress?: ScanProgress
  realTimeStats?: {
    duplicatesFound: number
    spaceToFree: number
    scanSpeed: number
  }
}

export function ProgressStats({ progress, realTimeStats }: ProgressStatsProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const progressPercent = progress ? (progress.processedFiles / progress.totalFiles) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Scan Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Scan Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Files processed</span>
                  <span>{progress.processedFiles.toLocaleString()} / {progress.totalFiles.toLocaleString()}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className={`font-medium capitalize ${getStatusColor(progress.status)}`}>
                    {progress.status}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Elapsed:</span>
                  <div className="font-medium">
                    {formatTime(progress.elapsedTime)}
                  </div>
                </div>
              </div>

              {progress.currentFile && (
                <div className="text-xs">
                  <span className="text-gray-500">Current:</span>
                  <div className="truncate font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                    {progress.currentFile}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No scan in progress</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Files className="w-5 h-5" />
            Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Files className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Duplicate Groups</span>
              </div>
              <span className="font-semibold">
                {progress?.duplicateGroups || realTimeStats?.duplicatesFound || 0}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-500" />
                <span className="text-sm">Space to Free</span>
              </div>
              <span className="font-semibold text-green-600">
                {formatFileSize(realTimeStats?.spaceToFree || 0)}
              </span>
            </div>

            {realTimeStats?.scanSpeed && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Scan Speed</span>
                </div>
                <span className="font-semibold">
                  {realTimeStats.scanSpeed.toFixed(1)} files/sec
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Resources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Memory Usage</span>
                <span>--</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>CPU Usage</span>
                <span>--</span>
              </div>
              <Progress value={0} className="h-1" />
            </div>

            <div className="pt-2 text-xs text-gray-500">
              ML Models: Ready
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}