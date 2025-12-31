/**
 * Model Analysis Utilities
 *
 * Functions to analyze 3D model files for textures, animations, and other metadata.
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export interface ModelAnalysis {
  hasTextures: boolean
  hasAnimations: boolean
  textureCount: number
  animationCount: number
  materialCount: number
}

/**
 * Analyze a 3D model file for textures and animations
 */
export async function analyze3DModel(file: File): Promise<ModelAnalysis> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    const url = URL.createObjectURL(file)

    loader.load(
      url,
      (gltf) => {
        // Clean up object URL
        URL.revokeObjectURL(url)

        // Analyze textures by checking materials
        let textureCount = 0
        const materials = new Set<any>()

        gltf.scene.traverse((child: any) => {
          if (child.material) {
            const material = child.material
            if (Array.isArray(material)) {
              material.forEach(mat => materials.add(mat))
            } else {
              materials.add(material)
            }
          }
        })

        // Count textures in materials
        materials.forEach((material: any) => {
          // Check common texture properties
          const textureProperties = [
            'map',           // Base color
            'normalMap',     // Normal map
            'roughnessMap',  // Roughness
            'metalnessMap',  // Metalness
            'emissiveMap',   // Emissive
            'aoMap',         // Ambient occlusion
            'alphaMap',      // Alpha
            'displacementMap', // Displacement
            'envMap',        // Environment
          ]

          textureProperties.forEach(prop => {
            if (material[prop]) {
              textureCount++
            }
          })
        })

        // Analyze animations
        const animationCount = gltf.animations?.length || 0

        const analysis: ModelAnalysis = {
          hasTextures: textureCount > 0,
          hasAnimations: animationCount > 0,
          textureCount,
          animationCount,
          materialCount: materials.size,
        }

        resolve(analysis)
      },
      undefined,
      (error) => {
        URL.revokeObjectURL(url)
        reject(new Error(`Failed to analyze model: ${error.message}`))
      }
    )
  })
}

/**
 * Analyze a model from a URL
 */
export async function analyze3DModelFromUrl(url: string): Promise<ModelAnalysis> {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()

    loader.load(
      url,
      (gltf) => {
        // Analyze textures
        let textureCount = 0
        const materials = new Set<any>()

        gltf.scene.traverse((child: any) => {
          if (child.material) {
            const material = child.material
            if (Array.isArray(material)) {
              material.forEach(mat => materials.add(mat))
            } else {
              materials.add(material)
            }
          }
        })

        materials.forEach((material: any) => {
          const textureProperties = [
            'map', 'normalMap', 'roughnessMap', 'metalnessMap',
            'emissiveMap', 'aoMap', 'alphaMap', 'displacementMap', 'envMap',
          ]

          textureProperties.forEach(prop => {
            if (material[prop]) {
              textureCount++
            }
          })
        })

        // Analyze animations
        const animationCount = gltf.animations?.length || 0

        const analysis: ModelAnalysis = {
          hasTextures: textureCount > 0,
          hasAnimations: animationCount > 0,
          textureCount,
          animationCount,
          materialCount: materials.size,
        }

        resolve(analysis)
      },
      undefined,
      (error) => {
        reject(new Error(`Failed to analyze model: ${error.message}`))
      }
    )
  })
}
