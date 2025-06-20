"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

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

interface PDFExportProps {
  results: AnalysisResult[]
}

export function PDFExport({ results }: PDFExportProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generatePDF = async () => {
    setLoading(true)

    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import("jspdf")).default
      await import("jspdf-autotable")

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      }) as any

      // Add title
      doc.setFontSize(20)
      doc.setTextColor(44, 62, 80)
      doc.text("UI/UX Analysis Report", 15, 20)

      // Add date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 27)

      // Add separator line
      doc.setDrawColor(200, 200, 200)
      doc.line(15, 30, 195, 30)

      let yPos = 40

      // For each website
      for (const result of results) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        // Website URL
        doc.setFontSize(14)
        doc.setTextColor(44, 62, 80)
        doc.text(`Website: ${new URL(result.url).hostname}`, 15, yPos)
        yPos += 8

        // Overall score
        doc.setFontSize(12)
        doc.text(`Overall Score: ${result.complianceScore}%`, 15, yPos)
        yPos += 6

        // Enhanced score breakdown
        doc.setFontSize(10)
        doc.text(
          `Performance: ${result.performanceScore}% | Accessibility: ${result.accessibilityScore}% | SEO: ${result.seoScore}% | UX: ${result.userExperienceScore}%`,
          15,
          yPos,
        )
        yPos += 6

        // Passed/Failed/Warning counts
        doc.text(
          `Passed: ${result.passedChecks} | Failed: ${result.failedChecks} | Warnings: ${result.warningChecks}`,
          15,
          yPos,
        )
        yPos += 10

        // Category scores
        doc.setFontSize(12)
        doc.text("Category Scores:", 15, yPos)
        yPos += 6

        // Create a table for category scores
        const categoryData = result.results.map((category) => [category.category, `${category.score}%`])

        doc.autoTable({
          startY: yPos,
          head: [["Category", "Score"]],
          body: categoryData,
          theme: "grid",
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: 15, right: 15 },
        })

        yPos = (doc as any).lastAutoTable.finalY + 10

        // Check if we need a new page
        if (yPos > 220) {
          doc.addPage()
          yPos = 20
        }

        // Top recommendations
        doc.setFontSize(12)
        doc.text("Top Recommendations:", 15, yPos)
        yPos += 6

        // List recommendations
        doc.setFontSize(10)
        result.recommendations.slice(0, 5).forEach((rec, idx) => {
          const lines = doc.splitTextToSize(rec, 170)
          doc.text(`${idx + 1}. ${lines[0]}`, 20, yPos)
          yPos += 5
          if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
              doc.text(`   ${lines[i]}`, 20, yPos)
              yPos += 5
            }
          }
        })

        yPos += 10

        // Add a page break between websites
        if (result !== results[results.length - 1]) {
          doc.addPage()
          yPos = 20
        }
      }

      // Save the PDF
      const filename =
        results.length === 1
          ? `ui-analysis-${new URL(results[0].url).hostname}.pdf`
          : `ui-analysis-comparison-${results.length}-sites.pdf`

      doc.save(filename)

      toast({
        title: "PDF Export Successful",
        description: `Report saved as ${filename}`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        variant: "destructive",
        title: "PDF Export Failed",
        description: "There was an error generating the PDF report",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={generatePDF} disabled={loading}>
      {loading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </>
      )}
    </Button>
  )
}
