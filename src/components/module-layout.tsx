"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "./chat-interface";
import { BookOpen, MessageSquare } from "lucide-react";

interface ModuleLayoutProps {
  title: string;
  description: string;
  theoryContent: React.ReactNode;
  chatType: "domain" | "framework" | "simulation";
}

export function ModuleLayout({
  title,
  description,
  theoryContent,
  chatType,
}: ModuleLayoutProps) {
  const [activeTab, setActiveTab] = useState("theory");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom when switching to Training tab
  useEffect(() => {
    if (activeTab === "training" && chatContainerRef.current) {
      const timer = setTimeout(() => {
        const scrollArea = chatContainerRef.current?.querySelector(
          "[data-scroll-area]"
        );
        if (scrollArea) {
          scrollArea.scrollTop = scrollArea.scrollHeight;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 sm:p-4 md:p-6 pb-0 flex-shrink-0">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 md:mt-1">{description}</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden mt-4 min-h-0"
      >
        <div className="px-3 sm:px-4 md:px-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="theory" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" /> Theory
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="gap-1.5 text-xs sm:text-sm"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Training Chat
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="theory"
          className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 pb-6 mt-4 min-h-0"
        >
          {theoryContent}
        </TabsContent>

        <TabsContent
          value="training"
          className="flex-1 flex flex-col overflow-hidden mt-0 min-h-0"
          forceMount
          style={
            activeTab === "training"
              ? undefined
              : { visibility: "hidden", height: 0, overflow: "hidden", flex: "none" }
          }
        >
          <div className="flex-1 h-full min-h-0" ref={chatContainerRef}>
            <ChatInterface type={chatType} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
