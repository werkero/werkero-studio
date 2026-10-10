import { handleUpload } from '@vercel/blob/client'
import { requireAdmin, requirePermission } from '../../../utils/auth'
import { apiError } from '../../../utils/api'

// Generates a client upload token for direct browser-to-Blob uploads.
// This bypasses the server's 4.5MB payload limit (Vercel Hobby).
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.upload')

  const body = await readBody(event)
  try {
    const jsonResponse = await handleUpload({
      body,
      request: event.node.req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/*', 'video/*', 'application/pdf', 'image/svg+xml'],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: s.id, brandId: s.brandId }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Metadata registration happens via /api/admin/media/register
        // (client calls it after upload completes)
      },
    })
    return jsonResponse
  } catch (e: any) {
    apiError(500, 'BLOB_TOKEN_FAILED', e?.message || 'Failed to generate upload token')
  }
})
