"use server";

import { createClient } from "@/utils/supabase/server";
import type { TradePsychology, ApiError } from "@/types";

interface TradeJournalEntryParams {
  tradeId: string;
  userId: string;
  emotions: {
    preTrade: string;
    postTrade: string;
    confidenceLevel: number;
  };
  notes: string;
  lessons: string;
}

export async function createTradeJournalEntry(
  params: TradeJournalEntryParams
): Promise<TradePsychology> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("trade_psychology")
    .insert([
      {
        trade_id: params.tradeId,
        pre_trade_emotion: params.emotions.preTrade,
        post_trade_emotion: params.emotions.postTrade,
        confidence_level: params.emotions.confidenceLevel,
        notes: params.notes,
        lessons_learned: params.lessons,
      },
    ])
    .select()
    .single();

  if (error) {
    throw {
      message: error.message,
      code: "DB_ERROR",
      details: error,
    } as ApiError;
  }

  return data as TradePsychology;
}
