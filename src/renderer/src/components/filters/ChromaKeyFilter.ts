import { Filter, defaultFilterVert } from 'pixi.js'

const fragmentShader = `
  in vec2 vTextureCoord;
  out vec4 finalColor;
  uniform sampler2D uTexture;
  uniform vec3 uKeyColor;
  uniform float uSimilarity;
  uniform float uSmoothness;

  void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    float distance = distance(color.rgb, uKeyColor);
    
    if (distance < uSimilarity) {
      discard;
    } else if (distance < uSimilarity + uSmoothness) {
      float alpha = (distance - uSimilarity) / uSmoothness;
      finalColor = vec4(color.rgb, color.a * alpha);
    } else {
      finalColor = color;
    }
  }
`

export function createChromaKeyFilter(
  initialColor = [0.0, 1.0, 0.0],
  initialSimilarity = 0.4,
  initialSmoothness = 0.1
): Filter {
  return Filter.from({
    gl: {
      vertex: defaultFilterVert,
      fragment: fragmentShader
    },
    resources: {
      chromaUniforms: {
        uKeyColor: { value: new Float32Array(initialColor), type: 'vec3<f32>' },
        uSimilarity: { value: initialSimilarity, type: 'f32' },
        uSmoothness: { value: initialSmoothness, type: 'f32' }
      }
    }
  })
}
export type ChromaKeyFilterType = Filter & {
  resources: {
    chromaUniforms: {
      uniforms: {
        uKeyColor: { value: Float32Array }
        uSimilarity: { value: number }
        uSmoothness: { value: number }
      }
    }
  }
}
