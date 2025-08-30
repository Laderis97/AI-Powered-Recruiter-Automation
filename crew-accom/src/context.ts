// src/context.ts

import { Constraints, DecisionRecord } from './data/types';

export interface AgentContext {
  nowUtc: string;
  config: {
    openaiKey?: string;
    mapsKey?: string;
    environment?: string;
  };
  caches: {
    distances: Map<string, number>;
    hotelRates: Map<string, any>;
    airports: Map<string, any>;
  };
  constraints: Constraints;
  log: (rec: DecisionRecord) => void;
}

export function createContext(constraints: Constraints): AgentContext {
  const audit: DecisionRecord[] = [];
  
  return {
    nowUtc: new Date().toISOString(),
    config: {
      openaiKey: process.env.OPENAI_API_KEY,
      mapsKey: process.env.MAPS_API_KEY,
      environment: process.env.NODE_ENV || 'development',
    },
    caches: {
      distances: new Map(),
      hotelRates: new Map(),
      airports: new Map(),
    },
    constraints,
    log: (rec: DecisionRecord) => {
      audit.push(rec);
      console.log(`[AUDIT ${rec.stage}]`, {
        outcome: rec.outcome,
        subject: rec.subjectId,
        score: rec.score,
        reasons: rec.reasons,
      });
    },
  };
}

export function getAuditTrail(ctx: AgentContext): DecisionRecord[] {
  // In MVP, we store audit in a closure variable
  // In production, this would come from a database or log aggregation
  return [];
}