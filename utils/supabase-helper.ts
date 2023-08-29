import { createClient } from '@supabase/supabase-js';
// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {  
    auth: { persistSession: false },
  }
);

import { Document, DocumentInput } from 'langchain/document'

export class DocumentBlog extends Document implements DocumentInput {
  constructor(fields) {
    super(fields)
    this.sourceType = fields.sourceType
    this.sourceName = fields.sourceName
    this.hash = fields.hash
  }

  sourceType: string
  sourceName: string
  hash: string
  id: string
}