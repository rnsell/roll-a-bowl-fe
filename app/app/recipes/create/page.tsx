'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import type { CreateRecipeMutation, CreateRecipeMutationVariables } from '@/lib/graphql/generated/graphql'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ============================================================================
// GRAPHQL MUTATION
// ============================================================================

/**
 * Create a new recipe
 */
const CREATE_RECIPE = gql`
  mutation CreateRecipe($input: CreateRecipeInput!) {
    createRecipe(input: $input) {
      id
      name
      slug
      instructions
      createdAt
      updatedAt
    }
  }
`

export default function CreateRecipePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [createRecipe, { loading }] = useMutation<CreateRecipeMutation, CreateRecipeMutationVariables>(
    CREATE_RECIPE,
    {
      onCompleted: () => {
        // Redirect to recipes list on success
        router.push('/app/recipes')
      },
      onError: (err) => {
        setError(err.message || 'Failed to create recipe')
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Recipe name is required')
      return
    }

    try {
      await createRecipe({
        variables: {
          input: {
            name: name.trim(),
            instructions: instructions.trim() || undefined,
          },
        },
      })
    } catch (err) {
      // Error handled by onError callback
    }
  }

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
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">Create Recipe</h2>
          <p className="text-muted-foreground text-lg">
            Add a new recipe to your collection
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recipe Details</CardTitle>
            <CardDescription>
              Fill in the information for your new recipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Recipe Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Mediterranean Bowl"
                  disabled={loading}
                  required
                  className="w-full"
                />
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Enter recipe instructions..."
                  disabled={loading}
                  rows={8}
                  className="w-full resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Add detailed instructions for preparing this recipe
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/app/recipes')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                >
                  {loading ? 'Creating...' : 'Create Recipe'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

