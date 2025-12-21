/**
 * Settings Page
 */

'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings as SettingsIcon, Save, FileImage, Layout, Bell, Palette, Shield, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const { user } = useAuth()

  // Export Settings
  const [defaultExportFormat, setDefaultExportFormat] = useState('png')
  const [defaultExportQuality, setDefaultExportQuality] = useState('high')
  const [includeBackground, setIncludeBackground] = useState(true)

  // Canvas Defaults
  const [defaultWidth, setDefaultWidth] = useState('1920')
  const [defaultHeight, setDefaultHeight] = useState('1080')
  const [defaultBgColor, setDefaultBgColor] = useState('#000000')

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)

  // Appearance
  const [theme, setTheme] = useState('system')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('arc3d-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setDefaultExportFormat(settings.defaultExportFormat || 'png')
      setDefaultExportQuality(settings.defaultExportQuality || 'high')
      setIncludeBackground(settings.includeBackground ?? true)
      setDefaultWidth(settings.defaultWidth || '1920')
      setDefaultHeight(settings.defaultHeight || '1080')
      setDefaultBgColor(settings.defaultBgColor || '#000000')
      setEmailNotifications(settings.emailNotifications ?? true)
      setProjectUpdates(settings.projectUpdates ?? true)
      setMarketingEmails(settings.marketingEmails ?? false)
      setTheme(settings.theme || 'system')
    }
  }, [])

  const handleSaveSettings = () => {
    const settings = {
      defaultExportFormat,
      defaultExportQuality,
      includeBackground,
      defaultWidth,
      defaultHeight,
      defaultBgColor,
      emailNotifications,
      projectUpdates,
      marketingEmails,
      theme,
    }
    localStorage.setItem('arc3d-settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deletion is not yet implemented. Please contact support.')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-text-secondary">
            Manage your account preferences and application settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Export Defaults */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileImage className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Export Defaults</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="export-format">Default Format</Label>
                  <Select value={defaultExportFormat} onValueChange={setDefaultExportFormat}>
                    <SelectTrigger id="export-format">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export-quality">Quality</Label>
                  <Select value={defaultExportQuality} onValueChange={setDefaultExportQuality}>
                    <SelectTrigger id="export-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Best)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="include-background">Include Background</Label>
                  <p className="text-sm text-muted-foreground">
                    Add background color to exported images
                  </p>
                </div>
                <Switch
                  id="include-background"
                  checked={includeBackground}
                  onCheckedChange={setIncludeBackground}
                />
              </div>
            </div>
          </Card>

          {/* Canvas Defaults */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Layout className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Canvas Defaults</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default-width">Default Width (px)</Label>
                  <Input
                    id="default-width"
                    type="number"
                    value={defaultWidth}
                    onChange={(e) => setDefaultWidth(e.target.value)}
                    min="100"
                    max="7680"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default-height">Default Height (px)</Label>
                  <Input
                    id="default-height"
                    type="number"
                    value={defaultHeight}
                    onChange={(e) => setDefaultHeight(e.target.value)}
                    min="100"
                    max="4320"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-bg-color">Default Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="default-bg-color"
                    type="color"
                    value={defaultBgColor}
                    onChange={(e) => setDefaultBgColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={defaultBgColor}
                    onChange={(e) => setDefaultBgColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Common Sizes:</strong> 1920×1080 (Full HD), 1280×720 (HD), 3840×2160 (4K)
                </p>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your account
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="project-updates">Project Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when collaborators make changes
                  </p>
                </div>
                <Switch
                  id="project-updates"
                  checked={projectUpdates}
                  onCheckedChange={setProjectUpdates}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive tips, updates, and offers
                  </p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose how Arc3D looks on your device
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Privacy & Security</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Account Email</Label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-sm text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>

                <div className="p-4 border border-destructive/50 rounded-md bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        Once you delete your account, there is no going back. All your projects and data will be permanently deleted.
                      </p>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="w-full"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="gap-2">
              <Save className="w-4 h-4" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
