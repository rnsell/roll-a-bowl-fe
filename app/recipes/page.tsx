'use client'

import { Suspense } from 'react'
import { useSuspenseQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import type { GetRecipesQuery } from '@/lib/graphql/generated/graphql'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// ============================================================================
// GRAPHQL QUERY
// ============================================================================

/**
 * Get all recipes
 */
const GET_RECIPES = gql`
  query GetRecipes {
    recipes {
      id
      name
      slug
      instructions
      createdAt
      updatedAt
      tenantId
      userId
    }
  }
`

function RecipesList() {
  const { data } = useSuspenseQuery<GetRecipesQuery>(GET_RECIPES)

  if (!data?.recipes || data.recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No recipes found</p>
        <p className="text-muted-foreground text-sm mt-2">Get started by creating your first recipe!</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.recipes.map((recipe) => (
        <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{recipe.name}</CardTitle>
              <Badge variant="outline">{recipe.slug}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {recipe.instructions && (
              <CardDescription className="line-clamp-3 mb-4">
                {recipe.instructions}
              </CardDescription>
            )}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Created: {new Date(recipe.createdAt).toLocaleDateString()}</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/recipes/${recipe.slug}`}>View Recipe</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function RecipesPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-foreground">Roll a Bowl</h1>
          </Link>
          <div className="flex gap-4 items-center">
            <Button asChild variant="ghost">
              <Link href="/">Home</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">Recipes</h2>
          <p className="text-muted-foreground text-lg">
            Discover delicious bowl recipes
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">Loading recipes...</p>
            </div>
          }
        >
          <RecipesList />
        </Suspense>
      </div>
    </main>
  )
}
