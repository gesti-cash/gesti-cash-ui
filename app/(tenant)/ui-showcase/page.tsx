"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/skeleton";

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">shadcn/ui Showcase</h1>
          <p className="text-muted-foreground">
            Aperçu de tous les composants UI disponibles
          </p>
        </div>

        <div className="space-y-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Différentes variantes de boutons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">🚀</Button>
              </div>
            </CardContent>
          </Card>

          {/* Inputs & Forms */}
          <Card>
            <CardHeader>
              <CardTitle>Inputs & Forms</CardTitle>
              <CardDescription>Champs de formulaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" disabled placeholder="Disabled" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textarea">Textarea</Label>
                <Textarea id="textarea" placeholder="Type your message here." />
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Badges et labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Avatars */}
          <Card>
            <CardHeader>
              <CardTitle>Avatars</CardTitle>
              <CardDescription>Avatars utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Cartes de contenu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card Description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is the card content area.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Another Card</CardTitle>
                    <CardDescription>With some content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      More card content here.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Skeletons */}
          <Card>
            <CardHeader>
              <CardTitle>Skeletons</CardTitle>
              <CardDescription>États de chargement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Separator />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Separator */}
          <Card>
            <CardHeader>
              <CardTitle>Separator</CardTitle>
              <CardDescription>Séparateurs de contenu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm">Section 1</p>
                <Separator className="my-4" />
                <p className="text-sm">Section 2</p>
                <Separator className="my-4" />
                <p className="text-sm">Section 3</p>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>Variables de couleur Tailwind</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-primary" />
                  <p className="text-xs font-medium">Primary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-secondary" />
                  <p className="text-xs font-medium">Secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-destructive" />
                  <p className="text-xs font-medium">Destructive</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-muted" />
                  <p className="text-xs font-medium">Muted</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg bg-accent" />
                  <p className="text-xs font-medium">Accent</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg border bg-card" />
                  <p className="text-xs font-medium">Card</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg border bg-popover" />
                  <p className="text-xs font-medium">Popover</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-lg border" />
                  <p className="text-xs font-medium">Border</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
