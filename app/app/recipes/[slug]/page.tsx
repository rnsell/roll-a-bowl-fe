'use client'

import { Suspense } from 'react'
import { useSuspenseQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import type { GetRecipeBySlugQuery, GetRecipeBySlugQueryVariables } from '@/lib/graphql/generated/graphql'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ============================================================================
// GRAPHQL QUERY
// ============================================================================

/**
 * Get a single recipe by slug
 */
const GET_RECIPE_BY_SLUG = gql`
  query GetRecipeBySlug($slug: String!) {
    recipe(slug: $slug) {
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

function RecipeDetail() {
  const params = useParams()
  const slug = params.slug as string
  const { data } = useSuspenseQuery<GetRecipeBySlugQuery, GetRecipeBySlugQueryVariables>(
    GET_RECIPE_BY_SLUG,
    {
      variables: { slug },
    }
  )

  if (!data?.recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Recipe not found</p>
        <Button asChild className="mt-4">
          <Link href="/app/recipes">Back to Recipes</Link>
        </Button>
      </div>
    )
  }

  const recipe = data.recipe

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div>
              <CardTitle className="text-3xl mb-2">{recipe.name}</CardTitle>
              <Badge variant="outline">{recipe.slug}</Badge>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/app/recipes/edit/${recipe.slug}`}>Edit</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/app/recipes">← Back to Recipes</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recipe.instructions ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Instructions</h3>
                <Separator className="mb-4" />
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {recipe.instructions}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No instructions available for this recipe.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RecipePage() {
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
              <Link href="/app/recipes">Recipes</Link>
            </Button>
            <Button asChild variant="default">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">Loading recipe...</p>
            </div>
          }
        >
          <RecipeDetail />
        </Suspense>
      </div>
    </main>
  )
}

