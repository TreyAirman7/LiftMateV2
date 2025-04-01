import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  )
}

export function SkeletonWorkoutCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-5 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

