"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComparisonView } from "@/components/comparison-view"
import { PDFExport } from "@/components/pdf-export"
import { AnalyticsChart } from "../components/analytics-chart"
import { ThemeToggle } from "../components/theme-toggle"
import {
  Loader2,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Sparkles,
  Download,
  Camera,
  LayoutGrid,
  FileText,
  Plus,
  Trash2,
  BarChart3,
  TypeIcon,
  Palette,
  Smartphone,
  Accessibility,
  Search,
  Filter,
  TrendingUp,
  Share2,
  BookOpen,
  Target,
  Lightbulb,
  Shield,
  Gauge,
  Activity,
  Users,
  Heart,
  RefreshCw,
  Settings,
  History,
  Upload,
  ExternalLink,
  Info,
  Award,
  Rocket,
  Brain,
  Wand2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PerformanceInsights {
  loadTime: string;
  coreWebVitals: 'Good' | 'Needs Improvement' | 'Poor';
  optimizationScore: number;
}

interface UserExperienceInsights {
  mobileFriendly: boolean;
  accessibility: 'Good' | 'Needs Work' | 'Poor';
  visualAppeal: number;
}
// Fix: Add missing AnalysisResult interface properties
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
  standardAnalysis: string
  recommendations: string[]
  aiScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  userExperienceScore: number
   performanceInsights: PerformanceInsights;
  userExperienceInsights: UserExperienceInsights;
  designSystem?: string
  animationUsage?: string
  darkModeSupport?: boolean
  themeConsistency?: number
  componentConsistency?: number
  timestamp: string
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

export default function EnhancedUIAnalyzer() {
  const [urls, setUrls] = useState<string[]>([""])
  const [loading, setLoading] = useState<boolean[]>([false])
  const [results, setResults] = useState<(AnalysisResult | null)[]>([null])
  const [errors, setErrors] = useState<string[]>([""])
  const [activeTab, setActiveTab] = useState("overview")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(300) // 5 minutes
  const { toast } = useToast()

  // Load saved data on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("ui-analyzer-history")
    const savedFavorites = localStorage.getItem("ui-analyzer-favorites")

    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory))
    }
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("ui-analyzer-history", JSON.stringify(analysisHistory))
  }, [analysisHistory])

  useEffect(() => {
    localStorage.setItem("ui-analyzer-favorites", JSON.stringify(favorites))
  }, [favorites])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      const validResults = results.filter((r) => r !== null)
      if (validResults.length > 0) {
        toast({
          title: "Auto-refresh",
          description: "Refreshing analysis data...",
        })
        // Re-analyze all valid URLs
        validResults.forEach((_, index) => {
          if (urls[index]) {
            analyzeWebsite(index)
          }
        })
      }
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, results, urls])

  const addWebsite = () => {
    setUrls([...urls, ""])
    setLoading([...loading, false])
    setResults([...results, null])
    setErrors([...errors, ""])
  }

  const removeWebsite = (index: number) => {
    if (urls.length <= 1) return

    const newUrls = [...urls]
    const newLoading = [...loading]
    const newResults = [...results]
    const newErrors = [...errors]

    newUrls.splice(index, 1)
    newLoading.splice(index, 1)
    newResults.splice(index, 1)
    newErrors.splice(index, 1)

    setUrls(newUrls)
    setLoading(newLoading)
    setResults(newResults)
    setErrors(newErrors)
  }

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls]
    newUrls[index] = value
    setUrls(newUrls)
  }

  // Fix: Update the analyzeWebsite function to use real API and add timestamp
  const analyzeWebsite = async (index: number) => {
    if (!urls[index]) return

    const newLoading = [...loading]
    const newErrors = [...errors]
    const newResults = [...results]

    newLoading[index] = true
    newErrors[index] = ""
    newResults[index] = null

    setLoading(newLoading)
    setErrors(newErrors)
    setResults(newResults)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: urls[index] })
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result: AnalysisResult = await response.json()

      // Add timestamp
      const resultWithTimestamp = {
        ...result,
        timestamp: new Date().toISOString()
      }

      const updatedResults = [...results]
      updatedResults[index] = resultWithTimestamp
      setResults(updatedResults)

      // Add to history
      setAnalysisHistory(prev => [resultWithTimestamp, ...prev.slice(0, 9)])

      setActiveTab("overview")
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${urls[index]}`,
      })
    } catch (err) {
      const updatedErrors = [...errors]
      updatedErrors[index] = err instanceof Error ? err.message : "An error occurred"
      setErrors(updatedErrors)

      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: updatedErrors[index],
      })
    } finally {
      const updatedLoading = [...loading]
      updatedLoading[index] = false
      setLoading(updatedLoading)
    }
  }

  const analyzeAllWebsites = async () => {
    const promises = urls.map((_, index) => analyzeWebsite(index))
    await Promise.all(promises)
    setComparisonMode(true)
  }

  const exportReport = (index: number) => {
    if (!results[index]) return
    const dataStr = JSON.stringify(results[index], null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `ui-analysis-${new URL(results[index]!.url).hostname}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Export Successful",
      description: "Analysis data exported as JSON",
    })
  }

  const toggleFavorite = (url: string) => {
    setFavorites((prev) => (prev.includes(url) ? prev.filter((f) => f !== url) : [...prev, url]))
  }

  const loadFromHistory = (result: AnalysisResult) => {
    setUrls([result.url])
    setResults([result])
    setLoading([false])
    setErrors([""])
    setComparisonMode(false)
    toast({
      title: "Loaded from History",
      description: `Loaded analysis for ${new URL(result.url).hostname}`,
    })
  }

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

  // Fix: Add type to filteredResults
  const filteredResults: (AnalysisResult | null)[] = results.filter((result, index) => {
    if (!result) return false

    const matchesSearch =
      result.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new URL(result.url).hostname.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      filterCategory === "all" || result.results.some((r) => r.category.toLowerCase() === filterCategory.toLowerCase())

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pass" && result.complianceScore >= 80) ||
      (filterStatus === "warning" && result.complianceScore >= 60 && result.complianceScore < 80) ||
      (filterStatus === "fail" && result.complianceScore < 60)

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  UI/UX Analyzer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Coded By Parsh Jain</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {results.some((r) => r !== null) && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    className={`${comparisonMode ? "bg-blue-50 dark:bg-blue-900/20" : ""} transition-all duration-200`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {comparisonMode ? "Single View" : "Compare"}
                  </Button>

                  {results.filter((r) => r !== null).length > 1 && comparisonMode && (
                    <PDFExport results={results.filter((r) => r !== null) as AnalysisResult[]} />
                  )}

                  <Button variant="outline" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Advanced Settings Panel */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="auto-refresh">Auto Refresh</Label>
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {autoRefresh ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    {autoRefresh && (
                      <div className="space-y-2">
                        <Label htmlFor="refresh-interval">Refresh Interval</Label>
                        <Select
                          value={refreshInterval.toString()}
                          onValueChange={(value) => setRefreshInterval(Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                            <SelectItem value="600">10 minutes</SelectItem>
                            <SelectItem value="1800">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Analysis History</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAnalysisHistory([])}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear History
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export History
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Analysis Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="w-5 h-5 text-blue-600" />
                Website Analysis
              </CardTitle>
              <CardDescription className="text-base">
                Enter website URLs to analyze UI/UX compliance with AI-powered insights and comprehensive reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urls.map((url, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex-1">
                      <div className="relative">
                        <Input
                          placeholder="https://example.com"
                          value={url}
                          onChange={(e) => updateUrl(index, e.target.value)}
                          className="h-12 text-lg bg-white/50 dark:bg-slate-800/50 pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          disabled={loading[index]}
                          onKeyPress={(e) => e.key === "Enter" && analyzeWebsite(index)}
                        />
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        {favorites.includes(url) && (
                          <Heart className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500 fill-current" />
                        )}
                      </div>
                      {errors[index] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.2 }}
                        >
                          <Alert
                            className="mt-2 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                            variant="destructive"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{errors[index]}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </div>

                    <Button
                      onClick={() => analyzeWebsite(index)}
                      disabled={loading[index] || !url}
                      className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading[index] ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12"
                              onClick={() => toggleFavorite(url)}
                              disabled={!url}
                            >
                              <Heart
                                className={`h-5 w-5 ${favorites.includes(url) ? "text-red-500 fill-current" : ""}`}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {favorites.includes(url) ? "Remove from favorites" : "Add to favorites"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12"
                              onClick={() => removeWebsite(index)}
                              disabled={urls.length <= 1}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove website</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                ))}

                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={addWebsite}
                    className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Plus className="h-4 w-4" />
                    Add Website
                  </Button>

                  {urls.length > 1 && (
                    <Button
                      onClick={analyzeAllWebsites}
                      disabled={loading.some((l) => l) || urls.some((u) => !u)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading.some((l) => l) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing All...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Analyze & Compare All
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analysis History Sidebar */}
        {analysisHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-green-600" />
                  Recent Analysis History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {analysisHistory.slice(0, 5).map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 cursor-pointer transition-all duration-200"
                        onClick={() => loadFromHistory(result)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${getScoreColor(result.complianceScore).replace("text-", "bg-")}`}
                          />
                          <span className="text-sm font-medium">{new URL(result.url).hostname}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.complianceScore}%
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Search and Filter */}
        {results.some((r) => r !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search websites..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/50 dark:bg-slate-800/50"
                    />
                  </div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-slate-800/50">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="typography">Typography</SelectItem>
                      <SelectItem value="colors">Colors</SelectItem>
                      <SelectItem value="layout">Layout</SelectItem>
                      <SelectItem value="accessibility">Accessibility</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48 bg-white/50 dark:bg-slate-800/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pass">Passed (80%+)</SelectItem>
                      <SelectItem value="warning">Warning (60-79%)</SelectItem>
                      <SelectItem value="fail">Failed (&lt;60%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Comparison Mode */}
        {comparisonMode && results.filter((r) => r !== null).length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ComparisonView results={results.filter((r) => r !== null) as AnalysisResult[]} />
          </motion.div>
        )}

        {/* Enhanced Single Website Results */}
        {!comparisonMode &&
          filteredResults.map(
            (result, index) =>
              result && (
                <motion.div
                  key={index}
                  className="space-y-6 mb-12"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Enhanced Overall Score Dashboard */}
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${getScoreGradient(result.complianceScore)}`} />
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            Analysis Results
                            <Award className="w-6 h-6 text-yellow-500" />
                          </CardTitle>
                          <CardDescription className="text-base mt-1 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            {result.url}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFavorite(result.url)}
                            className={favorites.includes(result.url) ? "text-red-500" : ""}
                          >
                            <Heart className={`w-4 h-4 mr-2 ${favorites.includes(result.url) ? "fill-current" : ""}`} />
                            {favorites.includes(result.url) ? "Favorited" : "Favorite"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => analyzeWebsite(index)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-analyze
                          </Button>
                          <PDFExport results={[result]} />
                          <Button variant="outline" size="sm" onClick={() => exportReport(index)}>
                            <Download className="w-4 h-4 mr-2" />
                            Export JSON
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Enhanced Score Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
                        <motion.div className="text-center" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                          <div className={`text-5xl font-bold ${getScoreColor(result.complianceScore)} mb-2`}>
                            {result.complianceScore}%
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Overall Score</p>
                        </motion.div>
                        <div className="text-center">
                          <div className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                            {result.passedChecks}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Passed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-semibold text-red-500 dark:text-red-400 mb-2">
                            {result.failedChecks}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-semibold text-amber-600 dark:text-amber-400 mb-2">
                            {result.warningChecks}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {result.totalChecks}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Checks</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-semibold ${getScoreColor(result.aiScore)} mb-2`}>
                            {result.aiScore}%
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AI Score</p>
                        </div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Compliance Progress</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{result.complianceScore}%</span>
                        </div>
                        <Progress value={result.complianceScore} className="h-4 mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Poor (0-40%)</span>
                          <span>Fair (40-60%)</span>
                          <span>Good (60-80%)</span>
                          <span>Excellent (80-100%)</span>
                        </div>
                      </div>

                      {/* Enhanced Category Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.results.map((category) => (
                          <motion.div
                            key={category.category}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge
                              variant={
                                category.score >= 80 ? "default" : category.score >= 60 ? "secondary" : "destructive"
                              }
                              className="px-3 py-1 text-sm"
                            >
                              {getCategoryIcon(category.category)}
                              <span className="ml-1">
                                {category.category}: {category.score}%
                              </span>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>

                      {/* New Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">Performance</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(result.performanceScore)}`}>
                            {result.performanceScore}%
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Accessibility className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Accessibility</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(result.accessibilityScore)}`}>
                            {result.accessibilityScore}%
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="w-5 h-5 text-purple-600" />
                            <span className="font-medium">SEO</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(result.seoScore)}`}>
                            {result.seoScore}%
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-orange-600" />
                            <span className="font-medium">User Experience</span>
                          </div>
                          <div className={`text-2xl font-bold ${getScoreColor(result.userExperienceScore)}`}>
                            {result.userExperienceScore}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics Chart */}
                  <AnalyticsChart result={result} />

                  {/* Enhanced Main Content Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-12 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                      <TabsTrigger value="overview" className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                      </TabsTrigger>
                      <TabsTrigger value="details" className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="recommendations" className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Recommendations
                      </TabsTrigger>
                      <TabsTrigger value="screenshot" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Screenshot
                      </TabsTrigger>
                      <TabsTrigger value="data" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Raw Data
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Insights
                      </TabsTrigger>
                    </TabsList>

                    {/* Enhanced AI Analysis Tab */}
                    <TabsContent value="overview" className="mt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-600" />
                              AI-Powered Analysis
                            </CardTitle>
                            <CardDescription>Comprehensive analysis generated by Advanced AI</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-4">
                              <div className="flex items-center justify-between">
                                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                  AI Confidence Score
                                </div>
                                <div className={`text-3xl font-bold ${getScoreColor(result.aiScore)}`}>
                                  {result.aiScore}%
                                </div>
                              </div>
                              <Progress value={result.aiScore} className="h-3 mt-2" />
                            </div>

                            <ScrollArea className="h-96">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                  <h3 className="font-semibold text-lg mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    AI Analysis:
                                  </h3>
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
                                    {result.aiAnalysis}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-green-600" />
                              Standards Compliance
                            </CardTitle>
                            <CardDescription>Analysis based on industry standards and guidelines</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-96">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                  <h3 className="font-semibold text-lg mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    Standards Analysis:
                                  </h3>
                                  <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                                    {result.standardAnalysis}
                                  </div>
                                </div>
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    {/* Enhanced Detailed Results Tab */}
                    <TabsContent value="details" className="mt-6">
                      <div className="grid gap-6">
                        {result.results.map((category, catIndex) => (
                          <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: catIndex * 0.1 }}
                          >
                            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                              <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {getCategoryIcon(category.category)}
                                    {category.category}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        category.score >= 80
                                          ? "default"
                                          : category.score >= 60
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {category.score}%
                                    </Badge>
                                    <Progress value={category.score} className="w-24 h-2" />
                                  </div>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {category.checks.map((check, idx) => (
                                    <motion.div
                                      key={idx}
                                      className="flex items-start gap-3 p-4 border rounded-lg bg-white/50 dark:bg-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-200"
                                      whileHover={{ scale: 1.02 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {check.status === "pass" && (
                                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                                        )}
                                        {check.status === "fail" && <XCircle className="w-5 h-5 text-red-500" />}
                                        {check.status === "warning" && (
                                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{check.rule}</h4>
                                          <Badge
                                            variant={
                                              check.status === "pass"
                                                ? "default"
                                                : check.status === "fail"
                                                  ? "destructive"
                                                  : "secondary"
                                            }
                                            className="text-xs"
                                          >
                                            {check.status}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {check.priority}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{check.message}</p>
                                        {(check.actual || check.expected) && (
                                          <div className="text-xs space-y-1 bg-gray-50 dark:bg-slate-800 p-2 rounded">
                                            {check.actual && (
                                              <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                  Actual:{" "}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">{check.actual}</span>
                                              </div>
                                            )}
                                            {check.expected && (
                                              <div>
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                  Expected:{" "}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                  {check.expected}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Enhanced Recommendations Tab */}
                    <TabsContent value="recommendations" className="mt-6">
                      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-600" />
                            AI-Powered Recommendations
                          </CardTitle>
                          <CardDescription>
                            Actionable suggestions to improve your website's UI/UX based on AI analysis
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(result.recommendations ?? []).map((recommendation, idx) => (
                              <motion.div
                                key={idx}
                                className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{recommendation}</p>
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      Priority: {idx < 3 ? "High" : idx < 6 ? "Medium" : "Low"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Impact: {idx < 2 ? "High" : idx < 5 ? "Medium" : "Low"}
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Info className="w-4 h-4" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

           {/* Enhanced Screenshot Tab */}
<TabsContent value="screenshot" className="mt-6">
  {/* Minimal screenshot display as requested */}
  {result.screenshot ? (
    <img
      src={result.screenshot}
      alt="Website screenshot"
      className="w-full h-auto border rounded-lg mb-6"
    />
  ) : null}

  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-green-600" />
        Website Screenshot
      </CardTitle>
      <CardDescription>
        Visual representation of the analyzed website with annotations
      </CardDescription>
    </CardHeader>
    <CardContent>
      {result.screenshot ? (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-lg">
            <img
              src={result.screenshot || "/placeholder.svg?height=600&width=1200"}
              alt="Website Screenshot"
              className="w-full h-auto"
            />
          </div>
          
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Screenshot not available</p>
          <Button variant="outline" className="mt-4">
            <Camera className="w-4 h-4 mr-2" />
            Take Screenshot
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

                    {/* Enhanced Raw Data Tab */}
                    <TabsContent value="data" className="mt-6">
                      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-gray-600" />
                            Extracted Data
                          </CardTitle>
                          <CardDescription>Raw style and structural data extracted from the website</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2 mb-4">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </Button>
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Import Data
                            </Button>

                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Data
                            </Button>
                          </div>
                          <ScrollArea className="h-96">
                            <pre className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200 border">
                              {JSON.stringify(result.extractedData, null, 2)}
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* New Insights Tab */}
                   <TabsContent value="insights" className="mt-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Performance Insights Card */}
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Load Time</span>
            </div>
            <span className="text-blue-600 font-semibold">
              {result.performanceInsights.loadTime}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-600" />
              <span className="font-medium">Core Web Vitals</span>
            </div>
            <Badge 
              variant={
                result.performanceInsights.coreWebVitals === 'Good' ? 'default' :
                result.performanceInsights.coreWebVitals === 'Needs Improvement' ? 'secondary' : 'destructive'
              }
            >
              {result.performanceInsights.coreWebVitals}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Optimization Score</span>
            </div>
            <span className="text-purple-600 font-semibold">
              {result.performanceInsights.optimizationScore}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* User Experience Insights Card */}
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/20 dark:border-slate-700/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          User Experience Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span className="font-medium">Mobile Friendly</span>
            </div>
            <Badge variant={result.userExperienceInsights.mobileFriendly ? 'default' : 'destructive'}>
              {result.userExperienceInsights.mobileFriendly ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-amber-600" />
              <span className="font-medium">Accessibility</span>
            </div>
            <Badge 
              variant={
                result.userExperienceInsights.accessibility === 'Good' ? 'default' :
                result.userExperienceInsights.accessibility === 'Needs Work' ? 'secondary' : 'destructive'
              }
            >
              {result.userExperienceInsights.accessibility}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Visual Appeal</span>
            </div>
            <span className="text-blue-600 font-semibold">
              {result.userExperienceInsights.visualAppeal}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
                  </Tabs>
                </motion.div>
              ),
          )}
      </div>
    </div>
  )
}
