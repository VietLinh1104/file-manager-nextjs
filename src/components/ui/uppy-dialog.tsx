'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import Uppy, { UppyFile, UploadResult } from '@uppy/core'
import { Dashboard } from '@uppy/react'
import AwsS3Multipart, { AwsS3MultipartOptions } from '@uppy/aws-s3-multipart'

import '@uppy/core/dist/style.min.css'
import '@uppy/dashboard/dist/style.min.css'


export default function UppyDialog() {
  const [open, setOpen] = useState(false)

  


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">📤 Upload Multipart</Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload file lớn lên Cloudflare R2</DialogTitle>
          <DialogDescription>
            File sẽ được chia nhỏ (multipart) và upload trực tiếp qua presigned URL.
          </DialogDescription>
        </DialogHeader>

        <div className="p-2">
          <Dashboard
            uppy={uppy}
            width="100%"
            height={380}
            proudlyDisplayPoweredByUppy={false}
            hideProgressDetails={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
