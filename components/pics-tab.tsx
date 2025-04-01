"use client"

import { useState } from "react"
import { ImageIcon, Plus, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function PicsTab() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "front", name: "Front" },
    { id: "back", name: "Back" },
    { id: "side", name: "Side" },
  ]

  const progressPics = [
    { id: "1", date: "Mar 31, 2025", category: "front", thumbnail: "/placeholder.svg?height=150&width=150" },
    { id: "2", date: "Mar 15, 2025", category: "front", thumbnail: "/placeholder.svg?height=150&width=150" },
    { id: "3", date: "Mar 31, 2025", category: "back", thumbnail: "/placeholder.svg?height=150&width=150" },
    { id: "4", date: "Mar 15, 2025", category: "back", thumbnail: "/placeholder.svg?height=150&width=150" },
    { id: "5", date: "Mar 31, 2025", category: "side", thumbnail: "/placeholder.svg?height=150&width=150" },
    { id: "6", date: "Mar 15, 2025", category: "side", thumbnail: "/placeholder.svg?height=150&width=150" },
  ]

  const filteredPics =
    selectedCategory === "all" ? progressPics : progressPics.filter((pic) => pic.category === selectedCategory)

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      {/* Pics Header */}
      <div className="flex flex-col items-center space-y-2 w-full">
        <ImageIcon className="h-10 w-10" />
        <h2 className="text-2xl font-bold">Progress Photos</h2>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Add Photo Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Progress Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Photo Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Take Photo</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to take a photo or upload from gallery</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Add any notes about this photo..." />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">Save Photo</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Tabs */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-4">
            {/* Category Filter */}
            <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={selectedCategory === category.id ? "bg-primary hover:bg-primary/90" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredPics.map((pic) => (
                <Card key={pic.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={pic.thumbnail || "/placeholder.svg"}
                        alt={`Progress photo from ${pic.date}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-2 flex justify-between items-center">
                      <div className="text-xs">
                        <p className="font-medium capitalize">{pic.category}</p>
                        <p className="text-muted-foreground">{pic.date}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Category</Label>
                <Select defaultValue="front">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="side">Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Before</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mar15">Mar 15, 2025</SelectItem>
                      <SelectItem value="mar1">Mar 1, 2025</SelectItem>
                      <SelectItem value="feb15">Feb 15, 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>After</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mar31">Mar 31, 2025</SelectItem>
                      <SelectItem value="mar15">Mar 15, 2025</SelectItem>
                      <SelectItem value="mar1">Mar 1, 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="Before photo"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-2 text-center text-xs font-medium">Mar 15, 2025</div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src="/placeholder.svg?height=200&width=200"
                        alt="After photo"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-2 text-center text-xs font-medium">Mar 31, 2025</div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full">View Full Comparison</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

