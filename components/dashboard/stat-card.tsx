import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  isLoading 
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-secondary" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% vs. ontem
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-secondary" aria-hidden="true" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
