'use client'

import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog'

// A generic "are you sure?" gate. Every destructive or state-changing admin
// action routes through this so nothing happens on a single unconfirmed click.
export interface ConfirmState {
  title: string
  description: string
  actionLabel: string
  destructive?: boolean
  onConfirm: () => void | Promise<void>
}

export default function ConfirmDialog({
  confirm,
  loading,
  onClose,
}: {
  confirm: ConfirmState | null
  loading: boolean
  onClose: () => void
}) {
  return (
    <AlertDialog
      open={!!confirm}
      onOpenChange={(open) => { if (!open && !loading) onClose() }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={confirm?.destructive ? 'destructive' : 'default'}
            disabled={loading}
            onClick={(e) => {
              e.preventDefault() // keep open until the async action resolves
              confirm?.onConfirm()
            }}
          >
            {loading ? 'Working…' : confirm?.actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
