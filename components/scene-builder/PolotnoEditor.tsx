"use client"

import { useEffect, useRef } from 'react'
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { PagesTimeline } from 'polotno/pages-timeline'
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons'
import { SidePanel } from 'polotno/side-panel'
import { Workspace } from 'polotno/canvas/workspace'
import { createStore } from 'polotno/model/store'
import type { StoreType } from 'polotno/model/store'

interface PolotnoEditorProps {
  onStoreReady?: (store: StoreType) => void
  initialData?: any
}

export function PolotnoEditor({ onStoreReady, initialData }: PolotnoEditorProps) {
  const storeRef = useRef<StoreType | null>(null)

  useEffect(() => {
    // Create store with API key (free tier with watermark)
    const store = createStore({
      key: 'nFA5H9elEytDyPyvKL7T', // Free demo key from Polotno docs
      showCredit: true, // Show "Made with Polotno" watermark (required for free tier)
    })

    // Add initial page if no data provided
    if (!initialData) {
      store.addPage()
    } else {
      // Load existing data
      try {
        store.loadJSON(initialData)
      } catch (error) {
        console.error('Failed to load Polotno data:', error)
        store.addPage() // Fallback to empty page
      }
    }

    storeRef.current = store

    // Notify parent that store is ready
    if (onStoreReady) {
      onStoreReady(store)
    }

    // Cleanup
    return () => {
      // Note: Polotno doesn't have a destroy method, store will be garbage collected
    }
  }, []) // Only run once on mount

  // Load new data when initialData changes (for scene switching)
  useEffect(() => {
    if (storeRef.current && initialData) {
      try {
        storeRef.current.loadJSON(initialData)
      } catch (error) {
        console.error('Failed to load new Polotno data:', error)
      }
    }
  }, [initialData])

  if (!storeRef.current) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading Polotno editor...</div>
      </div>
    )
  }

  return (
    <PolotnoContainer style={{ width: '100%', height: '100%' }}>
      <SidePanelWrap>
        <SidePanel store={storeRef.current} />
      </SidePanelWrap>
      <WorkspaceWrap>
        <Toolbar store={storeRef.current} downloadButtonEnabled />
        <Workspace store={storeRef.current} />
        <ZoomButtons store={storeRef.current} />
        <PagesTimeline store={storeRef.current} />
      </WorkspaceWrap>
    </PolotnoContainer>
  )
}
