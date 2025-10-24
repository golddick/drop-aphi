

// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

// Dynamic CORS that allows any origin
export function withCors(json: any, req: NextRequest, status = 200) {
  const res = NextResponse.json(json, { status });
  
  // Get the origin from the request
  const origin = req.headers.get("origin");
  
  // Allow any origin
  res.headers.set("Access-Control-Allow-Origin", origin || "*");
  
  if (origin) {
    res.headers.set("Vary", "Origin");
  }
  
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, drop-aphi-key, Authorization");
  res.headers.set("Access-Control-Max-Age", "86400");
  
  return res;
}

// Preflight OPTIONS response - FIXED VERSION
export function corsOptions(req: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  
  const origin = req.headers.get("origin");
  
  // Allow any origin for preflight
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, drop-aphi-key, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  
  if (origin) {
    response.headers.set("Vary", "Origin");
  }
  
  return response;
}