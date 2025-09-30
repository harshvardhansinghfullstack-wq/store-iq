"use client"

// ConfirmDialog.tsx
import * as React from "react"

// VisuallyHidden component for accessibility (Radix UI pattern)
const VisuallyHidden: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <span
    style={{
      border: 0,
      clip: "rect(0 0 0 0)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: "1px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  disableConfirm?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  disableConfirm = false,
}) => {
  // Trap focus on open
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (open && cancelRef.current) {
      cancelRef.current.focus()
    }
  }, [open])

  // Keyboard accessibility: ESC closes, Enter on confirm
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation()
      onCancel()
    }
    if (e.key === "Enter" && !disableConfirm && !loading) {
      e.stopPropagation()
      onConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()} modal>
      <DialogContent
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-desc" : undefined}
        onKeyDown={handleKeyDown}
        className="max-w-md rounded-3xl p-0 bg-gradient-to-br from-[#1A1D24] to-[#151820] border border-[#2A2D36] shadow-2xl focus:outline-none backdrop-blur-xl"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <DialogHeader className="px-8 pt-8 pb-4 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <DialogTitle id="confirm-dialog-title" className="text-2xl font-bold text-white tracking-tight mb-2">
            {title ? title : <VisuallyHidden>Confirmation</VisuallyHidden>}
          </DialogTitle>
          {description && (
            <DialogDescription
              id="confirm-dialog-desc"
              className="text-[#B5B8C5] text-base leading-relaxed max-w-sm mx-auto"
            >
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-3 justify-center px-8 pb-8 pt-4">
          <Button
            ref={cancelRef}
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            aria-label={cancelLabel}
            type="button"
            className="flex-1 border border-[#2A2D36] text-[#B5B8C5] hover:bg-[#23262F] hover:border-[#3A3D46] hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3538CD] transition-all duration-200 rounded-xl px-6 py-3 font-medium"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={disableConfirm || loading}
            aria-label={confirmLabel}
            type="button"
            autoFocus
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-red-500/25 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {confirmLabel}
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDialog
