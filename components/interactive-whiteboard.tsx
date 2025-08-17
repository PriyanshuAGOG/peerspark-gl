"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Pen, Eraser, Square, Circle, Type, Undo, Redo, Download, Trash2, Palette } from "lucide-react"

interface DrawingPoint {
  x: number
  y: number
}

interface DrawingPath {
  points: DrawingPoint[]
  color: string
  width: number
  tool: "pen" | "eraser"
}

interface Shape {
  type: "rectangle" | "circle"
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  width: number
}

interface TextElement {
  x: number
  y: number
  text: string
  color: string
  fontSize: number
}

export default function InteractiveWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser" | "rectangle" | "circle" | "text">("pen")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [currentWidth, setCurrentWidth] = useState(2)
  const [paths, setPaths] = useState<DrawingPath[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [startPoint, setStartPoint] = useState<DrawingPoint | null>(null)

  const colors = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
    "#FFC0CB",
    "#A52A2A",
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all paths
    paths.forEach((path) => {
      if (path.points.length < 2) return

      ctx.beginPath()
      ctx.strokeStyle = path.color
      ctx.lineWidth = path.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
      } else {
        ctx.globalCompositeOperation = "source-over"
      }

      ctx.moveTo(path.points[0].x, path.points[0].y)
      path.points.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })
      ctx.stroke()
    })

    // Draw all shapes
    shapes.forEach((shape) => {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = shape.color
      ctx.lineWidth = shape.width
      ctx.fillStyle = "transparent"

      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY)
      } else if (shape.type === "circle") {
        const centerX = (shape.startX + shape.endX) / 2
        const centerY = (shape.startY + shape.endY) / 2
        const radius = Math.sqrt(Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)) / 2

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.stroke()
      }
    })

    // Draw all text elements
    textElements.forEach((textEl) => {
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = textEl.color
      ctx.font = `${textEl.fontSize}px Arial`
      ctx.fillText(textEl.text, textEl.x, textEl.y)
    })
  }, [paths, shapes, textElements])

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    setIsDrawing(true)
    setStartPoint(pos)

    if (currentTool === "pen" || currentTool === "eraser") {
      const newPath: DrawingPath = {
        points: [pos],
        color: currentColor,
        width: currentWidth,
        tool: currentTool,
      }
      setPaths((prev) => [...prev, newPath])
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const pos = getMousePos(e)

    if (currentTool === "pen" || currentTool === "eraser") {
      setPaths((prev) => {
        const newPaths = [...prev]
        const currentPath = newPaths[newPaths.length - 1]
        if (currentPath) {
          currentPath.points.push(pos)
        }
        return newPaths
      })
    }
  }

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return

    const pos = getMousePos(e)
    setIsDrawing(false)

    if (currentTool === "rectangle" || currentTool === "circle") {
      const newShape: Shape = {
        type: currentTool,
        startX: startPoint.x,
        startY: startPoint.y,
        endX: pos.x,
        endY: pos.y,
        color: currentColor,
        width: currentWidth,
      }
      setShapes((prev) => [...prev, newShape])
    }

    setStartPoint(null)
    saveToHistory()
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "text") {
      const pos = getMousePos(e)
      const text = prompt("Enter text:")
      if (text) {
        const newTextElement: TextElement = {
          x: pos.x,
          y: pos.y,
          text,
          color: currentColor,
          fontSize: 16,
        }
        setTextElements((prev) => [...prev, newTextElement])
        saveToHistory()
      }
    }
  }

  const saveToHistory = () => {
    const currentState = {
      paths: [...paths],
      shapes: [...shapes],
      textElements: [...textElements],
    }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setPaths(prevState.paths)
      setShapes(prevState.shapes)
      setTextElements(prevState.textElements)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setPaths(nextState.paths)
      setShapes(nextState.shapes)
      setTextElements(nextState.textElements)
      setHistoryIndex(historyIndex + 1)
    }
  }

  const clearCanvas = () => {
    setPaths([])
    setShapes([])
    setTextElements([])
    saveToHistory()
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = "whiteboard.png"
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1">
              <Button
                variant={currentTool === "pen" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("pen")}
              >
                <Pen className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("eraser")}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "rectangle" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("rectangle")}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "circle" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("circle")}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant={currentTool === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("text")}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Colors */}
            <div className="flex items-center gap-1">
              <Palette className="h-4 w-4 text-muted-foreground" />
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setCurrentColor(color)}
                />
              ))}
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={currentWidth}
                onChange={(e) => setCurrentWidth(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-6">{currentWidth}</span>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadCanvas}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <div className="flex-1 border rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onClick={handleCanvasClick}
          style={{ touchAction: "none" }}
        />
      </div>
    </div>
  )
}
