"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TypeIcon,
  Palette,
  LayoutGrid,
  Accessibility,
  Smartphone,
  Trophy,
  Target,
  TrendingUp,
  Share2,
  Download,
} from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface AnalysisResult {
  url: string
  screenshot?: string
  extractedData: any
  complianceScore: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
  aiAnalysis: string
  recommendations: string[]
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  userExperienceScore: number
  results: {
    category: string
    score: number
    icon: string
    checks: {
      rule: string
      status: "pass" | "fail" | "warning"
      message: string
      actual?: string
      expected?: string
      priority: "high" | "medium" | "low"
    }[]
  }[]
}

interface ComparisonViewProps {
  results: AnalysisResult[]
}

export function ComparisonView({ results }: ComparisonViewProps) {
  const [activeCategory, setActiveCategory] = useState("overview")

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-500 dark:text-red-400"
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-teal-600"
    if (score >= 60) return "from-amber-500 to-orange-600"
    return "from-red-500 to-pink-600"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Typography":
        return <TypeIcon className="w-5 h-5" />
      case "Colors":
        return <Palette className="w-5 h-5" />
      case "Layout":
        return <LayoutGrid className="w-5 h-5" />
      case "Accessibility":
        return <Accessibility className="w-5 h-5" />
      case "Mobile":
        return <Smartphone className="w-5 h-5" />
      default:
        return <BarChart3 className="w-5 h-5" />
    }
  }

  // Get winner for each metric
  const getWinner = (metric: keyof AnalysisResult) => {
    return results.reduce((winner, current) =>
      (current[metric] as number) > (winner[metric] as number) ? current : winner,
    )
  }

  const allCategories = ["overview", ...new Set(results.flatMap((r) => r.results.map((cat) => cat.category)))]

  return (
    <div className="space-y-6">
      {/* Enhanced Comparison Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Website Comparison Dashboard
                </CardTitle>
                <CardDescription>
                  Compare UI/UX compliance across multiple websites with detailed analytics
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Comparison
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Winner Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-sm">Overall Winner</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {new URL(getWinner("complianceScore").url).hostname}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getWinner("complianceScore").complianceScore}% compliance
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-sm">Best Performance</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {new URL(getWinner("performanceScore").url).hostname}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getWinner("performanceScore").performanceScore}% score
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Accessibility className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-sm">Most Accessible</span>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {new URL(getWinner("accessibilityScore").url).hostname}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getWinner("accessibilityScore").accessibilityScore}% accessible
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-sm">Best UX</span>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  {new URL(getWinner("userExperienceScore").url).hostname}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {getWinner("userExperienceScore").userExperienceScore}% UX score
                </div>
              </div>
            </div>

            {/* Enhanced Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col border rounded-lg overflow-hidden bg-white/50 dark:bg-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`h-2 bg-gradient-to-r ${getScoreGradient(result.complianceScore)}`} />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-lg truncate" title={result.url}>
                        {new URL(result.url).hostname}
                      </h3>
                      {result === getWinner("complianceScore") && <Trophy className="w-5 h-5 text-yellow-500" />}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className={`text-3xl font-bold ${getScoreColor(result.complianceScore)}`}>
                        {result.complianceScore}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {result.passedChecks}/{result.totalChecks} passed
                      </div>
                    </div>

                    <Progress value={result.complianceScore} className="h-2 mb-3" />

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex justify-between">
                        <span>Performance:</span>
                        <span className={getScoreColor(result.performanceScore)}>{result.performanceScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accessibility:</span>
                        <span className={getScoreColor(result.accessibilityScore)}>{result.accessibilityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SEO:</span>
                        <span className={getScoreColor(result.seoScore)}>{result.seoScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>UX:</span>
                        <span className={getScoreColor(result.userExperienceScore)}>{result.userExperienceScore}%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {result.results.map((category) => (
                        <Badge
                          key={category.category}
                          variant={
                            category.score >= 80 ? "default" : category.score >= 60 ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {category.category}: {category.score}%
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Tabbed Comparison */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="flex overflow-x-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-1 h-auto">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          {allCategories.slice(1).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center gap-1">
              {getCategoryIcon(category)}
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {new URL(result.url).hostname}
                      {result === getWinner("complianceScore") && (
                        <Badge variant="default" className="bg-yellow-500">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Overall analysis summary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                          {result.aiAnalysis.split("\n").slice(0, 3).join("\n")}...
                        </p>
                        <h4 className="text-sm font-medium mt-4 mb-2">Top Recommendations:</h4>
                        <ul className="space-y-1">
                          {result.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="text-sm">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {allCategories.slice(1).map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category} Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-slate-700">
                        <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Rule</th>
                        {results.map((result, idx) => (
                          <th key={idx} className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">
                            {new URL(result.url).hostname}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(
                        new Set(
                          results.flatMap(
                            (r) =>
                              r.results.find((c) => c.category === category)?.checks.map((check) => check.rule) || [],
                          ),
                        ),
                      ).map((rule, ruleIdx) => (
                        <tr
                          key={ruleIdx}
                          className={
                            ruleIdx % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-gray-50 dark:bg-slate-700/50"
                          }
                        >
                          <td className="p-3 border-t dark:border-slate-600 font-medium">{rule}</td>
                          {results.map((result, resultIdx) => {
                            const categoryData = result.results.find((c) => c.category === category)
                            const check = categoryData?.checks.find((c) => c.rule === rule)

                            return (
                              <td key={resultIdx} className="p-3 border-t dark:border-slate-600">
                                {check ? (
                                  <div className="flex items-center gap-2">
                                    {check.status === "pass" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                                    {check.status === "fail" && <XCircle className="w-4 h-4 text-red-500" />}
                                    {check.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                                    <span className="text-sm">{check.message}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
