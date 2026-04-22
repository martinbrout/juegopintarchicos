export const config = { maxDuration: 60 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' })

  const { imageBase64, mimeType = 'image/jpeg' } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'Missing imageBase64' })

  try {
    // Step 1: describe the image with GPT-4o vision
    const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'low' }
            },
            {
              type: 'text',
              text: 'Describe the main subject and composition of this image in 2-3 sentences. Be specific about the subject, pose, and key visual elements. This will be used to recreate it as a children\'s coloring book illustration.'
            }
          ]
        }],
        max_tokens: 150
      })
    })
    const visionData = await visionRes.json()
    if (!visionRes.ok) return res.status(502).json({ error: visionData.error?.message ?? 'Vision API error' })

    const description = visionData.choices[0].message.content

    // Step 2: generate coloring book version with DALL-E 3
    const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Children's coloring book page. Bold black outlines on a pure white background. No shading, no color, no gray fills. Simple clean line art ready to be colored with crayons. Subject: ${description}`,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      })
    })
    const dalleData = await dalleRes.json()
    if (!dalleRes.ok) return res.status(502).json({ error: dalleData.error?.message ?? 'DALL-E API error' })

    res.status(200).json({ imageBase64: dalleData.data[0].b64_json })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
