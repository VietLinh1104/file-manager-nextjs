import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DialogFile() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Upload File</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">

          <DialogHeader>
            {/* title */}
            <DialogTitle>Upload File</DialogTitle>

            {/* description */}
            <DialogDescription>
              Upload your file here. Make sure to follow the guidelines for file types and sizes.
            </DialogDescription>
          </DialogHeader>

          {/* Form fields */}
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">File Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Upload</Label>
              <Input
                key="file-input-0"
                placeholder=""
                type="file"
                id="file-input-0"
                className=" "
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
