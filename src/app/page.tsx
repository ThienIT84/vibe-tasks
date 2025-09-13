'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function Home() {
  const [result, setResult] = useState<string>("Chưa kiểm tra")
  const ping = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      setResult(JSON.stringify({ hasSession: !!data.session }, null, 2))
      toast.success("Kết nối Supabase OK")
    } catch (e: any) {
      setResult(`Lỗi: ${e?.message ?? "unknown"}`)
      toast.error("Ping Supabase thất bại")
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Vibe Tasks — Health Check</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p>Nhấn nút dưới đây để kiểm tra kết nối tới Supabase.</p>
        <Button onClick={ping}>Ping Supabase</Button>
        <pre className="rounded-md bg-muted p-3 text-sm overflow-x-auto">{result}</pre>
      </CardContent>
    </Card>
  )
}
