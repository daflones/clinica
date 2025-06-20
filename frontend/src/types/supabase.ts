// Tipos para o cliente Supabase
// Este arquivo contém as definições de tipo para o cliente Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Adicione aqui as definições de tabelas do seu banco de dados
      // Exemplo:
      // profiles: {
      //   Row: {
      //     id: string
      //     created_at: string
      //     email: string
      //     // ... outros campos
      //   }
      //   Insert: {
      //     id?: string
      //     created_at?: string
      //     email: string
      //     // ... outros campos
      //   }
      //   Update: {
      //     id?: never
      //     created_at?: never
      //     email?: string
      //     // ... outros campos
      //   }
      // }
    }
    Views: {
      // Adicione aqui as visualizações do seu banco de dados
    }
    Functions: {
      // Adicione aqui as funções do seu banco de dados
    }
    Enums: {
      // Adicione aqui os enums do seu banco de dados
    }
  }
}

// Para gerar os tipos automaticamente do seu banco Supabase, execute:
// npx supabase gen types typescript --xqdezzenxempvbgrgtik xqdezzenxempvbgrgtik > src/types/supabase.ts
