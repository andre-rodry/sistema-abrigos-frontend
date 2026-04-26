import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function uploadAudio(audioBlob) {
  const fileName = `resgate_${Date.now()}.webm`
  
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(fileName, audioBlob, { contentType: 'audio/webm' })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('audios')
    .getPublicUrl(fileName)

  return urlData.publicUrl // ex: https://xxx.supabase.co/storage/v1/object/public/audios/resgate_123.webm
}