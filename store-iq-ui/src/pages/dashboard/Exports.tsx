"use client"

import DashboardLayout from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React, { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { ConfirmDialog } from "@/components/confirm-dialog";

/** Improved animated progress card for in-progress exports */
const InProgressExportCard = ({ item }: { item: any }) => {
  const getProgressValue = () => {
    if (item.progress !== undefined) return item.progress
    if (item.status === "Completed" || item.status === "completed") return 100
    if (item.status === "Failed" || item.status === "failed") return 0
    return 30 // Default progress for pending/processing
  }

  const getStatusColor = () => {
    switch (item.status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "processing":
        return "bg-blue-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getStatusText = () => {
    switch (item.status?.toLowerCase()) {
      case "processing":
        return "Processing..."
      case "pending":
        return "Queued"
      case "failed":
        return "Failed"
      default:
        return "Exporting..."
    }
  }

  return (
    <Card className="bg-storiq-card-bg border-storiq-border hover:border-storiq-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg font-semibold line-clamp-1">
            {item.filename || item.name || "Untitled"}
          </CardTitle>
          <Badge variant="secondary" className={`${getStatusColor().replace("bg-", "bg-")}/20 text-white border-none`}>
            {item.status || "Processing"}
          </Badge>
        </div>
        <CardDescription className="text-white/60">
          {item.resolution ? `${item.resolution} • ` : ""}
          {item.format || "MP4"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">{getStatusText()}</span>
            <span className="text-white/70">{getProgressValue()}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-2 bg-white/10" indicatorClassName={getStatusColor()} />
          {item.status?.toLowerCase() === "processing" && (
            <div className="flex justify-center">
              <div className="animate-pulse text-xs text-blue-400">Processing video...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const Exports = () => {
  const [exportHistory, setExportHistory] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<"filename" | "date" | "status">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "failed">("all")

  // ConfirmDialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { user } = useAuth()
  const userId = user && user.id ? user.id : null

  // Filter and sort logic
  const filteredAndSortedExports = React.useMemo(() => {
    let arr = [...exportHistory]

    // Apply status filter
    if (filterStatus !== "all") {
      arr = arr.filter((item) => {
        const status = item.status?.toLowerCase()
        switch (filterStatus) {
          case "completed":
            return status === "completed"
          case "failed":
            return status === "failed"
          default:
            return true
        }
      })
    }

    // Apply sorting
    arr.sort((a, b) => {
      let aVal, bVal
      if (sortBy === "filename") {
        aVal = (a.filename || a.name || "").toLowerCase()
        bVal = (b.filename || b.name || "").toLowerCase()
      } else if (sortBy === "date") {
        aVal = new Date(a.date || a.createdAt || 0).getTime()
        bVal = new Date(b.date || b.createdAt || 0).getTime()
      } else if (sortBy === "status") {
        aVal = (a.status || "").toLowerCase()
        bVal = (b.status || "").toLowerCase()
      }
      if (aVal === undefined || bVal === undefined) return 0
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1
      return 0
    })

    return arr
  }, [exportHistory, sortBy, sortDir, filterStatus])

  const inProgressExports = filteredAndSortedExports.filter(
    (item) => item.status?.toLowerCase() !== "completed" && item.status?.toLowerCase() !== "failed",
  )

  const completedExports = filteredAndSortedExports.filter((item) => item.status?.toLowerCase() === "completed")

  const handleSort = (col: "filename" | "date" | "status") => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(col)
      setSortDir(col === "date" ? "desc" : "asc")
    }
  }

  // Remove export functionality (unchanged)
  const handleDeleteExport = async (exportId: string) => {
    const allExports = JSON.parse(localStorage.getItem("exports") || "[]")
    const exportItem = allExports.find((item: any) => item.export_id === exportId && item.userId === userId)
    // Only delete the exported/edited file, never the original
    // Only delete if s3Key is present (like Videos page)
    const s3Key = exportItem?.s3Key
    if (!s3Key) {
      // No exported file to delete, just remove from history
      setExportHistory((prev) => {
        const updated = prev.filter((item) => item.export_id !== exportId)
        const filteredAll = allExports.filter((item: any) => !(item.export_id === exportId && item.userId === userId))
        localStorage.setItem("exports", JSON.stringify(filteredAll))
        return updated
      })
      return
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/delete-video`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ s3Key }),
        credentials: "include",
      })
    } catch (e) {
      // Error handling
    }

    setExportHistory((prev) => {
      const updated = prev.filter((item) => item.export_id !== exportId)
      const filteredAll = allExports.filter((item: any) => !(item.export_id === exportId && item.userId === userId))
      localStorage.setItem("exports", JSON.stringify(filteredAll))
      return updated
    })
  }

  // ConfirmDialog handlers
  const handleOpenDeleteDialog = (exportId: string) => {
    setPendingDeleteId(exportId)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    setDeleteLoading(true)
    await handleDeleteExport(pendingDeleteId)
    setDeleteLoading(false)
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const handleCancelDelete = () => {
    setConfirmOpen(false)
    setPendingDeleteId(null)
    setDeleteLoading(false)
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("exports")
      if (raw) {
        let parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          let patched = false
          parsed = parsed.map((item) => {
            if (!item.userId && userId) {
              patched = true
              return { ...item, userId }
            }
            return item
          })
          if (patched) {
            localStorage.setItem("exports", JSON.stringify(parsed))
          }
          setExportHistory(parsed.filter((item) => item.userId === userId))
        }
      }
    } catch (e) {
      setExportHistory([])
    }
  }, [userId])

  // Polling logic (unchanged)
  useEffect(() => {
    const updateExportEntryByJobId = (jobId: string, data: any) => {
      setExportHistory((prev) => {
        const updated = prev.map((item) =>
          item.job_id === jobId || item.jobId === jobId ? { ...item, ...data } : item,
        )
        localStorage.setItem("exports", JSON.stringify(updated))
        return updated
      })
    }

    const pollingEntries = exportHistory.filter(
      (item) =>
        (item.status === "pending" ||
          item.status === "processing" ||
          item.status === "Pending" ||
          item.status === "Processing") &&
        item.job_id,
    )

    if (pollingEntries.length === 0) return

    const intervals: NodeJS.Timeout[] = []

    pollingEntries.forEach((item) => {
      const poll = async () => {
        try {
          const jobId = item.jobId ?? item.job_id;
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/video/crop/${jobId}`, {
            method: "GET",
            credentials: "include",
          })
          if (!res.ok) return
          const data = await res.json()

          if (data.status && (data.status.toLowerCase() === "completed" || data.status.toLowerCase() === "failed")) {
            updateExportEntryByJobId(jobId, {
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              ...(data.downloadUrl ? { downloadUrl: data.downloadUrl } : {}),
              ...(data.key ? { s3Key: data.key } : {}),
              ...(data.s3Key ? { s3Key: data.s3Key } : {}),
            })
          } else if (data.status && data.progress !== undefined) {
            updateExportEntryByJobId(jobId, {
              status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
              progress: data.progress,
            })
          }
        } catch (e) {
          // Ignore errors_id
        }
      }
      poll()
      const interval = setInterval(poll, 5000)
      intervals.push(interval)
    })

    return () => intervals.forEach(clearInterval)
  }, [exportHistory])

  // Icons component
  const Icons = {
    Play: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    Download: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path
          d="M10 3v10m0 0l4-4m-4 4l-4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Delete: (props) => (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" {...props}>
        <path
          d="M6 7v7a2 2 0 002 2h4a2 2 0 002-2V7M4 7h12M9 3h2a1 1 0 011 1v1H8V4a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    Sort: ({ direction = "asc", ...props }) => (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" {...props}>
        {direction === "asc" ? <path d="M10 6l4 4H6l4-4z" /> : <path d="M10 14l-4-4h8l-4 4z" />}
      </svg>
    ),
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Your Exports</h1>
          <p className="text-white/60 text-lg">Manage and download your exported videos</p>
        </div>

        {/* Stats Overview */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full">
          <Card className="bg-storiq-card-bg border-storiq-border flex-1 min-w-[220px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Exports</p>
                  <p className="text-2xl font-bold text-white">{exportHistory.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Icons.Play className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-storiq-card-bg border-storiq-border flex-1 min-w-[220px]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedExports.length}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-6">
          <div className="flex flex-wrap gap-4">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className={`${
                filterStatus === "all"
                  ? "bg-storiq-primary text-white hover:bg-storiq-primary/90"
                  : "bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20"
              }`}
            >
              All Exports
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
              className={`${
                filterStatus === "completed"
                  ? "bg-storiq-primary text-white hover:bg-storiq-primary/90"
                  : "bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20"
              }`}
            >
              Completed
            </Button>
            <Button
              variant={filterStatus === "failed" ? "default" : "outline"}
              onClick={() => setFilterStatus("failed")}
              className={`${
                filterStatus === "failed"
                  ? "bg-storiq-primary text-white hover:bg-storiq-primary/90"
                  : "bg-white/10 text-white border-storiq-border hover:bg-storiq-primary/20"
              }`}
            >
              Failed
            </Button>
          </div>
          <Select value={sortBy} onValueChange={(value: "filename" | "date" | "status") => setSortBy(value)}>
            <SelectTrigger className="w-[180px] bg-storiq-card-bg border-storiq-border text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="filename">Filename</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export History - New Card Layout */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Export History</h2>
            <p className="text-white/60">{filteredAndSortedExports.length} exports found</p>
          </div>

          {filteredAndSortedExports.length === 0 ? (
            <Card className="bg-storiq-card-bg border-storiq-border">
              <CardContent className="py-16">
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="p-4 bg-white/5 rounded-full">
                    <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">No exports found</h3>
                    <p className="text-white/60">Your exported videos will appear here once you start creating them.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedExports.map((item) => (
                <Card
                  key={item.export_id}
                  className="bg-storiq-card-bg border-none shadow-lg hover:shadow-xl transition-all duration-300 group rounded-2xl p-1"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className="text-white text-xl font-bold tracking-tight line-clamp-2 mb-2"
                          title={item.filename || item.name}
                        >
                          {item.filename || item.name || "Untitled Export"}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {item.date || item.createdAt
                            ? new Date(item.date || item.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`
                          shrink-0 rounded-full px-3 py-1 text-base font-semibold
                          ${item.status === "Completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                          ${item.status === "Failed" ? "bg-red-500/20 text-red-400 border-red-500/30" : ""}
                          ${!["Completed", "Failed"].includes(item.status) ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : ""}
                          border
                        `}
                      >
                        {item.status || "Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Export Details */}
                    <div className="space-y-4 mb-6">
                      {item.resolution && (
                        <div className="flex items-center gap-2 text-base">
                          <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-white/70">Resolution:</span>
                          <span className="text-white font-semibold">{item.resolution}</span>
                        </div>
                      )}
                      {item.format && (
                        <div className="flex items-center gap-2 text-base">
                          <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                            />
                          </svg>
                          <span className="text-white/70">Format:</span>
                          <span className="text-white font-semibold">{item.format}</span>
                        </div>
                      )}
                      {item.progress !== undefined && item.status !== "Completed" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-base">
                            <span className="text-white/70">Progress</span>
                            <span className="text-white/70">{item.progress}%</span>
                          </div>
                          <Progress
                            value={item.progress}
                            className="h-2 bg-white/10 rounded-full"
                            indicatorClassName={
                              item.status === "Failed"
                                ? "bg-red-500"
                                : item.status === "Completed"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <div className="flex gap-4">
                        {item.downloadUrl || item.url ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={item.downloadUrl || item.url}
                                  download={item.filename || item.name}
                                  className="inline-flex"
                                  aria-label="Download export"
                                >
                                  <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-green-500/70 text-green-500 hover:bg-green-500/15 hover:border-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none bg-transparent font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
                                    aria-label="Download export"
                                  >
                                    <Icons.Download className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                                    Download
                                  </Button>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Download exported file</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Button
                            variant="outline"
                            size="lg"
                            disabled
                            className="border-white/20 text-white/40 bg-transparent font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
                            aria-label="Download not available"
                          >
                            <Icons.Download className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
                            Not Available
                          </Button>
                        )}
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => handleOpenDeleteDialog(item.export_id)}
                              className="border-red-500/70 text-red-500 hover:bg-red-500/15 hover:border-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none font-semibold px-5 py-2 rounded-lg flex items-center gap-2 transition-all opacity-100 group-hover:opacity-100"
                              aria-label="Delete export"
                            >
                              <Icons.Delete className="w-5 h-5" aria-hidden="true" />
                              Delete
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete export</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* ConfirmDialog for delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Export"
        description="Are you sure you want to delete this export? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />
    </DashboardLayout>
  )
}

export default Exports
