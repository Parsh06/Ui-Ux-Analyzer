import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import puppeteer from "puppeteer-core"
import chrome from "@sparticuz/chromium"


// Initialize Gemini AI with the correct API key
const genAI = new GoogleGenerativeAI("AIzaSyC1SfO6Uo0hxFOrY_yG6CaQO4RcUMx9k3k")

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

interface ExtractedData {
  // Basic Info
  title: string
  description: string
  favicon: string

  // Typography
  fonts: string[]
  fontSizes: string[]
  fontWeights: string[]
  lineHeights: string[]
  letterSpacing: string[]

  // Colors
  colors: string[]
  backgroundColors: string[]
  textColors: string[]
  linkColors: string[]
  borderColors: string[]

  // Layout & Spacing
  spacing: string[]
  margins: string[]
  paddings: string[]
  borderRadius: string[]

  // Components
  buttonStyles: any[]
  inputStyles: any[]
  cardStyles: any[]

  // Images & Media
  images: {
    count: number
    withAlt: number
    withoutAlt: number
    formats: string[]
    sizes: string[]
  }

  // Structure
  headingStructure: {
    h1: number
    h2: number
    h3: number
    h4: number
    h5: number
    h6: number
  }

  // Responsive & Accessibility
  hasViewportMeta: boolean
  hasResponsiveDesign: boolean
  hasAccessibilityFeatures: boolean
  hasAriaLabels: boolean
  hasSemanticHTML: boolean

  // Performance
  cssFiles: number
  jsFiles: number
  totalElements: number

  // Forms
  forms: {
    count: number
    hasLabels: boolean
    hasValidation: boolean
    hasPlaceholders: boolean
  }

  // Navigation
  navigation: {
    hasMainNav: boolean
    hasBreadcrumbs: boolean
    hasSkipLinks: boolean
  }
}

async function extractWebsiteData(url: string): Promise<{ data: ExtractedData; screenshot?: string }> {
  try {
    // Launch Puppeteer with Chrome
    const browser = await puppeteer.launch({
      executablePath: process.env.NODE_ENV === 'production'
        ? await chrome.executablePath()
        : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      args: chrome.args,
    });

    const page = await browser.newPage()

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )

    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 })

    // Take a screenshot
    const screenshotBuffer = await page.screenshot({ fullPage: false, type: "jpeg", quality: 80 })
    const screenshot = `data:image/jpeg;base64,${Buffer.from(screenshotBuffer).toString("base64")}`

    // Extract all CSS styles
    const extractedData = await page.evaluate(() => {
      const data: any = {
        title: document.title,
        description: "",
        favicon: "",
        fonts: [],
        fontSizes: [],
        fontWeights: [],
        lineHeights: [],
        letterSpacing: [],
        colors: [],
        backgroundColors: [],
        textColors: [],
        linkColors: [],
        borderColors: [],
        spacing: [],
        margins: [],
        paddings: [],
        borderRadius: [],
        buttonStyles: [],
        inputStyles: [],
        cardStyles: [],
        images: {
          count: 0,
          withAlt: 0,
          withoutAlt: 0,
          formats: [],
          sizes: [],
        },
        headingStructure: {
          h1: 0,
          h2: 0,
          h3: 0,
          h4: 0,
          h5: 0,
          h6: 0,
        },
        hasViewportMeta: false,
        hasResponsiveDesign: false,
        hasAccessibilityFeatures: false,
        hasAriaLabels: false,
        hasSemanticHTML: false,
        cssFiles: 0,
        jsFiles: 0,
        totalElements: 0,
        forms: {
          count: 0,
          hasLabels: false,
          hasValidation: false,
          hasPlaceholders: false,
        },
        navigation: {
          hasMainNav: false,
          hasBreadcrumbs: false,
          hasSkipLinks: false,
        },
      }

      // Extract meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      data.description = metaDescription ? metaDescription.getAttribute("content") || "" : ""

      // Extract favicon
      const faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
      data.favicon = faviconLink ? faviconLink.getAttribute("href") || "" : ""

      // Check for viewport meta
      data.hasViewportMeta = !!document.querySelector('meta[name="viewport"]')

      // Extract all stylesheets
      const styleSheets = Array.from(document.styleSheets)
      data.cssFiles = styleSheets.length

      // Extract all script tags
      const scripts = document.querySelectorAll("script[src]")
      data.jsFiles = scripts.length

      // Extract all elements
      data.totalElements = document.querySelectorAll("*").length

      // Extract fonts, colors, and other CSS properties
      const fontSet = new Set<string>()
      const fontSizeSet = new Set<string>()
      const fontWeightSet = new Set<string>()
      const lineHeightSet = new Set<string>()
      const letterSpacingSet = new Set<string>()
      const colorSet = new Set<string>()
      const bgColorSet = new Set<string>()
      const textColorSet = new Set<string>()
      const borderColorSet = new Set<string>()
      const marginSet = new Set<string>()
      const paddingSet = new Set<string>()
      const borderRadiusSet = new Set<string>()

      // Process all elements
      const allElements = document.querySelectorAll("*")
      allElements.forEach((element) => {
        const styles = window.getComputedStyle(element)

        // Extract typography
        const fontFamily = styles.fontFamily
        if (fontFamily) fontSet.add(fontFamily.split(",")[0].trim().replace(/"/g, ""))

        const fontSize = styles.fontSize
        if (fontSize) fontSizeSet.add(fontSize)

        const fontWeight = styles.fontWeight
        if (fontWeight) fontWeightSet.add(fontWeight)

        const lineHeight = styles.lineHeight
        if (lineHeight && lineHeight !== "normal") lineHeightSet.add(lineHeight)

        const letterSpacing = styles.letterSpacing
        if (letterSpacing && letterSpacing !== "normal") letterSpacingSet.add(letterSpacing)

        // Extract colors
        const color = styles.color
        if (color) {
          textColorSet.add(color)
          colorSet.add(color)
        }

        const backgroundColor = styles.backgroundColor
        if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)") {
          bgColorSet.add(backgroundColor)
          colorSet.add(backgroundColor)
        }

        const borderColor = styles.borderColor
        if (borderColor && borderColor !== "rgb(0, 0, 0)") {
          borderColorSet.add(borderColor)
          colorSet.add(borderColor)
        }

        // Extract spacing
        const margin = styles.margin
        if (margin && margin !== "0px") marginSet.add(margin)

        const padding = styles.padding
        if (padding && padding !== "0px") paddingSet.add(padding)

        const borderRadius = styles.borderRadius
        if (borderRadius && borderRadius !== "0px") borderRadiusSet.add(borderRadius)

        // Extract heading structure
        const tagName = element.tagName.toLowerCase()
        if (tagName === "h1") data.headingStructure.h1++
        if (tagName === "h2") data.headingStructure.h2++
        if (tagName === "h3") data.headingStructure.h3++
        if (tagName === "h4") data.headingStructure.h4++
        if (tagName === "h5") data.headingStructure.h5++
        if (tagName === "h6") data.headingStructure.h6++

        // Check for ARIA attributes
        if (
          element.hasAttribute("aria-label") ||
          element.hasAttribute("aria-labelledby") ||
          element.hasAttribute("aria-describedby") ||
          element.hasAttribute("role")
        ) {
          data.hasAriaLabels = true
        }
      })

      // Extract button styles
      const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn, .button')
      buttons.forEach((button, index) => {
        const styles = window.getComputedStyle(button)
        data.buttonStyles.push({
          index,
          tag: button.tagName.toLowerCase(),
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          text: button.textContent?.trim() || "",
        })
      })

      // Extract input styles
      const inputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea, select')
      inputs.forEach((input, index) => {
        const styles = window.getComputedStyle(input)
        data.inputStyles.push({
          index,
          tag: input.tagName.toLowerCase(),
          type: (input as HTMLInputElement).type || "text",
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          fontSize: styles.fontSize,
          width: styles.width,
          height: styles.height,
        })
      })

      // Extract image information
      const images = document.querySelectorAll("img")
      data.images.count = images.length

      const imageFormats = new Set<string>()
      const imageSizes = new Set<string>()

      images.forEach((img) => {
        // Check for alt text
        if (img.hasAttribute("alt") && img.getAttribute("alt")?.trim()) {
          data.images.withAlt++
        } else {
          data.images.withoutAlt++
        }

        // Extract image format
        const src = img.getAttribute("src") || ""
        if (src) {
          const format = src.split(".").pop()?.toLowerCase() || ""
          if (format && ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(format)) {
            imageFormats.add(format)
          }
        }

        // Extract image dimensions
        const width = img.getAttribute("width") || img.width.toString()
        const height = img.getAttribute("height") || img.height.toString()
        if (width && height) {
          imageSizes.add(`${width}x${height}`)
        }
      })

      data.images.formats = Array.from(imageFormats)
      data.images.sizes = Array.from(imageSizes)

      // Check for forms
      const forms = document.querySelectorAll("form")
      data.forms.count = forms.length
      data.forms.hasLabels = document.querySelectorAll("label").length > 0
      data.forms.hasPlaceholders = document.querySelectorAll("[placeholder]").length > 0
      data.forms.hasValidation = document.querySelectorAll("[required], [pattern], [minlength], [maxlength]").length > 0

      // Check for navigation
      data.navigation.hasMainNav =
        !!document.querySelector("nav") ||
        !!document.querySelector('[role="navigation"]') ||
        !!document.querySelector(".navigation") ||
        !!document.querySelector("#navigation") ||
        !!document.querySelector(".navbar") ||
        !!document.querySelector("#navbar")

      data.navigation.hasBreadcrumbs =
        !!document.querySelector(".breadcrumb") ||
        !!document.querySelector(".breadcrumbs") ||
        !!document.querySelector('[aria-label="breadcrumb"]')

      data.navigation.hasSkipLinks =
        !!document.querySelector('a[href="#content"]') || !!document.querySelector('a[href="#main"]')

      // Check for semantic HTML
      data.hasSemanticHTML =
        !!document.querySelector("header") ||
        !!document.querySelector("footer") ||
        !!document.querySelector("main") ||
        !!document.querySelector("article") ||
        !!document.querySelector("section") ||
        !!document.querySelector("nav") ||
        !!document.querySelector("aside")

      // Check for responsive design
      data.hasResponsiveDesign =
        data.hasViewportMeta ||
        document.querySelectorAll('[class*="col-"], [class*="row"], .container, .container-fluid').length > 0 ||
        document.querySelectorAll('[class*="sm-"], [class*="md-"], [class*="lg-"], [class*="xl-"]').length > 0

      // Check for accessibility features
      data.hasAccessibilityFeatures =
        data.hasAriaLabels ||
        data.images.withAlt > 0 ||
        data.hasSemanticHTML ||
        document.querySelectorAll("[tabindex]").length > 0

      // Convert sets to arrays
      data.fonts = Array.from(fontSet)
      data.fontSizes = Array.from(fontSizeSet)
      data.fontWeights = Array.from(fontWeightSet)
      data.lineHeights = Array.from(lineHeightSet)
      data.letterSpacing = Array.from(letterSpacingSet)
      data.colors = Array.from(colorSet)
      data.backgroundColors = Array.from(bgColorSet)
      data.textColors = Array.from(textColorSet)
      data.borderColors = Array.from(borderColorSet)
      data.margins = Array.from(marginSet)
      data.paddings = Array.from(paddingSet)
      data.borderRadius = Array.from(borderRadiusSet)
      data.spacing = [...data.margins, ...data.paddings]

      return data
    })

    // Close the browser
    await browser.close()

    return { data: extractedData as ExtractedData, screenshot }
  } catch (error) {
    console.error("Error extracting website data:", error)
    throw new Error(`Failed to extract website data: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function generatePerformanceInsights(extractedData: ExtractedData): PerformanceInsights {
  // Calculate load time based on resources
  const baseLoadTime = 1.0;
  const resourceFactor = (extractedData.cssFiles * 0.1) + (extractedData.jsFiles * 0.15) + (extractedData.images.count * 0.05);
  const loadTime = baseLoadTime + resourceFactor;
  
  // Determine core web vitals status
  let coreWebVitals: 'Good' | 'Needs Improvement' | 'Poor' = 'Good';
  if (resourceFactor > 2) coreWebVitals = 'Needs Improvement';
  if (resourceFactor > 4) coreWebVitals = 'Poor';
  
  // Calculate optimization score
  const optimizationScore = Math.max(0, 100 - (resourceFactor * 10));
  
  return {
    loadTime: `${loadTime.toFixed(1)}s`,
    coreWebVitals,
    optimizationScore: Math.round(optimizationScore)
  };
}

// New function to generate user experience insights
function generateUserExperienceInsights(
  extractedData: ExtractedData,
  complianceResults: any[]
): UserExperienceInsights {
  // Get category scores
  const typographyScore = complianceResults.find(r => r.category === "Typography")?.score || 0;
  const colorsScore = complianceResults.find(r => r.category === "Colors")?.score || 0;
  const layoutScore = complianceResults.find(r => r.category === "Layout")?.score || 0;
  const accessibilityScore = complianceResults.find(r => r.category === "Accessibility")?.score || 0;
  
  // Determine accessibility status
  let accessibility: 'Good' | 'Needs Work' | 'Poor' = 'Good';
  if (accessibilityScore < 80) accessibility = 'Needs Work';
  if (accessibilityScore < 60) accessibility = 'Poor';
  
  // Calculate visual appeal as average of design scores
  const visualAppeal = Math.round((typographyScore + colorsScore + layoutScore) / 3);
  
  return {
    mobileFriendly: extractedData.hasResponsiveDesign && extractedData.hasViewportMeta,
    accessibility,
    visualAppeal
  };
}
// Helper function for delay

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function analyzeWithGemini(
  extractedData: ExtractedData,
  url: string,
): Promise<{
  analysis: string
  recommendations: string[]
  score: number
}> {
  try {
    // Use the correct model name for the Node SDK
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Truncate large arrays to prevent exceeding token limits
    const truncatedData = {
      ...extractedData,
      fonts: extractedData.fonts.slice(0, 10),
      colors: extractedData.colors.slice(0, 20),
      buttonStyles: extractedData.buttonStyles.slice(0, 5),
      inputStyles: extractedData.inputStyles.slice(0, 5),
    };

    const prompt = `
You are a UI/UX expert analyzing a website. Based on the extracted data below, provide a comprehensive analysis.

Website URL: ${url}

Extracted Data:
${JSON.stringify(truncatedData, null, 2)}

Please provide:
1. A detailed analysis of the website's UI/UX quality (2-3 paragraphs)
2. Specific recommendations for improvement (list format)
3. An overall score out of 100

Focus on:
- Typography and readability
- Color scheme and contrast
- Layout and spacing consistency
- Responsive design
- Accessibility features
- User experience patterns
- Performance implications
- Modern design standards

Format your response as JSON with keys: "analysis", "recommendations" (array), "score" (number)
`

    // Retry logic with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let delay = 2000; // Start with 2 seconds

    while (retryCount < maxRetries) {
      try {
        // Generate content with the prompt
        const result = await model.generateContent([prompt]);
        const response = await result.response;
        const text = await response.text();

        // Try to parse the JSON response
        try {
          // Find the first JSON object in the response
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}') + 1;
          const jsonString = text.substring(jsonStart, jsonEnd);
          
          const parsed = JSON.parse(jsonString);
          return {
            analysis: parsed.analysis || "Analysis not available",
            recommendations: parsed.recommendations || [],
            score: parsed.score || 50,
          };
        } catch (parseError) {
          console.error("Error parsing Gemini response:", parseError);
          // Return the raw text if parsing fails
          return {
            analysis: text,
            recommendations: [
              "Improve color contrast for better accessibility",
              "Optimize typography hierarchy",
              "Enhance responsive design",
              "Add more semantic HTML elements",
              "Improve image optimization",
            ],
            score: 65,
          };
        }
      } catch (error: any) {
        console.error(`Gemini API attempt ${retryCount + 1} failed:`, error);

        // Retry only on rate limit errors (429) or model errors
        if ((error.message && error.message.includes("429")) || 
            (error.message && error.message.includes("model")) && 
            retryCount < maxRetries - 1) {
          // Exponential backoff with jitter
          const jitter = Math.random() * 1000;
          await sleep(delay + jitter);
          delay *= 2;
          retryCount++;
        } else {
          throw error;
        }
      }
    }

    // If all retries failed, return the fallback analysis
    return {
      analysis: "AI analysis temporarily unavailable. The website has been analyzed using our standard guidelines.",
      recommendations: [
        "Improve color contrast for better accessibility",
        "Optimize typography hierarchy",
        "Enhance responsive design",
        "Add more semantic HTML elements",
        "Improve image optimization",
      ],
      score: 60,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    // Return fallback analysis on any error
    return {
      analysis: "AI analysis temporarily unavailable. The website has been analyzed using our standard guidelines.",
      recommendations: [
        "Improve color contrast for better accessibility",
        "Optimize typography hierarchy",
        "Enhance responsive design",
        "Add more semantic HTML elements",
        "Improve image optimization",
      ],
      score: 60,
    };
  }
}

function analyzeCompliance(extractedData: ExtractedData): {
  complianceScore: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  warningChecks: number
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
} {
  const results: any[] = []
  let totalChecks = 0
  let passedChecks = 0
  let warningChecks = 0

  // Typography Analysis
  const typographyChecks: any[] = []

  // Font variety check
  const fontCount = extractedData.fonts.length
  typographyChecks.push({
    rule: "Font variety",
    status: fontCount <= 3 ? "pass" : fontCount <= 5 ? "warning" : "fail",
    message: fontCount <= 3 ? "Good font variety" : fontCount <= 5 ? "Consider reducing fonts" : "Too many fonts used",
    actual: `${fontCount} fonts`,
    expected: "2-3 fonts maximum",
    priority: "medium",
  })

  // Heading structure
  const hasH1 = extractedData.headingStructure.h1 > 0
  typographyChecks.push({
    rule: "Heading structure",
    status: hasH1 ? "pass" : "fail",
    message: hasH1 ? "Proper heading structure" : "Missing H1 tag",
    actual: hasH1 ? "H1 present" : "No H1 found",
    expected: "At least one H1 tag",
    priority: "high",
  })

  // Font size consistency
  const fontSizes = extractedData.fontSizes.length
  typographyChecks.push({
    rule: "Font size consistency",
    status: fontSizes <= 6 ? "pass" : fontSizes <= 10 ? "warning" : "fail",
    message:
      fontSizes <= 6
        ? "Good font size consistency"
        : fontSizes <= 10
          ? "Consider reducing font size variations"
          : "Too many font size variations",
    actual: `${fontSizes} different font sizes`,
    expected: "5-6 font sizes maximum",
    priority: "medium",
  })

  // Line height check
  const hasGoodLineHeight = extractedData.lineHeights.some((lh) => {
    const value = Number.parseFloat(lh)
    return !isNaN(value) && value >= 1.4 && value <= 1.8
  })

  typographyChecks.push({
    rule: "Line height",
    status: hasGoodLineHeight ? "pass" : "warning",
    message: hasGoodLineHeight
      ? "Good line height for readability"
      : "Consider adjusting line height for better readability",
    actual: extractedData.lineHeights.join(", ") || "Not specified",
    expected: "1.4 to 1.8 for body text",
    priority: "medium",
  })

  const typographyScore = Math.round(
    (typographyChecks.filter((c) => c.status === "pass").length / typographyChecks.length) * 100,
  )
  results.push({
    category: "Typography",
    score: typographyScore,
    icon: "TypeIcon",
    checks: typographyChecks,
  })

  // Colors Analysis
  const colorChecks: any[] = []

  const colorCount = extractedData.colors.length
  colorChecks.push({
    rule: "Color palette size",
    status: colorCount <= 8 ? "pass" : colorCount <= 12 ? "warning" : "fail",
    message: colorCount <= 8 ? "Good color palette" : colorCount <= 12 ? "Consider reducing colors" : "Too many colors",
    actual: `${colorCount} colors`,
    expected: "8 colors maximum",
    priority: "medium",
  })

  // Background colors consistency
  const bgColorCount = extractedData.backgroundColors.length
  colorChecks.push({
    rule: "Background color consistency",
    status: bgColorCount <= 5 ? "pass" : bgColorCount <= 8 ? "warning" : "fail",
    message:
      bgColorCount <= 5
        ? "Good background color consistency"
        : bgColorCount <= 8
          ? "Consider reducing background colors"
          : "Too many background colors",
    actual: `${bgColorCount} background colors`,
    expected: "5 background colors maximum",
    priority: "medium",
  })

  // Text colors consistency
  const textColorCount = extractedData.textColors.length
  colorChecks.push({
    rule: "Text color consistency",
    status: textColorCount <= 3 ? "pass" : textColorCount <= 5 ? "warning" : "fail",
    message:
      textColorCount <= 3
        ? "Good text color consistency"
        : textColorCount <= 5
          ? "Consider reducing text colors"
          : "Too many text colors",
    actual: `${textColorCount} text colors`,
    expected: "3 text colors maximum",
    priority: "high",
  })

  const colorScore = Math.round((colorChecks.filter((c) => c.status === "pass").length / colorChecks.length) * 100)
  results.push({
    category: "Colors",
    score: colorScore,
    icon: "Palette",
    checks: colorChecks,
  })

  // Layout Analysis
  const layoutChecks: any[] = []

  layoutChecks.push({
    rule: "Responsive design",
    status: extractedData.hasResponsiveDesign ? "pass" : "fail",
    message: extractedData.hasResponsiveDesign ? "Responsive design detected" : "No responsive design found",
    actual: extractedData.hasResponsiveDesign ? "Responsive" : "Not responsive",
    expected: "Responsive design required",
    priority: "high",
  })

  layoutChecks.push({
    rule: "Viewport meta tag",
    status: extractedData.hasViewportMeta ? "pass" : "fail",
    message: extractedData.hasViewportMeta ? "Viewport meta tag present" : "Missing viewport meta tag",
    actual: extractedData.hasViewportMeta ? "Present" : "Missing",
    expected: "Viewport meta tag required",
    priority: "high",
  })

  // Spacing consistency
  const spacingCount = extractedData.spacing.length
  layoutChecks.push({
    rule: "Spacing consistency",
    status: spacingCount <= 8 ? "pass" : spacingCount <= 12 ? "warning" : "fail",
    message:
      spacingCount <= 8
        ? "Good spacing consistency"
        : spacingCount <= 12
          ? "Consider reducing spacing variations"
          : "Too many spacing variations",
    actual: `${spacingCount} different spacing values`,
    expected: "8 spacing values maximum",
    priority: "medium",
  })

  // Border radius consistency
  const borderRadiusCount = extractedData.borderRadius.length
  layoutChecks.push({
    rule: "Border radius consistency",
    status: borderRadiusCount <= 3 ? "pass" : borderRadiusCount <= 5 ? "warning" : "fail",
    message:
      borderRadiusCount <= 3
        ? "Good border radius consistency"
        : borderRadiusCount <= 5
          ? "Consider reducing border radius variations"
          : "Too many border radius variations",
    actual: `${borderRadiusCount} different border radius values`,
    expected: "3 border radius values maximum",
    priority: "low",
  })

  const layoutScore = Math.round((layoutChecks.filter((c) => c.status === "pass").length / layoutChecks.length) * 100)
  results.push({
    category: "Layout",
    score: layoutScore,
    icon: "LayoutGrid",
    checks: layoutChecks,
  })

  // Accessibility Analysis
  const accessibilityChecks: any[] = []

  accessibilityChecks.push({
    rule: "Image alt text",
    status:
      extractedData.images.withoutAlt === 0
        ? "pass"
        : extractedData.images.withoutAlt < extractedData.images.withAlt
          ? "warning"
          : "fail",
    message:
      extractedData.images.withoutAlt === 0
        ? "All images have alt text"
        : `${extractedData.images.withoutAlt} images missing alt text`,
    actual: `${extractedData.images.withAlt}/${extractedData.images.count} with alt text`,
    expected: "All images should have alt text",
    priority: "high",
  })

  accessibilityChecks.push({
    rule: "ARIA labels",
    status: extractedData.hasAriaLabels ? "pass" : "warning",
    message: extractedData.hasAriaLabels ? "ARIA labels found" : "Consider adding ARIA labels",
    actual: extractedData.hasAriaLabels ? "Present" : "Not found",
    expected: "ARIA labels for better accessibility",
    priority: "medium",
  })

  accessibilityChecks.push({
    rule: "Semantic HTML",
    status: extractedData.hasSemanticHTML ? "pass" : "fail",
    message: extractedData.hasSemanticHTML ? "Semantic HTML elements used" : "Missing semantic HTML elements",
    actual: extractedData.hasSemanticHTML ? "Present" : "Missing",
    expected: "Use semantic HTML elements",
    priority: "high",
  })

  // Form labels
  accessibilityChecks.push({
    rule: "Form labels",
    status: extractedData.forms.count === 0 || extractedData.forms.hasLabels ? "pass" : "fail",
    message:
      extractedData.forms.count === 0
        ? "No forms found"
        : extractedData.forms.hasLabels
          ? "Forms have labels"
          : "Forms missing labels",
    actual: extractedData.forms.hasLabels ? "Present" : "Missing",
    expected: "All form fields should have labels",
    priority: "high",
  })

  const accessibilityScore = Math.round(
    (accessibilityChecks.filter((c) => c.status === "pass").length / accessibilityChecks.length) * 100,
  )
  results.push({
    category: "Accessibility",
    score: accessibilityScore,
    icon: "Accessibility",
    checks: accessibilityChecks,
  })

  // Mobile Analysis
  const mobileChecks: any[] = []

  mobileChecks.push({
    rule: "Mobile optimization",
    status: extractedData.hasResponsiveDesign && extractedData.hasViewportMeta ? "pass" : "fail",
    message:
      extractedData.hasResponsiveDesign && extractedData.hasViewportMeta
        ? "Mobile optimized"
        : "Needs mobile optimization",
    actual: extractedData.hasResponsiveDesign && extractedData.hasViewportMeta ? "Optimized" : "Not optimized",
    expected: "Mobile-first responsive design",
    priority: "high",
  })

  // Button size for mobile
  const hasLargeButtons = extractedData.buttonStyles.some((button) => {
    const padding = button.padding
    if (!padding) return false

    // Try to extract padding values
    const values = padding.split(" ").map((val: string) => Number.parseFloat(val))
    return values.some((val: number) => val >= 10) // Check if padding is at least 10px
  })

  mobileChecks.push({
    rule: "Touch target size",
    status: hasLargeButtons ? "pass" : "warning",
    message: hasLargeButtons ? "Buttons have adequate touch target size" : "Consider increasing button size for mobile",
    actual: hasLargeButtons ? "Adequate" : "May be too small",
    expected: "At least 44x44px touch targets",
    priority: "medium",
  })

  const mobileScore = Math.round((mobileChecks.filter((c) => c.status === "pass").length / mobileChecks.length) * 100)
  results.push({
    category: "Mobile",
    score: mobileScore,
    icon: "Smartphone",
    checks: mobileChecks,
  })

  // Calculate totals
  results.forEach((category) => {
    category.checks.forEach((check: any) => {
      totalChecks++
      if (check.status === "pass") {
        passedChecks++
      } else if (check.status === "warning") {
        warningChecks++
      }
    })
  })

  const failedChecks = totalChecks - passedChecks - warningChecks
  const complianceScore = Math.round(((passedChecks + warningChecks * 0.5) / totalChecks) * 100)

  return {
    complianceScore,
    totalChecks,
    passedChecks,
    failedChecks,
    warningChecks,
    results,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const { data: extractedData, screenshot } = await extractWebsiteData(url)
    const compliance = analyzeCompliance(extractedData)
    const geminiAnalysis = await analyzeWithGemini(extractedData, url)

    // Compose a standard guidelines analysis string
    const standardGuidelines = `
Standard Guidelines Analysis:
- Typography: ${compliance.results.find(r => r.category === "Typography")?.score}% - ${compliance.results.find(r => r.category === "Typography")?.checks.map(c => c.message).join("; ")}
- Colors: ${compliance.results.find(r => r.category === "Colors")?.score}% - ${compliance.results.find(r => r.category === "Colors")?.checks.map(c => c.message).join("; ")}
- Layout: ${compliance.results.find(r => r.category === "Layout")?.score}% - ${compliance.results.find(r => r.category === "Layout")?.checks.map(c => c.message).join("; ")}
- Accessibility: ${compliance.results.find(r => r.category === "Accessibility")?.score}% - ${compliance.results.find(r => r.category === "Accessibility")?.checks.map(c => c.message).join("; ")}
- Mobile: ${compliance.results.find(r => r.category === "Mobile")?.score}% - ${compliance.results.find(r => r.category === "Mobile")?.checks.map(c => c.message).join("; ")}
    `.trim();

    // Generate insights
    const performanceInsights = generatePerformanceInsights(extractedData)
    const userExperienceInsights = generateUserExperienceInsights(extractedData, compliance.results)

    return NextResponse.json({
      url,
      screenshot,
      extractedData,
      aiAnalysis: geminiAnalysis.analysis,
      recommendations: geminiAnalysis.recommendations,
      aiScore: geminiAnalysis.score,
      standardAnalysis: standardGuidelines,
      ...compliance,
      // Use actual scores from compliance where possible
      performanceScore: compliance.results.find(r => r.category === "Layout")?.score || 75,
      accessibilityScore: compliance.results.find(r => r.category === "Accessibility")?.score || 65,
      seoScore: compliance.results.find(r => r.category === "Mobile")?.score || 80,
      userExperienceScore: Math.round((
        (compliance.results.find(r => r.category === "Typography")?.score || 0) +
        (compliance.results.find(r => r.category === "Colors")?.score || 0) +
        (compliance.results.find(r => r.category === "Layout")?.score || 0)
      ) / 3),
      performanceInsights,
      userExperienceInsights,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze website. Please check the URL and try again.",
      },
      { status: 500 },
    )
  }
}