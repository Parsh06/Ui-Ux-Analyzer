// components/analytics-chart.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"

interface AnalysisResult {
  url: string
  complianceScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  userExperienceScore: number
  results: {
    category: string
    score: number
    icon: string
    checks: any[]
  }[]
}

interface AnalyticsChartProps {
  result: AnalysisResult
}

export function AnalyticsChart({ result }: AnalyticsChartProps) {
  const scores = [
    { name: "Overall", score: result.complianceScore, color: "bg-blue-500" },
    { name: "Performance", score: result.performanceScore, color: "bg-green-500" },
    { name: "Accessibility", score: result.accessibilityScore, color: "bg-purple-500" },
    { name: "SEO", score: result.seoScore, color: "bg-orange-500" },
    { name: "UX", score: result.userExperienceScore, color: "bg-pink-500" },
  ]

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (score >= 60) return <Minus className="w-4 h-4 text-yellow-500" />
    return <TrendingDown className="w-4 h-4 text-red-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-500 dark:text-red-400"
  }

  // Calculate category scores from results
  const categoryScores = result.results.map(category => ({
    name: category.category,
    score: category.score
  }))

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Performance Analytics
          </CardTitle>
          <CardDescription>Visual breakdown of all scoring metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Bars */}
            <div className="space-y-4">
              {scores.map((item, index) => (
                <motion.div
                  key={item.name}
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.name}</span>
                      {getTrendIcon(item.score)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score}%</span>
                      <Badge
                        variant={item.score >= 80 ? "default" : item.score >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {item.score >= 80 ? "Excellent" : item.score >= 60 ? "Good" : "Needs Work"}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={item.score} className="h-3" />
                    <div
                      className={`absolute top-0 left-0 h-3 ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Category Breakdown */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <h4 className="font-medium mb-3">Category Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryScores.map((category, index) => (
                  <motion.div
                    key={category.name}
                    className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(category.score)} mb-1`}>
                        {category.score}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{category.name}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}